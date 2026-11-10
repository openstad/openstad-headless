import React from 'react';

import { TrixEditor } from '../../src/form-elements/text';

describe('<TrixEditor /> first load of Trix', () => {
  it('does not report the loaded value as a change', () => {
    const onChange = cy.stub().as('onChange');
    cy.mount(<TrixEditor value="<p>Hallo wereld</p>" onChange={onChange} />);
    cy.get('trix-editor').should('contain.text', 'Hallo wereld');
    cy.wait(100);
    cy.get('@onChange').should('not.have.been.called');
    cy.get('trix-editor').type(' en meer');
    cy.get('@onChange').should('have.been.called');
  });
});
