import React from 'react'
import { Paginator } from '../../src/paginator'

describe('<Paginator />', () => {
  it('renders', () => {
    // see: https://on.cypress.io/mounting-react
    cy.mount(
      <Paginator />
    )
  });

  it('renders and call onPageChange', () => {
    const onPageChange = cy.stub().as('onPageChange')
    cy.mount(
      <Paginator
        onPageChange={onPageChange}
        page={0}
        totalPages={2}
      />
    )

    cy.get('.osc-paginator').should('exist')

    cy.get('[test-id="previous-page-button"]').should('exist').should('be.disabled');
    cy.get('[test-id="next-page-button"]').should('exist').should('not.be.disabled').click();

    cy.get('[test-id="page-button-0"]').should('exist').should('be.disabled');
    cy.get('[test-id="page-button-1"]').should('exist').should('not.be.disabled');

    cy.get('@onPageChange').should('have.been.calledWith', 1);
  });
});
