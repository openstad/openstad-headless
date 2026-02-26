import React from 'react';

import { Card } from '../../src/card';

describe('<Card />', () => {
  it('renders', () => {
    // see: https://on.cypress.io/mounting-react
    cy.mount(<Card />);
  });
});
