import React from 'react';

import SelectField from '../../src/form-elements/select';
import { MultiSelect } from '../../src/multiselect';

// De vraagtekst hing aan een label-for dat nergens naartoe wees, en de optiegroep
// werd benoemd met de placeholder in plaats van met de vraag. Een schermlezer gaf
// daardoor nooit de bovenliggende vraag mee. LIA-bevinding, WCAG 1.3.1 / 3.3.2.
const vraag = 'Welke voorzieningen mist u in uw wijk?';

const opties = [
  { value: 'speeltuin', label: 'Speeltuin' },
  { value: 'bankje', label: 'Bankje' },
];

describe('meerkeuze-dropdown groepering', () => {
  it('benoemt de optiegroep met de vraag, niet met de placeholder', () => {
    cy.mount(
      <div className="osc">
        <MultiSelect
          id="vraag-3"
          legend={vraag}
          label="Selecteer optie"
          options={opties}
          defaultOpen
          onItemSelected={() => {}}
        />
      </div>
    );

    cy.get('fieldset.multiselect-container').should('exist');
    cy.get('fieldset.multiselect-container > legend').should(
      'have.text',
      vraag
    );
    cy.get('fieldset.multiselect-container').should(
      'not.have.attr',
      'aria-label'
    );
  });

  it('houdt de legend buiten beeld', () => {
    cy.mount(
      <div className="osc">
        <MultiSelect
          id="vraag-3"
          legend={vraag}
          label="Selecteer optie"
          options={opties}
          defaultOpen
          onItemSelected={() => {}}
        />
      </div>
    );

    cy.get('fieldset.multiselect-container > legend').should('not.be.visible');
  });

  it('koppelt de vraag aan de openknop van het meerkeuzeveld', () => {
    cy.mount(
      <div className="osc">
        <SelectField
          fieldKey="vraag-3"
          title={`<p>${vraag}</p>`}
          multiple={true}
          choices={opties}
          onChange={() => {}}
        />
      </div>
    );

    cy.get('[test-id="multi-select-button"]')
      .invoke('attr', 'aria-labelledby')
      .then((labelledBy) => {
        expect(labelledBy).to.be.a('string');
        cy.document().then((doc) => {
          const label = doc.getElementById(labelledBy as string);
          expect(label, 'aria-labelledby wijst naar een bestaand element').to
            .exist;
          expect(label?.textContent).to.equal(vraag);
        });
      });
  });

  it('benoemt de optiegroep van het meerkeuzeveld met de vraagtekst', () => {
    cy.mount(
      <div className="osc">
        <SelectField
          fieldKey="vraag-3"
          title={`<p>${vraag}</p>`}
          multiple={true}
          choices={opties}
          onChange={() => {}}
        />
      </div>
    );

    cy.get('[test-id="multi-select-button"]').click();
    cy.get('fieldset.multiselect-container > legend').should(
      'have.text',
      vraag
    );
  });
  it('leest de vraag zonder HTML-entities voor', () => {
    const metEntities = 'Groen &amp; water&nbsp;in uw wijk?';
    const zoalsGetoond = 'Groen & water in uw wijk?';

    cy.mount(
      <div className="osc">
        <SelectField
          fieldKey="vraag-entities"
          title={`<div>${metEntities}</div>`}
          multiple={true}
          choices={opties}
          onChange={() => {}}
        />
      </div>
    );

    cy.get('[test-id="multi-select-button"]').click();
    cy.get('fieldset.multiselect-container > legend').should(
      'have.text',
      zoalsGetoond
    );
  });

  it('geeft elk id maar een keer uit bij twee meerkeuzevelden op een pagina', () => {
    cy.mount(
      <div className="osc">
        <SelectField
          fieldKey="select-1"
          title={`<p>${vraag}</p>`}
          multiple={true}
          choices={opties}
          onChange={() => {}}
        />
        <SelectField
          fieldKey="select-1"
          title={`<p>${vraag}</p>`}
          multiple={true}
          choices={opties}
          onChange={() => {}}
        />
      </div>
    );

    cy.get('[id]').then(($els) => {
      const ids = [...$els].map((el) => el.id);
      expect(new Set(ids).size, `dubbele ids: ${ids.join(', ')}`).to.equal(
        ids.length
      );
    });

    cy.get('[test-id="multi-select-button"]').then(($knoppen) => {
      const verwijzingen = [...$knoppen].map((b) =>
        b.getAttribute('aria-labelledby')
      );
      expect(new Set(verwijzingen).size).to.equal(verwijzingen.length);
    });
  });

  it('rendert geen lege legend als er geen vraagtitel is', () => {
    cy.mount(
      <div className="osc">
        <SelectField
          fieldKey="vraag-zonder-titel"
          multiple={true}
          choices={opties}
          onChange={() => {}}
        />
      </div>
    );

    cy.get('[test-id="multi-select-button"]').click();
    cy.get('fieldset.multiselect-container').should('exist');
    cy.get('fieldset.multiselect-container > legend').should('not.exist');
  });
});
