import React from 'react';

import { ClickableImage } from '../../src/clickable-image';
import CheckboxField from '../../src/form-elements/checkbox';
import DocumentUploadField from '../../src/form-elements/document-upload';
import ImageChoiceField from '../../src/form-elements/image-choice';
import ImageUploadField from '../../src/form-elements/image-upload';
import MatrixField from '../../src/form-elements/matrix';
import RadioField from '../../src/form-elements/radio';

const IMAGE =
  "data:image/svg+xml;utf8,<svg xmlns='http://www.w3.org/2000/svg' width='300' height='200'><rect width='300' height='200' fill='%23a5d6a7'/></svg>";

const BLOCK_OR_INTERACTIVE =
  'figure, figcaption, h1, h2, h3, h4, h5, h6, p, div, ul, ol, button';

const textOfIds = (doc: Document, ids?: string) =>
  (ids || '')
    .split(/\s+/)
    .filter(Boolean)
    .map((id) => doc.getElementById(id)?.textContent?.trim() || '')
    .join(' ');

const expectNoRoleOnFieldset = () =>
  cy.get('fieldset').each(($fieldset) => {
    expect($fieldset.attr('role'), 'role on fieldset').to.be.undefined;
  });

const expectNoLabelInParagraph = () =>
  cy.get('label').each(($label) => {
    expect($label.closest('p').length, 'p around label').to.eq(0);
  });

const expectOnlyPhrasingInLabels = () =>
  cy.get('label').each(($label) => {
    expect(
      $label.find(BLOCK_OR_INTERACTIVE).length,
      'block or interactive content in label'
    ).to.eq(0);
  });

const expectOtherFieldLabelled = (name: string) =>
  cy.get(`[name="${name}"]`).then(($field) => {
    const field = $field[0];
    const doc = field.ownerDocument;
    expect(
      doc.querySelectorAll(`[id="${field.id}"]`).length,
      'elements with the id of the other field'
    ).to.eq(1);
    expect(
      textOfIds(doc, field.getAttribute('aria-labelledby') || undefined),
      'name of the other field'
    ).to.eq('Anders');
  });

