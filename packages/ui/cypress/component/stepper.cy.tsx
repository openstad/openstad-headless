import React from 'react'
import { Stepper } from '../../src/stepper'

describe('<Stepper />', () => {
  it('renders with steps', () => {
    // see: https://on.cypress.io/mounting-react
    cy.mount(
      <Stepper steps={[
        "Step 1",
        "Step 2",
        "Step 3",
        "Step 4",
        "Step 5",
        "Step 6",
      ]}
      isSimpleView={false}
      />
    )

    cy.get('.step-container').should('have.length', 6)
  });

});
