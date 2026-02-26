import React from 'react';

import { Separator } from '../../src/separator';

describe('<Separator />', () => {
  it('renders', () => {
    // see: https://on.cypress.io/mounting-react
    cy.mount(<Separator />);
  });
});
