import '../../../enquete/src/enquete.scss';
import SwipeField from '../../src/swipe';

describe('<SwipeField /> a11y', () => {
  beforeEach(() => {
    cy.mount(
      <SwipeField
        {...({
          fieldKey: 'test',
          showButtons: true,
          cards: [{ id: '1', title: 'First card' }],
        } as any)}
      />
    );
  });

  it('names the answer buttons after their visible text', () => {
    [
      { selector: '.swipe-btn-pass', text: 'Oneens' },
      { selector: '.swipe-btn-like', text: 'Eens' },
    ].forEach(({ selector, text }) => {
      cy.get(selector)
        .should('not.have.attr', 'aria-label')
        .and('contain.text', text);
      cy.get(`${selector} i`).should('have.attr', 'aria-hidden', 'true');
    });
  });
});
