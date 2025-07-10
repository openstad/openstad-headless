import React from 'react'
import { Button } from '../../src/button'

describe('<Button />', () => {
  it('renders', () => {
    // see: https://on.cypress.io/mounting-react
    cy.mount(<Button />)
  })

  it('renders with text', () => {
    // see: https://on.cypress.io/mounting-react
    cy.mount(
      <Button>Button text</Button>
    )

    cy.get('button').should('contain', 'Button text')
  })
})
