import React from 'react'
import { ImageSelect } from '../../src/imageselect'

describe('<ImageSelect />', () => {
  it('renders', () => {
    // see: https://on.cypress.io/mounting-react
    cy.mount(<ImageSelect />)
  });
});
