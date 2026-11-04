import React from 'react';

import { focusFirstTabbableAfter } from '../../src/lib/focus-after';

// Audit 24984: de skiplink mag de focus niet op een leeg/onzichtbaar element
// zetten, maar op het eerstvolgende tabbare element na de kaart.
describe('focusFirstTabbableAfter', () => {
  it('focust het eerstvolgende zichtbare, tabbare element na de marker', () => {
    cy.mount(
      <div>
        <button>voor de kaart</button>
        <div id="marker" tabIndex={-1} />
        <button hidden>verborgen</button>
        <div aria-hidden="true">
          <button>aria-hidden</button>
        </div>
        <a>geen href</a>
        <button disabled>uitgeschakeld</button>
        <button id="next">na de kaart</button>
      </div>
    );

    cy.get('#marker').then(($m) => focusFirstTabbableAfter($m[0]));
    cy.focused().should('have.id', 'next');
  });

  it('valt terug op de marker als er niets meer volgt', () => {
    cy.mount(
      <div>
        <button>voor de kaart</button>
        <div id="marker" tabIndex={-1} />
      </div>
    );

    cy.get('#marker').then(($m) => focusFirstTabbableAfter($m[0]));
    cy.focused().should('have.id', 'marker');
  });
});
