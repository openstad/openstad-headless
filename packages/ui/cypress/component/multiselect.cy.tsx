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
    cy.get('.multiselect-container label').eq(0).click();
    cy.get('.multiselect-container input[type="checkbox"]').eq(2).click();
    cy.get('@onItemSelected').should('have.been.calledWith', 'option3');
  });

  // Regressie (audit 24994): het label is gekoppeld via for/id, dus een klik
  // erop klikt óók de checkbox. Dat mag maar één selectie opleveren.
  it('selects exactly once when the label is clicked', () => {
    const onItemSelected = cy.stub().as('onItemSelected');

    cy.mount(
      <MultiSelect
        id="themas"
        options={[{ value: 'option1', label: 'Option 1' }]}
        onItemSelected={onItemSelected}
      />
    );

    cy.get('button[test-id="multi-select-button"]').click();
    cy.contains('label', 'Option 1').click();
    cy.get('@onItemSelected').should('have.been.calledOnceWith', 'option1');
  });
});
