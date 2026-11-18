import React from 'react';

import CheckboxField from '../../src/form-elements/checkbox';
import MatrixField from '../../src/form-elements/matrix';
import RadioboxField from '../../src/form-elements/radio';

// aria-invalid werd als los attribuut doorgegeven. De Utrecht Fieldset filtert
// alleen de prop `invalid` eruit, dus het attribuut belandde op de wrapper-div
// en de vraaggroep werd nooit als ongeldig gemeld.
const opties = [
  { value: 'a', label: 'Optie A' },
  { value: 'b', label: 'Optie B' },
];

const matrix = {
  rows: [{ text: 'Rij een', trigger: '1' }],
  columns: [{ text: 'Eens', trigger: '1' }],
};

const gevallen = [
  {
    naam: 'radio',
    render: (fieldInvalid: boolean) => (
      <RadioboxField
        fieldKey="vraag"
        title="Een verplichte vraag"
        choices={opties}
        fieldRequired={true}
        fieldInvalid={fieldInvalid}
        onChange={() => {}}
      />
    ),
  },
  {
    naam: 'checkbox',
    render: (fieldInvalid: boolean) => (
      <CheckboxField
        fieldKey="vraag"
        title="Een verplichte vraag"
        choices={opties}
        fieldRequired={true}
        fieldInvalid={fieldInvalid}
        onChange={() => {}}
      />
    ),
  },
  {
    naam: 'matrix',
    render: (fieldInvalid: boolean) => (
      <MatrixField
        fieldKey="vraag"
        title="Een verplichte vraag"
        matrix={matrix}
        fieldRequired={true}
        fieldInvalid={fieldInvalid}
        onChange={() => {}}
      />
    ),
  },
];

describe('ongeldige vraaggroep', () => {
  gevallen.forEach(({ naam, render }) => {
    it(`${naam}: markeert de fieldset zelf als ongeldig bij een fout`, () => {
      cy.mount(<div className="osc">{render(true)}</div>);

      cy.get('fieldset').should('have.attr', 'aria-invalid', 'true');
    });

    it(`${naam}: zet aria-invalid niet op de wrapper-div`, () => {
      cy.mount(<div className="osc">{render(true)}</div>);

      cy.get('div.utrecht-form-fieldset').should(
        'not.have.attr',
        'aria-invalid'
      );
    });

    it(`${naam}: noemt een verplichte vraag niet ongeldig voor er iets gebeurd is`, () => {
      cy.mount(<div className="osc">{render(false)}</div>);

      cy.get('fieldset').then(($fs) => {
        const waarde = $fs.attr('aria-invalid');
        expect(waarde === undefined || waarde === 'false').to.equal(true);
      });
      cy.get('div.utrecht-form-fieldset').should(
        'not.have.attr',
        'aria-invalid'
      );
    });
  });
});
