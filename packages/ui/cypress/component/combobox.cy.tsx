import React, { useState } from 'react';

import { Combobox, ComboboxOption } from '../../src/combobox';

const options: ComboboxOption[] = [
  { id: '1', label: 'Arno Segeren' },
  { id: '2', label: 'Lena van der Wal' },
  { id: '3', label: 'Angelo Stuivenberg' },
];

function Harness({ initial = [] }: { initial?: ComboboxOption[] }) {
  const [selected, setSelected] = useState<ComboboxOption[]>(initial);
  return (
    <>
      <span id="combobox-label">Koppel stadmaker(s)</span>
      <Combobox
        labelledBy="combobox-label"
        selected={selected}
        onChange={setSelected}
        debounceMs={0}
        loadOptions={async (query) =>
          options.filter((option) =>
            option.label.toLowerCase().includes(query.toLowerCase())
          )
        }
      />
    </>
  );
}

describe('<Combobox />', () => {
  it('shows a hint until the query is long enough', () => {
    cy.mount(<Harness />);
    cy.get('[role="combobox"]').type('a');
    cy.get('.osc-combobox-status').should(
      'contain.text',
      'Typ minimaal 2 tekens'
    );
    cy.get('[role="listbox"]').should('not.be.visible');
  });

  it('selects an option with the keyboard and shows it as a chip', () => {
    cy.mount(<Harness />);
    cy.get('[role="combobox"]').type('ar');
    cy.get('[role="option"]').should('have.length', 1);
    cy.get('[role="combobox"]').should('have.attr', 'aria-expanded', 'true');
    cy.get('[role="combobox"]').type('{downArrow}');
    cy.get('[role="combobox"]').should('have.attr', 'aria-activedescendant');
    cy.get('[role="option"]')
      .first()
      .should('have.attr', 'aria-selected', 'true');
    cy.get('[role="combobox"]').type('{enter}');
    cy.get('.osc-combobox-chip')
      .should('have.length', 1)
      .and('contain.text', 'Arno Segeren');
    cy.get('[role="combobox"]').should('have.value', '').and('have.focus');
  });

  it('closes the listbox with Escape', () => {
    cy.mount(<Harness />);
    cy.get('[role="combobox"]').type('an');
    cy.get('[role="option"]').should('have.length.greaterThan', 0);
    cy.get('[role="combobox"]').type('{esc}');
    cy.get('[role="combobox"]').should('have.attr', 'aria-expanded', 'false');
  });

  it('hides selected options and removes a chip', () => {
    cy.mount(<Harness initial={[options[1]]} />);
    cy.get('[role="combobox"]').type('an');
    cy.get('[role="option"]')
      .should('have.length', 1)
      .and('contain.text', 'Angelo');
    cy.get('.osc-combobox-chip button')
      .first()
      .should('have.attr', 'aria-label', 'Verwijder Lena van der Wal')
      .click();
    cy.get('.osc-combobox-chip').should('have.length', 0);
    cy.get('[role="combobox"]').should('have.focus');
  });

  it('reports when nothing is found', () => {
    cy.mount(<Harness />);
    cy.get('[role="combobox"]').type('zz');
    cy.get('.osc-combobox-status').should('contain.text', 'Geen resultaten');
  });
});
