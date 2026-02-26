import React from 'react';

import { Icon } from '../../src/icon';

describe('<Icon />', () => {
  it('renders', () => {
    // see: https://on.cypress.io/mounting-react
    cy.mount(<Icon icon={'icon'} />);
  });
});
