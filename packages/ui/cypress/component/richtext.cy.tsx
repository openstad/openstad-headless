import React from 'react';

import { TrixEditor } from '../../src/form-elements/text';

const mountEditor = (strict: boolean, value = '<div>Hallo wereld</div>') => {
  const editor = <TrixEditor value={value} onChange={() => {}} />;
  cy.mount(strict ? <React.StrictMode>{editor}</React.StrictMode> : editor);
};

const assertCustomizedEditor = (value = 'Hallo wereld') => {
  cy.get('trix-toolbar').should('exist');
  cy.get('trix-editor').should('contain.text', value);
  cy.get('trix-toolbar [data-trix-action="attachFiles"]').should('not.exist');
  cy.get('trix-toolbar .trix-target-blank-label').should('exist');
};

describe('<TrixEditor />', () => {
  it('customizes the toolbar and loads the value', () => {
    mountEditor(false);
    assertCustomizedEditor();
  });

  it('customizes the toolbar and loads the value in Strict Mode', () => {
    mountEditor(true);
    assertCustomizedEditor();
  });

  it('customizes the toolbar when Trix is already loaded', () => {
    mountEditor(false);
    cy.get('trix-toolbar').should('exist');
    mountEditor(false, '<div>Tweede editor</div>');
    assertCustomizedEditor('Tweede editor');
  });

  it('customizes the toolbar when Trix is already loaded in Strict Mode', () => {
    mountEditor(true);
    cy.get('trix-toolbar').should('exist');
    mountEditor(true, '<div>Tweede editor</div>');
    assertCustomizedEditor('Tweede editor');
  });

  it('does not report a new value from the parent as a change', () => {
    const onChange = cy.stub().as('onChange');
    cy.mount(<TrixEditor value="<p>Een</p>" onChange={onChange} />).then(
      ({ rerender }) => {
        cy.get('trix-editor').should('contain.text', 'Een');
        cy.then(() =>
          rerender(<TrixEditor value="<p>Twee</p>" onChange={onChange} />)
        );
        cy.get('trix-editor').should('contain.text', 'Twee');
        cy.wait(100);
        cy.get('@onChange').should('not.have.been.called');
        cy.get('trix-editor').type(' en meer');
        cy.get('@onChange').should('have.been.called');
      }
    );
  });
});
