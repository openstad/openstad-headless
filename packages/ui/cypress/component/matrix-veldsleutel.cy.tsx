import React from 'react';

import MatrixField from '../../src/form-elements/matrix';

// Een fieldKey uit de admin mag spaties bevatten. In aria-labelledby is de
// spatie het scheidingsteken, dus "voor wie-row-0" viel uiteen in twee
// verwijzingen die geen van beide bestonden. Elke matrixcel verloor daarmee
// zijn naam. Gevonden in de LIA-vragenlijst.
const matrix = {
  rows: [
    { text: 'Onderwerp een', trigger: '1' },
    { text: 'Onderwerp twee', trigger: '2' },
  ],
  columns: [
    { text: 'Eens', trigger: '1' },
    { text: 'Oneens', trigger: '2' },
  ],
};

const mountMatrix = (fieldKey: string) =>
  cy.mount(
    <div className="osc">
      <MatrixField
        fieldKey={fieldKey}
        title="Hoe ervaart u deze onderwerpen?"
        matrix={matrix}
        onChange={() => {}}
      />
    </div>
  );

describe('matrix met een veldsleutel met spaties', () => {
  it('verwijst naar bestaande rij- en kolomkoppen', () => {
    mountMatrix('voor wie');

    cy.get('table input[type="radio"]').each(($radio) => {
      const verwijzing = $radio.attr('aria-labelledby') || '';
      const delen = verwijzing.split(/\s+/).filter(Boolean);

      expect(
        delen,
        `aria-labelledby "${verwijzing}" verwijst naar 2 elementen`
      ).to.have.length(2);

      cy.document().then((doc) => {
        delen.forEach((id) => {
          expect(doc.getElementById(id), `element met id "${id}" bestaat`).to
            .exist;
        });
      });
    });
  });

  it('geeft elke cel een naam uit rij plus kolom', () => {
    mountMatrix('voor wie');

    cy.get('table input[type="radio"]')
      .first()
      .then(($radio) => {
        const delen = ($radio.attr('aria-labelledby') || '').split(/\s+/);
        cy.document().then((doc) => {
          const tekst = delen
            .map((id) => doc.getElementById(id)?.textContent?.trim())
            .join(' ');
          expect(tekst).to.equal('Onderwerp een Eens');
        });
      });
  });

  it('gebruikt geen spaties in id-attributen', () => {
    mountMatrix('voor wie');

    cy.get('table [id]').each(($el) => {
      expect($el.attr('id')).to.not.match(/\s/);
    });
  });

  it('blijft werken bij een veldsleutel zonder spaties', () => {
    mountMatrix('matrix-1');

    cy.get('table input[type="radio"]')
      .first()
      .then(($radio) => {
        const delen = ($radio.attr('aria-labelledby') || '').split(/\s+/);
        cy.document().then((doc) => {
          delen.forEach((id) => {
            expect(doc.getElementById(id)).to.exist;
          });
        });
      });
  });
});
