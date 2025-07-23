import React from 'react'
import { RangeSlider } from '../../src/rangeslider'

describe('<RangeSlider />', () => {
  it('renders', () => {
    // see: https://on.cypress.io/mounting-react
    cy.mount(
      <RangeSlider/>
    )
  });
});
