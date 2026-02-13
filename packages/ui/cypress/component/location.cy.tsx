import React from 'react';

import PostcodeAutoFill from '../../src/location';

describe('<PostcodeAutoFill />', () => {
  it('renders', () => {
    // see: https://on.cypress.io/mounting-react
    const onValueChange = cy.stub().as('onValueChange');

    cy.mount(<PostcodeAutoFill onValueChange={onValueChange} />);

    cy.get('.postcode-autofill').should('exist');
  });
});