describe('a11y: form markup', () => {
  describe('<RadioField />', () => {
    const choices = [
      { value: 'lid', label: 'Ik ben lid' },
      { value: 'ouder', label: 'Ik ben ouder/verzorger van lid' },
      { value: 'anders', label: 'Anders', isOtherOption: true },
    ];

    beforeEach(() => {
      cy.mount(
        <RadioField title="Ik ben" fieldKey="ikben" choices={choices} />
      );
    });

    it('relies on the native fieldset group', () => {
      expectNoRoleOnFieldset();
    });

    it('does not wrap labels in a paragraph', () => {
      expectNoLabelInParagraph();
    });

    it('names the other field after its option and gives it a unique id', () => {
      cy.contains('label', 'Anders').click();
      expectOtherFieldLabelled('ikben_2_other');
    });
  });

  describe('<CheckboxField />', () => {
    const choices = [
      { value: 'groen', label: 'Groen' },
      { value: 'anders', label: 'Anders', isOtherOption: true },
    ];

    beforeEach(() => {
      cy.mount(
        <CheckboxField
          title="Wat vind je belangrijk?"
          fieldKey="belangrijk"
          choices={choices}
        />
      );
    });

    it('relies on the native fieldset group', () => {
      expectNoRoleOnFieldset();
    });

    it('does not wrap labels in a paragraph', () => {
      expectNoLabelInParagraph();
    });

    it('names the other field after its option and gives it a unique id', () => {
      cy.contains('label', 'Anders').click();
      expectOtherFieldLabelled('belangrijk_1_other');
    });
  });

  describe('<MatrixField />', () => {
    beforeEach(() => {
      cy.mount(
        <MatrixField
          title="Hoe beoordeel je"
          fieldKey="matrix"
          matrix={{
            columns: [
              { trigger: 'goed', text: 'Goed' },
              { trigger: 'slecht', text: 'Slecht' },
            ],
            rows: [{ trigger: 'speeltuin', text: 'Speeltuin' }],
          }}
        />
      );
    });

    it('relies on the native fieldset group', () => {
      expectNoRoleOnFieldset();
    });

    it('does not wrap labels in a paragraph', () => {
      expectNoLabelInParagraph();
    });
  });

  describe('<ImageChoiceField />', () => {
    const choices = [
      {
        value: 'a',
        label: 'Optie A',
        description: '<p>Meer bomen in de straat.</p>',
        imageSrc: IMAGE,
        imageAlt: 'Bomen',
        imageDescription: '',
      },
      {
        value: 'b',
        label: 'Optie B',
        imageSrc: IMAGE,
        imageAlt: 'Bankjes',
        imageDescription: '',
      },
      {
        value: 'c',
        label: 'Optie C',
        hideLabel: true,
        imageSrc: IMAGE,
        imageAlt: 'Speeltoestel',
        imageDescription: '',
      },
    ];

    beforeEach(() => {
      cy.mount(
        <ImageChoiceField
          title="Wat kies je?"
          fieldKey="keuze"
          choices={choices}
          imageClickable={true}
        />
      );
    });

    it('keeps only phrasing content inside the labels', () => {
      expectOnlyPhrasingInLabels();
    });

    it('names each option after its label, also when the label is hidden', () => {
      cy.get('input[name="keuze"]')
        .should('have.length', 3)
        .then(($inputs) => {
          const doc = $inputs[0].ownerDocument;
          const names = $inputs
            .toArray()
            .map((input) =>
              textOfIds(doc, input.getAttribute('aria-labelledby') || undefined)
            );
          expect(names).to.deep.eq(['Optie A', 'Optie B', 'Optie C']);
        });
    });

    it('describes an option with its description', () => {
      cy.get('input[name="keuze"]')
        .first()
        .then(($input) => {
          const input = $input[0];
          expect(
            textOfIds(
              input.ownerDocument,
              input.getAttribute('aria-describedby') || undefined
            )
          ).to.eq('Meer bomen in de straat.');
        });
    });

    it('returns focus to the zoom button after closing the enlarged image', () => {
      cy.get('.osc-clickable-image-zoom').first().focus().click();
      cy.get('[role="dialog"]').should('exist');
      cy.focused().type('{esc}');
      cy.get('[role="dialog"]').should('not.exist');
      cy.focused()
        .should('have.class', 'osc-clickable-image-zoom')
        .and('have.attr', 'aria-label', 'Afbeelding uitvergroot bekijken');
    });
  });

  describe('<ClickableImage /> wrapper variant', () => {
    it('returns focus to the image after closing the enlarged image', () => {
      cy.mount(
        <ClickableImage clickable={true} src={IMAGE} alt="Plattegrond">
          <img src={IMAGE} alt="Plattegrond" />
        </ClickableImage>
      );
      cy.get('.osc-clickable-image--wrapper').focus().type('{enter}');
      cy.get('[role="dialog"]').should('exist');
      cy.get('.osc-lightbox-close').click();
      cy.get('[role="dialog"]').should('not.exist');
      cy.focused().should('have.class', 'osc-clickable-image--wrapper');
    });
  });

  describe('upload fields', () => {
    const expectGroupNamedByTitle = (title: string) =>
      cy.get('input[type="file"]').then(($file) => {
        const group = $file[0].closest('[role="group"]');
        expect(group, 'group around the upload').to.exist;
        expect(
          textOfIds(
            $file[0].ownerDocument,
            group?.getAttribute('aria-labelledby') || undefined
          )
        ).to.eq(title);
      });

    it('groups the image upload under its question', () => {
      cy.mount(
        <ImageUploadField
          title="Upload een foto"
          fieldKey="foto"
          randomId="foto"
        />
      );
      expectGroupNamedByTitle('Upload een foto');
    });

    it('groups the document upload under its question', () => {
      cy.mount(
        <DocumentUploadField
          title="Upload een document"
          fieldKey="document"
          randomId="document"
        />
      );
      expectGroupNamedByTitle('Upload een document');
    });
  });
});
