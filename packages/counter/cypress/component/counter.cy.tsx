import React from 'react';

import { Counter } from '../../src/counter';

describe('<Counter />', () => {
  it('renders', () => {
    cy.mount(<Counter />);
  });

  it('renders with a static count', () => {
    cy.mount(<Counter amount={123} counterType="static" label="Count" />);

    cy.get('.amount').should('contain', '123');
    cy.get('.label').should('contain', 'Count');
  });
});
