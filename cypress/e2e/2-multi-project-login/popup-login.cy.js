const apiUrl = () => Cypress.expose('API_URL');
const adminUrl = () => Cypress.expose('ADMIN_URL');

const apiRequest = (method, path, body, { failOnStatusCode = true } = {}) =>
  cy.request({
    method,
    url: `${apiUrl()}${path}`,
    body,
    failOnStatusCode,
    headers: { Authorization: Cypress.expose('API_FIXED_AUTH_KEY') },
  });

const deleteProjectOnceAnonymized = (projectId, attempts = 20) =>
  apiRequest('DELETE', `/api/project/${projectId}`, undefined, {
    failOnStatusCode: false,
  }).then(({ status }) => {
    if (status === 200) return;
    if (attempts <= 1) throw new Error(`Project ${projectId} was not deleted`);
    cy.wait(500);
    return deleteProjectOnceAnonymized(projectId, attempts - 1);
  });

const waitForUniqueCode = (projectId, attempts = 20) =>
  apiRequest('GET', `/auth/project/${projectId}/uniquecode?useAuth=openstad`)
    .its('body')
    .then((body) => {
      if (body.total > 0 && body.data?.length > 0) return body.data[0].code;
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

  after(() => {
    if (!projectId) return;
    apiRequest('PUT', `/api/project/${projectId}`, {
      config: { project: { projectHasEnded: true } },
    })
      .then(() =>
        apiRequest(
          'PUT',
          `/api/project/${projectId}/do-anonymize-all-users`,
          {}
        )
      )
      .then(() => deleteProjectOnceAnonymized(projectId));
  });

  it('opens the popup within the click and registers the like after the login message', () => {
    cy.intercept('GET', hostPage(), {
      headers: { 'content-type': 'text/html' },
      body: `<!doctype html><html lang="nl"><head><title>e2e</title></head><body><script src="${apiUrl()}/widget/${widgetId}"></script></body></html>`,
    });
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
        cy.stub(win, 'open')
          .as('windowOpen')
          .callsFake(() => {
            const popupStandIn = win.document.createElement('iframe');
            popupStandIn.style.display = 'none';
            win.document.body.appendChild(popupStandIn);
            popup = popupStandIn.contentWindow;
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
