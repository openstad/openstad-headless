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

    cy.get('input#search').should('exist');
    cy.get('select#sortField').should('exist');
    cy.get('input#locationField').should('exist');
    cy.get('[test-id="filter-reset-button"]')
      .eq(0)
      .should('exist')
      .contains('Reset');
    cy.get('[test-id="filter-apply-button"]').should('exist').contains('Apply');
  });
});
