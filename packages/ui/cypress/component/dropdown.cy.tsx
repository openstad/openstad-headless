import React from 'react'
import { DropDownMenu } from '../../src/dropdown'

describe('<DropDownMenu />', () => {
  it('renders', () => {
    // see: https://on.cypress.io/mounting-react
    cy.mount(<DropDownMenu />)
  })

  it('renders with children', () => {

    const onClickItem1 = cy.stub().as('onClickItem1');
    const onClickItem2 = cy.stub().as('onClickItem2');

    cy.mount(<DropDownMenu
      items={[
        { label: 'Item 1', onClick: () => onClickItem1() },
        { label: 'Item 2', onClick: () => onClickItem2() },
      ]}
      children={
        <div test-id={'menu-trigger'}>Open dropdown</div>
      }
    />)

    cy.get('[test-id="menu-trigger"]').should('exist').contains('Open dropdown').click();
    cy.get('.DropdownMenuContent').should('exist');
    cy.get('.DropdownMenuItem').should('have.length', 2);

    cy.get('.DropdownMenuItem').eq(0).should('exist').contains('Item 1').click();
    cy.get('@onClickItem1').should('have.been.called');

    // We never click the second item, so it should not have been called
    cy.get('@onClickItem2').should('not.have.been.called');

  })
})
