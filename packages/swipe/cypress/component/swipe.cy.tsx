import '../../../enquete/src/enquete.scss';
import SwipeField from '../../src/swipe';

const mountWithInfo = (infoField?: string) =>
  cy.mount(
    <SwipeField
      {...({
        fieldKey: 'test',
        showButtons: true,
        cards: [{ id: '1', title: 'First card', infoField }],
      } as any)}
    />
  );

describe('<SwipeField />', () => {
  it('renders without crashing', () => {
    cy.mount(<SwipeField {...({ fieldKey: 'test' } as any)} />);
  });

  it('shows the Info button and opens the panel when the card has info', () => {
    mountWithInfo('Extra explanation');
    cy.get('.swipe-info-btn').click();
    cy.get('.info-card')
      .should('have.attr', 'aria-hidden', 'false')
      .and('contain.text', 'Extra explanation');
  });

  [undefined, '', '   ', ' '].forEach((value) => {
    it(`renders no Info button for infoField ${JSON.stringify(value)}`, () => {
      mountWithInfo(value);
      cy.get('.swipe-skip-btn').should('exist');
      cy.get('.swipe-info-btn').should('not.exist');
      cy.get('.info-card').should('not.exist');
    });
  });
});
