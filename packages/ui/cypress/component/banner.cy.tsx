import React from 'react'
import { Banner } from '../../src/banner'

describe('<Banner />', () => {
  it('renders', () => {
    // see: https://on.cypress.io/mounting-react
    cy.mount(<Banner />)
  })

  it('renders with children', () => {
    // see: https://on.cypress.io/mounting-react
    cy.mount(
      <Banner>
        <h1>Banner title</h1>
      </Banner>
    )

    cy.get('.banner h1').should('contain', 'Banner title')
  })
})
