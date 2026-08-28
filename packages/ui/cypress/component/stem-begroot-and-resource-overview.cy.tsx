import React from 'react';

import { Filters } from '../../src/stem-begroot-and-resource-overview/filter';

describe('<Filters />', () => {
  it('renders', () => {
    // see: https://on.cypress.io/mounting-react
    cy.mount(<Filters />);
  });

  it('renders filters', () => {
    // see: https://on.cypress.io/mounting-react
    cy.mount(
      <Filters
        displayTagFilters={true}
        displaySearch={true}
        displaySorting={true}
        displayLocationFilter={true}
        resetText={'Reset'}
        applyText={'Apply'}
      />
    );

    // id's zijn gegenereerde useId()'s (uniek per instance, 1.3.1) — selecteer op
    // class/attribuut i.p.v. op vaste id's
    cy.get('input.osc-filter-search-bar').should('exist');
    cy.get('select').should('exist');
    cy.get('input[autocomplete="postal-code"]').should('exist');
    cy.get('[test-id="filter-reset-button"]')
      .eq(0)
      .should('exist')
      .contains('Reset');
    cy.get('[test-id="filter-apply-button"]').should('exist').contains('Apply');
  });

  // Twee filters op één pagina (inzending-detail / inzendingen-overzicht) mochten
  // elkaars id's niet meer overschrijven — WCAG 1.3.1 uit de audit van 16-07-2026.
  it('geeft elk id maar één keer uit bij twee filters op één pagina', () => {
    const filterProps = {
      displayTagFilters: true,
      displaySearch: true,
      displaySorting: true,
      displayLocationFilter: true,
      displayCollapsibleFilter: true,
      resetText: 'Reset',
      applyText: 'Apply',
    };

    cy.mount(
      <div>
        <Filters {...filterProps} />
        <Filters {...filterProps} />
      </div>
    );

    cy.get('[id]').then(($els) => {
      const ids = [...$els].map((el) => el.id);
      expect(ids.length).to.be.greaterThan(0);
      expect(new Set(ids).size, `dubbele id's: ${ids}`).to.eq(ids.length);
    });
  });
});
