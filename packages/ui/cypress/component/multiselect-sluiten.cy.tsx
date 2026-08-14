import React from 'react';

import { MultiSelect } from '../../src/multiselect';

// Het uitklapmenu bleef openstaan als de focus doorliep naar het volgende menu,
// en overlapte dat dan bij 400% zoom. Het was zelf ook niet met het toetsenbord
// te sluiten. Bevindingen 25009 / 1.4.10 / 2.1.1.
const options = [
  { value: 'duurzaamheid', label: 'duurzaamheid' },
  { value: 'gezelligheid', label: 'gezelligheid' },
];

const mountMetBuurman = () =>
  cy.mount(
    <div>
      <MultiSelect
        id="themas"
        label="Thema's"
        options={options}
        defaultOpen
        onItemSelected={() => {}}
      />
      <button type="button" data-cy="volgend-menu">
        Sorteer op
      </button>
    </div>
  );

describe('<MultiSelect /> sluiten', () => {
  it('sluit zodra de focus naar het volgende menu gaat', () => {
    mountMetBuurman();
    cy.get('.multiselect-container').should('exist');

    // eerst focus ín het menu, dan verder tabben — dat is de echte volgorde
    cy.get('.multiselect-container input[type="checkbox"]').first().focus();
    cy.get('[data-cy="volgend-menu"]').focus();

    cy.get('.multiselect-container').should('not.exist');
  });

  it('sluit met Escape en zet de focus terug op de knop', () => {
    mountMetBuurman();
    cy.get('.multiselect-container').should('exist');

    cy.get('.multiselect-container').trigger('keydown', { key: 'Escape' });

    cy.get('.multiselect-container').should('not.exist');
    cy.focused().should('have.attr', 'test-id', 'multi-select-button');
  });

  it('blijft open zolang de focus binnen het menu blijft', () => {
    mountMetBuurman();

    cy.get('.multiselect-container input[type="checkbox"]').first().focus();

    cy.get('.multiselect-container').should('exist');
  });
});
