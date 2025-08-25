import React from 'react'
import { Checkbox } from '../../src/checkbox'

describe('<Checkbox />', () => {
  it('renders', () => {
    // see: https://on.cypress.io/mounting-react
    cy.mount(<Checkbox />)
  })

  it('renders with checked boolean', () => {
    cy.mount(<Checkbox className={"checkbox-test"} checked={true}/>)

    cy.get('div.checkbox-test.checkbox.checked').should('exist');

  })
})
