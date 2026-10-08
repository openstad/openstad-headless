// Requires MULTI_PROJECT_LOGIN=true on the api-server and auth-server
// (set in docker-compose.e2e.yml). Builds its own project, so it runs on an
// empty installation.
const apiUrl = () => Cypress.expose('API_URL');
const adminUrl = () => Cypress.expose('ADMIN_URL');

const apiRequest = (method, path, body) =>
  cy.request({
    method,
    url: `${apiUrl()}${path}`,
    body,
    headers: { Authorization: Cypress.expose('API_FIXED_AUTH_KEY') },
  });

const waitForUniqueCode = (projectId, attempts = 20) =>
  apiRequest('GET', `/auth/project/${projectId}/uniquecode?useAuth=openstad`)
    .its('body')
    .then((body) => {
      if (body.total > 0) return body.data[0].code;
      if (attempts <= 1) throw new Error('No unique code generated');
      cy.wait(500);
      return waitForUniqueCode(projectId, attempts - 1);
    });

describe('Multi-project login: first login through a popup', () => {
  const run = Date.now();
  const hostPage = () => `${adminUrl()}/e2e-multi-project-login-${run}`;
  let projectId;
  let resourceId;
  let widgetId;
  let code;

  before(() => {
    // UniqueCode-only client, so the jwt for the simulated popup message can
    // be obtained through the public uniquecode-login endpoint
    apiRequest('POST', '/api/project', {
      name: `e2e multi-project login ${run}`,
      config: {
        allowedDomains: [new URL(adminUrl()).host],
        auth: {
          provider: {
            openstad: {
              name: `e2e multi-project login ${run}`,
              adapter: 'openstad',
              authTypes: ['UniqueCode'],
              requiredUserFields: [],
            },
          },
        },
        votes: {
          isActive: true,
          isViewable: true,
          requiredUserRole: 'member',
          voteType: 'likes',
        },
      },
    })
      .then(({ body }) => {
        projectId = body.id;
        return apiRequest(
          'POST',
          `/auth/project/${projectId}/uniquecode?useAuth=openstad`,
          { amount: 1 }
        );
      })
      .then(() => waitForUniqueCode(projectId))
      .then((uniqueCode) => {
        code = uniqueCode;
        return apiRequest('POST', `/api/project/${projectId}/resource`, {
          title: 'E2E popup login',
          summary: 'Inzending voor de popup-login test',
          description:
            'Deze inzending bestaat alleen voor de end-to-end test van de eerste login via een popupvenster. De test liket haar na een gesimuleerde login.',
          publishDate: new Date().toISOString(),
        });
      })
      .then(({ body }) => {
        resourceId = body.id;
        return apiRequest('POST', `/api/project/${projectId}/widgets`, {
          type: 'likes',
          description: 'e2e popup login',
        });
      })
      .then(({ body }) => {
        widgetId = body.id;
        return apiRequest(
          'PUT',
          `/api/project/${projectId}/widgets/${widgetId}`,
          { config: { resourceId: String(resourceId) } }
        );
      });
  });

  it('opens the popup within the click and registers the like after the login message', () => {
    cy.intercept('GET', hostPage(), {
      headers: { 'content-type': 'text/html' },
      body: `<!doctype html><html lang="nl"><head><title>e2e</title></head><body><script src="${apiUrl()}/widget/${widgetId}"></script></body></html>`,
    });
    // Keep the real auth-server login out of the stubbed popup
    cy.intercept('GET', `${apiUrl()}/auth/project/*/login*`, {
      headers: { 'content-type': 'text/html' },
      body: '<!doctype html><title>login</title>',
    }).as('popupLogin');
    cy.intercept('POST', `${apiUrl()}/api/project/*/vote*`).as('vote');

    let popup;
    let openedInClick;
    cy.visit(hostPage(), {
      onBeforeLoad(win) {
        win.localStorage.clear();
        // A real window is needed as message source; a hidden iframe stands in.
        // window.event is only the click while it is being dispatched, so a
        // call after an await records false (popup blockers would block it)
        cy.stub(win, 'open')
          .as('windowOpen')
          .callsFake(() => {
            const frame = win.document.createElement('iframe');
            frame.style.display = 'none';
            win.document.body.appendChild(frame);
            popup = frame.contentWindow;
            openedInClick = win.event?.type === 'click';
            return popup;
          });
      },
    });

    cy.get('button[aria-pressed]').first().should('be.visible').click();

    cy.get('@windowOpen').should('have.been.calledOnce');
    cy.get('@windowOpen').its('firstCall.args.0').should('eq', 'about:blank');
    cy.then(() => expect(openedInClick, 'opened within the click').to.be.true);
    cy.wait('@popupLogin')
      .its('request.url')
      .should((url) => {
        expect(new URL(url).searchParams.get('popup')).to.eq('1');
      });

    cy.request(
      'POST',
      `${apiUrl()}/auth/project/${projectId}/uniquecode-login?useAuth=default`,
      { code }
    ).then(({ body }) => {
      expect(body.jwt).to.be.a('string');
      cy.window().then((win) => {
        win.dispatchEvent(
          new win.MessageEvent('message', {
            data: { type: 'openstad-login', projectId, jwt: body.jwt },
            origin: new URL(apiUrl()).origin,
            source: popup,
          })
        );
      });
    });

    cy.wait('@vote').its('response.statusCode').should('eq', 200);
    cy.get('button[aria-pressed="true"]').should('exist');
    apiRequest(
      'GET',
      `/api/project/${projectId}/resource/${resourceId}?includeVoteCount=1`
    )
      .its('body.yes')
      .should('eq', 1);
  });
});
