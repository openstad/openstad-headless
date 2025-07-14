import React from 'react'
import { IconButton } from '../../src/iconButton'

describe('<IconButton />', () => {
  it('renders', () => {
    // see: https://on.cypress.io/mounting-react
    cy.mount(<IconButton icon={"icon"} />)
  });
});
