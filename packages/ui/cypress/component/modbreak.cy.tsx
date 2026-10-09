import React from 'react';

import ModbreakField from '../../src/form-elements/modbreak';

describe('<ModbreakField />', () => {
  it('renders the empty state', () => {
    cy.mount(<ModbreakField fieldKey="modBreaks" />);
    cy.contains('Nog geen modbreaks toegevoegd.').should('be.visible');
  });

  it('links the field title and the content label to their controls', () => {
    cy.mount(<ModbreakField fieldKey="modBreaks" title="Moderatie" />);

    cy.get('.modbreak-field-container')
      .should('have.attr', 'role', 'group')
      .invoke('attr', 'aria-labelledby')
      .then((titleId) => {
        cy.get(`[id="${titleId}"]`).should('contain.text', 'Moderatie');
      });

    cy.contains('Modbreak toevoegen').click();
    cy.get('trix-toolbar').should('exist');
    cy.contains('label', 'Inhoud')
      .invoke('attr', 'for')
      .then((editorId) => {
        cy.get('trix-editor').should('have.attr', 'id', editorId);
      });

    cy.contains('label', 'Inhoud').click();
    cy.focused().should('match', 'trix-editor');
  });

  it('keeps an empty modbreak in the value so the form can block the save', () => {
    const onChange = cy.stub().as('onChange');
    cy.mount(<ModbreakField fieldKey="modBreaks" onChange={onChange} />);

    cy.contains('Modbreak toevoegen').click();
    cy.get('input[placeholder="Naam van de auteur"]').type('Gemeente');

    cy.get('@onChange').should((stub: any) => {
      const lastCall = stub.args[stub.args.length - 1];
      expect(lastCall[0].value).to.have.length(1);
      expect(lastCall[0].value[0].description).to.eq('');
    });
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
