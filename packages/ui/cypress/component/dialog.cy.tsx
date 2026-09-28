import React from 'react';

import { Dialog, DialogDescription, DialogTitle } from '../../src/dialog';

describe('<Dialog />', () => {
  it('renders', () => {
    // see: https://on.cypress.io/mounting-react
    cy.mount(<Dialog />);
  });

  it('renders with open state', () => {
    const onOpenChange = cy.stub().as('onOpenChange');

    cy.mount(
      <Dialog open={true} onOpenChange={onOpenChange} className="dialog-test">
        <p>Dialog content</p>
      </Dialog>
    );

    cy.get('.osc-DialogContent.dialog-test')
      .should('exist')
      .contains('Dialog content');

    cy.get('[test-id="dialog-close-button"]').click();
    cy.get('@onOpenChange').should('have.been.called');
  });

  it('is named by its DialogTitle and described by its DialogDescription', () => {
    cy.mount(
      <Dialog open={true} onOpenChange={() => {}}>
        <DialogTitle>Je gaat een bericht versturen</DialogTitle>
        <DialogDescription>Uitleg bij het bericht</DialogDescription>
      </Dialog>
    );

    cy.get('.osc-DialogTitle')
      .invoke('attr', 'id')
      .then((titleId) => {
        cy.get('[role="dialog"]').should(
          'have.attr',
          'aria-labelledby',
          titleId
        );
      });
    cy.get('.osc-DialogDescription')
      .invoke('attr', 'id')
      .then((descriptionId) => {
        cy.get('[role="dialog"]').should(
          'have.attr',
          'aria-describedby',
          descriptionId
        );
      });
  });

  it('keeps an explicit aria-label', () => {
    cy.mount(
      <Dialog
        open={true}
        onOpenChange={() => {}}
        aria-label="Details van inzending">
        <p>Inhoud</p>
      </Dialog>
    );
    cy.get('[role="dialog"]').should(
      'have.attr',
      'aria-label',
      'Details van inzending'
    );
  });
});
