import React from 'react';

import TimelineField from '../../src/form-elements/timeline';

const items = [
  {
    trigger: '0',
    activeFrom: '2026-09-26',
    title: 'Informatieavond',
    description: '',
  },
  {
    trigger: '1',
    activeFrom: '2026-09-27',
    title: '2026-09-27',
    description: 'Rapportage',
  },
  {
    trigger: '2',
    activeFrom: '2026-09-28',
    title: 'Publicatie',
    description: 'Publicatie van rapportage. '.repeat(30),
  },
];

describe('<TimelineField />', () => {
  beforeEach(() => {
    cy.viewport(480, 600);
    cy.mount(<TimelineField fieldKey="timeline" defaultValue={items} />);
  });

  it('shows date and title together for each item', () => {
    cy.get('.timeline-item-date').should('have.length', 3);
    cy.get('.timeline-item-date')
      .eq(0)
      .should('have.text', '26 september 2026 – Informatieavond');
    cy.get('.timeline-item-date')
      .eq(1)
      .should('have.text', '27 september 2026');
    cy.get('.timeline-item-date')
      .eq(2)
      .should('have.text', '28 september 2026 – Publicatie');
  });

  it('keeps the action buttons visible next to a long description', () => {
    cy.get('.timeline-item-row')
      .eq(2)
      .find('button[aria-label="Bewerk item: 28 september 2026 – Publicatie"]')
      .should('be.visible');
    cy.get('.timeline-item-row')
      .eq(2)
      .find(
        'button[aria-label="Verwijder item: 28 september 2026 – Publicatie"]'
      )
      .should('be.visible');
  });

  it('removes an item', () => {
    cy.get('.timeline-item-row')
      .eq(1)
      .find('button[aria-label^="Verwijder item"]')
      .click();
    cy.get('.timeline-item-date').should('have.length', 2);
  });
});
