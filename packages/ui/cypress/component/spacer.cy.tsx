import React from 'react';

import { Spacer } from '../../src/spacer';

describe('<Spacer />', () => {
  it('renders', () => {
    // see: https://on.cypress.io/mounting-react
    cy.mount(<Spacer />);
  });
});
