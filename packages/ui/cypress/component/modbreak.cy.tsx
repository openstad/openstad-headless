import React from 'react';

import ModbreakField from '../../src/form-elements/modbreak';

describe('<ModbreakField />', () => {
  it('renders the empty state', () => {
    cy.mount(<ModbreakField fieldKey="modBreaks" />);
    cy.contains('Nog geen modbreaks toegevoegd.').should('be.visible');
  });

  it('adds, edits, reads back the Trix value, and removes a modbreak', () => {
    const onChange = cy.stub().as('onChange');
    cy.mount(<ModbreakField fieldKey="modBreaks" onChange={onChange} />);

    cy.contains('Modbreak toevoegen').click();
    cy.get('.modbreak-item-card').should('have.length', 1);

    cy.get('trix-editor').type('Belangrijke mededeling');
    cy.get('@onChange').should((stub: any) => {
      const lastCall = stub.args[stub.args.length - 1];
      expect(lastCall[0].value[0].description).to.contain(
        'Belangrijke mededeling'
      );
    });

    cy.get('input[placeholder="Naam van de auteur"]').type('Gemeente');
    cy.get('@onChange').should((stub: any) => {
      const lastCall = stub.args[stub.args.length - 1];
      expect(lastCall[0].value[0].authorName).to.eq('Gemeente');
    });

    cy.get('[aria-label="Verwijder modbreak"]').click();
    cy.contains('Nog geen modbreaks toegevoegd.').should('be.visible');
    cy.get('@onChange').should((stub: any) => {
      const lastCall = stub.args[stub.args.length - 1];
      expect(lastCall[0].value).to.have.length(0);
    });
  });
});
