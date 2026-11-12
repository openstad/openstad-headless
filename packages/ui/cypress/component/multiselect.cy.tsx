import React from 'react';

import { MultiSelect } from '../../src/multiselect';

describe('<MultiSelect />', () => {
  it('renders', () => {
    // see: https://on.cypress.io/mounting-react
    cy.mount(<MultiSelect />);
  });

  it('renders with options and allows selection', () => {
    const onItemSelected = cy.stub().as('onItemSelected');

    cy.mount(
      <MultiSelect
        options={[
          { value: 'option1', label: 'Option 1' },
          { value: 'option2', label: 'Option 2' },
          { value: 'option3', label: 'Option 3' },
        ]}
        onItemSelected={onItemSelected}
      />
    );

    cy.get('.multi-select').should('exist');
    cy.get('.multi-select button[test-id="multi-select-button"]')
      .should('exist')
      .click();
    cy.get('.multiselect-container > div').should('have.length', 3);
    cy.get('.multiselect-container > div').eq(0).click();
    cy.get('.multiselect-container > div').eq(2).click();
    cy.get('@onItemSelected').should('have.been.calledWith', 'option3');
  });

  it('clicking only the option label text selects it exactly once', () => {
    // Regression test: a <label htmlFor> pointing at the checkbox made the
    // browser forward a second, synthetic click to the checkbox, which also
    // bubbled to the row's onClick and double-fired onItemSelected, toggling
    // the option back off in the same click.
    const onItemSelected = cy.stub().as('onItemSelected');

    cy.mount(
      <MultiSelect
        id="test-multiselect"
        options={[{ value: 'option1', label: 'Option 1' }]}
        onItemSelected={onItemSelected}
      />
    );

    cy.get('.multi-select button[test-id="multi-select-button"]').click();
    cy.contains('label', 'Option 1').click();
    cy.get('@onItemSelected').should('have.been.calledOnce');
    cy.get('@onItemSelected').should(
      'have.been.calledWith',
      'option1',
      'Option 1'
    );
  });
});
