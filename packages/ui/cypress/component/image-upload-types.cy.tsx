import React from 'react';

import ImageUploadField from '../../src/form-elements/image-upload';

const TYPE_NOT_ALLOWED = 'Bestandstype is niet toegestaan';

const IMAGE_SERVER = 'http://image.test';

const file = (fileName: string, mimeType: string) => ({
  contents: Cypress.Buffer.from('niet echt beeld, alleen naam en type tellen'),
  fileName,
  mimeType,
});

const mountField = () => {
  cy.intercept(
    { method: 'POST', url: '**/images' },
    { statusCode: 200, body: [] }
  ).as('upload');

  cy.viewport(900, 600);
  cy.mount(
    <ImageUploadField
      title="Afbeelding"
      fieldKey="image"
      imageUrl={IMAGE_SERVER}
      onChange={cy.stub().as('onChange')}
    />
  );

  return cy.get('.filepond--root').should('exist');
};

const pickFile = (fileName: string, mimeType: string) =>
  cy
    .get('input[type="file"]')
    .first()
    .selectFile(file(fileName, mimeType), { force: true });

/**
 * selectFile infers a mime type from the extension when none is given, so it
 * cannot produce the case this component has to handle: a browser that reports
 * no type at all. Building the File inside the application window and setting
 * it on the input directly does.
 */
const pickFileWithoutType = (fileName: string) =>
  cy
    .get('input[type="file"]')
    .first()
    .then(($input) => {
      cy.window().then((win) => {
        const anyWin = win as any;
        const input = $input[0] as HTMLInputElement;
        const empty = new anyWin.File([new Uint8Array([1, 2, 3])], fileName, {
          type: '',
        });
        expect(empty.type, `${fileName} heeft geen type`).to.equal('');

        const transfer = new anyWin.DataTransfer();
        transfer.items.add(empty);
        input.files = transfer.files;
        input.dispatchEvent(new anyWin.Event('change', { bubbles: true }));
      });
    });

const dropFile = (fileName: string, mimeType: string) =>
  cy
    .get('.filepond--drop-label')
    .selectFile(file(fileName, mimeType), { action: 'drag-drop', force: true });

describe('ImageUploadField file picker type validation', () => {
  it('accepts a jpeg', () => {
    mountField();
    pickFile('foto.jpg', 'image/jpeg');

    cy.get('.filepond--item').should('exist');
    cy.get('.filepond--root').should('not.contain', TYPE_NOT_ALLOWED);
  });

  it('accepts a heic reported as image/heic', () => {
    mountField();
    pickFile('IMG_1234.heic', 'image/heic');

    cy.get('.filepond--item').should('exist');
    cy.get('.filepond--root').should('not.contain', TYPE_NOT_ALLOWED);
  });

  it('accepts a heic when the browser reports no type at all', () => {
    mountField();
    pickFileWithoutType('IMG_1234.heic');

    cy.get('.filepond--item').should('exist');
    cy.get('.filepond--root').should('not.contain', TYPE_NOT_ALLOWED);
  });

  it('accepts a heif when the browser reports no type at all', () => {
    mountField();
    pickFileWithoutType('IMG_1234.heif');

    cy.get('.filepond--item').should('exist');
    cy.get('.filepond--root').should('not.contain', TYPE_NOT_ALLOWED);
  });

  it('refuses a document', () => {
    mountField();
    pickFile('rapport.pdf', 'application/pdf');

    cy.get('.filepond--root').should('contain', TYPE_NOT_ALLOWED);
  });

  it('refuses an unknown extension without a type', () => {
    mountField();
    pickFileWithoutType('bestand.xyz');

    cy.get('.filepond--root').should('contain', TYPE_NOT_ALLOWED);
  });
});

describe('ImageUploadField drop type validation', () => {
  it('accepts a dropped heic', () => {
    mountField();
    dropFile('IMG_1234.heic', 'image/heic');

    cy.get('.filepond--item').should('exist');
    cy.get('.filepond--root').should('not.contain', TYPE_NOT_ALLOWED);
  });

  it('refuses a dropped document', () => {
    mountField();
    dropFile('rapport.pdf', 'application/pdf');

    cy.get('.filepond--root').should('contain', TYPE_NOT_ALLOWED);
  });
});
