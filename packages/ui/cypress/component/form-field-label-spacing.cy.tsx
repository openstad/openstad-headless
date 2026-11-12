import '@utrecht/component-library-css';
import { FormFieldTextbox } from '@utrecht/component-library-react';
import React from 'react';

import CheckboxField from '../../src/form-elements/checkbox';
import MatrixField from '../../src/form-elements/matrix';
import NumberInput from '../../src/form-elements/number';
import RadioField from '../../src/form-elements/radio';
import TextInput from '../../src/form-elements/text';

const THEME_LABEL_SPACING = {
  '--utrecht-form-field-label-margin-block-end': '12px',
} as React.CSSProperties;

const spaceBelowLabelWrappers = (scope: string, count: number) =>
  cy
    .get(`[data-testid="${scope}"] .utrecht-form-field__label`)
    .should('have.length', count)
    .then(($wrappers) =>
      $wrappers
        .toArray()
        .map(
          (wrapper) =>
            `${wrapper.textContent?.trim()}: ${getComputedStyle(wrapper).marginBlockEnd}`
        )
    );

describe('form field label spacing', () => {
  it('keeps option labels as tight as before', () => {
    cy.mount(
      <div style={THEME_LABEL_SPACING} data-testid="options">
        <RadioField
          title="Ik ben"
          fieldKey="ikben"
          choices={[
            { value: 'lid', label: 'Ik ben lid' },
            { value: 'ouder', label: 'Ik ben ouder' },
          ]}
        />
        <CheckboxField
          title="Wat vind je belangrijk?"
          fieldKey="belangrijk"
          choices={[
            { value: 'groen', label: 'Groen' },
            { value: 'spelen', label: 'Spelen' },
          ]}
        />
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
      </div>
    );
    spaceBelowLabelWrappers('options', 6).should('deep.equal', [
      'Ik ben lid: 0px',
      'Ik ben ouder: 0px',
      'Groen: 0px',
      'Spelen: 0px',
      'Goed: 0px',
      'Slecht: 0px',
    ]);
  });

  it('keeps text field labels as tight as before', () => {
    cy.mount(
      <div style={THEME_LABEL_SPACING} data-testid="text">
        <TextInput title="Wat is je naam?" fieldKey="naam" />
        <NumberInput title="Hoe oud ben je?" fieldKey="leeftijd" />
      </div>
    );
    spaceBelowLabelWrappers('text', 2).should('deep.equal', [
      'Wat is je naam?: 0px',
      'Hoe oud ben je?: 0px',
    ]);
  });

  it('leaves the spacing of Utrecht form fields to the theme', () => {
    cy.mount(
      <div style={THEME_LABEL_SPACING} data-testid="utrecht">
        <FormFieldTextbox label="Naam" name="naam" />
      </div>
    );
    spaceBelowLabelWrappers('utrecht', 1).should('deep.equal', ['Naam: 12px']);
  });
});
