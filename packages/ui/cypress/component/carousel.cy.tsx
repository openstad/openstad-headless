import React from 'react';

import { Carousel } from '../../src/carousel';

describe('<Carousel />', () => {
  it('renders', () => {
    // see: https://on.cypress.io/mounting-react
    cy.mount(<Carousel />);
  });

  it('renders with items and can switch slides', () => {
    const items = [
      { id: 1, content: 'Item 1' },
      { id: 2, content: 'Item 2' },
      { id: 3, content: 'Item 3' },
    ];

    cy.mount(
      <Carousel
        items={items}
        itemRenderer={(item) => (
          <div key={item.id} className={'carousel-item'}>
            {item.content}
          </div>
        )}
      />
    );

    cy.get('.osc-carousel').should('exist');
    cy.get('.osc-carousel .carousel-item').should('exist').contains('Item 1');

    cy.get('.osc-carousel-previous button').should('be.disabled');
    cy.get('.osc-carousel-next button').should('not.be.disabled');

    // Switch to next slide
    cy.get('.osc-carousel-next button').click();
    cy.get('.osc-carousel .carousel-item').should('exist').contains('Item 2');

    cy.get('.osc-carousel-previous button').should('not.be.disabled');
    cy.get('.osc-carousel-next button').should('not.be.disabled');

    // Switch to next slide
    cy.get('.osc-carousel-next button').click();
    cy.get('.osc-carousel .carousel-item').should('exist').contains('Item 3');

    cy.get('.osc-carousel-previous button').should('not.be.disabled');
    cy.get('.osc-carousel-next button').should('be.disabled');
  });
});
