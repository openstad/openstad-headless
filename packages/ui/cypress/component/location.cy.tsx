import React from 'react';

import PostcodeAutoFill from '../../src/location';

describe('<PostcodeAutoFill />', () => {
  it('renders', () => {
    // see: https://on.cypress.io/mounting-react
    const onValueChange = cy.stub().as('onValueChange');

    cy.mount(<PostcodeAutoFill onValueChange={onValueChange} />);

    cy.get('.postcode-autofill').should('exist');
  });

  it('offers an "Onbeperkt" radius option that is not selected by default', () => {
    const onValueChange = cy.stub().as('onValueChange');

    cy.mount(<PostcodeAutoFill onValueChange={onValueChange} />);

    cy.get('select').find('option').contains('Onbeperkt').should('exist');
    cy.get('select').should('not.have.value', '0');

    cy.get('select').select('Onbeperkt');
    cy.get('select').should('have.value', '0');
  });
});
