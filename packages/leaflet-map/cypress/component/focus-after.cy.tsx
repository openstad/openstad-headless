import React from 'react';

import { focusFirstTabbableAfter } from '../../src/lib/focus-after';

// Audit 24984: the skip link must not move focus to an empty/invisible element,
// but to the first tabbable element after the map.
describe('focusFirstTabbableAfter', () => {
  it('focuses the first visible, tabbable element after the marker', () => {
    cy.mount(
      <div>
        <button>before the map</button>
        <div id="marker" tabIndex={-1} />
        <button hidden>hidden</button>
        <div aria-hidden="true">
          <button>aria-hidden</button>
        </div>
        <a>no href</a>
        <button disabled>disabled</button>
        <button id="next">after the map</button>
      </div>
    );

    cy.get('#marker').then(($m) => focusFirstTabbableAfter($m[0]));
    cy.focused().should('have.id', 'next');
  });

  it('falls back to the marker when nothing follows', () => {
    cy.mount(
      <div>
        <button>before the map</button>
        <div id="marker" tabIndex={-1} />
      </div>
    );

    cy.get('#marker').then(($m) => focusFirstTabbableAfter($m[0]));
    cy.focused().should('have.id', 'marker');
  });
});
