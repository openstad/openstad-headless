import React from 'react';

import { Dialog } from '../../src/dialog';

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
});
