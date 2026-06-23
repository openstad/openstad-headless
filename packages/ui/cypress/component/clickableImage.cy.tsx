import React from 'react';

import { ClickableImage } from '../../src/clickable-image';

const img = <img src="/full.jpg" alt="voorbeeld" data-cy="img" />;

describe('<ClickableImage />', () => {
  it('renders children without trigger when not clickable', () => {
    cy.mount(<ClickableImage src="/full.jpg">{img}</ClickableImage>);
    cy.get('[data-cy=img]').should('exist');
    cy.get('.osc-clickable-image').should('not.exist');
  });

  it('wrapper variant opens the lightbox on click', () => {
    cy.mount(
      <ClickableImage clickable src="/full.jpg" variant="wrapper">
        {img}
      </ClickableImage>
    );
    cy.get('.osc-lightbox-image').should('not.exist');
    cy.get('.osc-clickable-image--wrapper[role=button]').click();
    cy.get('.osc-lightbox-image').should('have.attr', 'src', '/full.jpg');
  });

  it('wrapper variant opens the lightbox with the Enter key', () => {
    cy.mount(
      <ClickableImage clickable src="/full.jpg" variant="wrapper">
        {img}
      </ClickableImage>
    );
    cy.get('.osc-clickable-image--wrapper[role=button]').type('{enter}');
    cy.get('.osc-lightbox-image').should('exist');
  });

  it('overlay variant shows a zoom button that opens the lightbox', () => {
    cy.mount(
      <ClickableImage clickable src="/full.jpg" variant="overlay">
        {img}
      </ClickableImage>
    );
    cy.get('.osc-clickable-image-zoom').click();
    cy.get('.osc-lightbox-image').should('have.attr', 'src', '/full.jpg');
  });
});
