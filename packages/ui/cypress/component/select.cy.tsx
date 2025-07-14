import React from 'react'
import { Select } from '../../src/select'

describe('<Select />', () => {
  it('renders', () => {
    // see: https://on.cypress.io/mounting-react
    cy.mount(
      <Select/>
    )
  });

  it('renders with options', () => {
    cy.mount(<Select
      options={[
        { value: 'option1', label: 'Option 1' },
        { value: 'option2', label: 'Option 2' },
        { value: 'option3', label: 'Option 3' }
      ]}
      disableDefaultOption={true}
    />);

    cy.get('select').should('exist');
    cy.get('select option').should('have.length', 3);
    cy.get('select option').eq(0).contains('Option 1');
    cy.get('select option').eq(2).contains('Option 3');
  });
});
