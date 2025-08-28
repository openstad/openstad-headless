import React from 'react'
import { Image } from '../../src/image'

describe('<Image />', () => {
  it('renders', () => {
    // see: https://on.cypress.io/mounting-react
    cy.mount(<Image />)
  });
});
