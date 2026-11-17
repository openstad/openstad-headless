import '../../../enquete/src/enquete.scss';
import DilemmaField from '../../src/dilemma';

const option = { title: 'Option', description: 'Description', image: '' };

const mountWithInfo = (infoField: string) =>
  cy.mount(
    <DilemmaField
      {...({
        fieldKey: 'dilemma',
        title: 'Dilemma',
        dilemmas: [
          {
            id: '1',
            title: 'First dilemma',
            infoField,
            a: option,
            b: option,
          },
        ],
      } as any)}
    />
  );

describe('<DilemmaField />', () => {
  it('renders without crashing', () => {
    cy.mount(<DilemmaField {...({} as any)} />);
  });

  describe('with image-only extra info', () => {
    it('still shows the Info button', () => {
      mountWithInfo('<p><img src="x.png" alt="Plan"></p>');
      cy.get('.dilemma-info-button').should('exist');
    });
  });

  describe('with extra info', () => {
    beforeEach(() => mountWithInfo('<p>Extra explanation</p>'));

    it('shows the panel after clicking Info', () => {
      cy.get('.dilemma-info-field').should('have.attr', 'aria-hidden', 'true');
      cy.get('.dilemma-info-button').click();
      cy.get('.dilemma-info-field')
        .should('have.attr', 'aria-hidden', 'false')
        .and('have.css', 'opacity', '1')
        .and('contain.text', 'Extra explanation');
    });

    it('closes the panel with "Snap ik"', () => {
      cy.get('.dilemma-info-button').click();
      cy.contains('.dilemma-info-field button', 'Snap ik').click();
      cy.get('.dilemma-info-field').should('have.attr', 'aria-hidden', 'true');
    });

    it('closes the panel on overlay click but not on card click', () => {
      cy.get('.dilemma-info-button').click();
      cy.get('.dilemma-info-field .info-card-container p').first().click();
      cy.get('.dilemma-info-field').should('have.attr', 'aria-hidden', 'false');
      cy.get('.dilemma-info-field').click('topLeft', { force: true });
      cy.get('.dilemma-info-field').should('have.attr', 'aria-hidden', 'true');
    });
  });

  [
    ['empty string', ''],
    ['spaces', '   '],
    ['empty paragraph', '<p></p>'],
    ['paragraph with &nbsp;', '<p>&nbsp;</p>'],
    ['numeric nbsp entity', '&#160;'],
  ].forEach(([label, value]) => {
    it(`renders no Info button or panel for ${label}`, () => {
      mountWithInfo(value);
      cy.get('.dilemma-skip-button').should('exist');
      cy.get('.dilemma-info-button').should('not.exist');
      cy.get('.dilemma-info-field').should('not.exist');
    });
  });
});
