import React from 'react'
import { ProgressBar } from '../../src/progressbar'

describe('<ProgressBar />', () => {
  it('renders', () => {
    // see: https://on.cypress.io/mounting-react
    cy.mount(
      <ProgressBar/>
    )
  });

  it('renders with specific progress value', () => {
    // see: https://on.cypress.io/mounting-react
    cy.mount(
      <ProgressBar progress={64}/>
    )

    cy.get('.progressbar-tracker').should('exist').should('have.attr', 'value', '64');
  });
});
