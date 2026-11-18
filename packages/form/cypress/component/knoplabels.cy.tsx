import React from 'react';

import Form from '../../src/form';

// De toegankelijke naam van de knop moet de zichtbare tekst bevatten (WCAG
// 2.5.3). Op tussenpagina's stond er "Volgende" terwijl het aria-label de
// verzendtekst hield, zodat spraakbediening op "Volgende" niets deed.
const velden = [
  {
    type: 'text',
    title: 'Vraag een',
    fieldKey: 'vraag1',
    variant: 'text input',
  },
  { type: 'pagination', fieldKey: 'pag1' },
  {
    type: 'text',
    title: 'Vraag twee',
    fieldKey: 'vraag2',
    variant: 'text input',
  },
];

function FormulierMetPaginastatus() {
  const [pagina, setPagina] = React.useState(0);
  return (
    <div className="osc">
      <Form
        {...({
          fields: velden,
          submitHandler: () => {},
          submitText: 'Versturen',
          prevPageText: 'Vorige',
          nextPageText: 'Volgende',
          title: '',
          currentPage: pagina,
          setCurrentPage: setPagina,
          totalPages: 2,
        } as any)}
      />
    </div>
  );
}

const mountFormulier = () => cy.mount(<FormulierMetPaginastatus />);

const knopNaamKlopt = (selector: string) =>
  cy.get(selector).then(($knop) => {
    const zichtbaar = $knop.text().trim();
    const naam = $knop.attr('aria-label');
    expect(
      naam,
      `aria-label "${naam}" bevat zichtbare tekst "${zichtbaar}"`
    ).to.contain(zichtbaar);
  });

describe('knoplabels in een formulier met paginering', () => {
  it('geeft de verzendknop op een tussenpagina de zichtbare tekst', () => {
    mountFormulier();

    cy.get('button[type="submit"]').should('contain.text', 'Volgende');
    knopNaamKlopt('button[type="submit"]');
  });

  it('geeft de vorige-knop de zichtbare tekst', () => {
    mountFormulier();

    cy.get('button[type="submit"]').click();
    cy.get('.osc-prev-button').should('exist');
    knopNaamKlopt('.osc-prev-button');
  });

  it('klopt ook op de laatste pagina', () => {
    mountFormulier();

    cy.get('button[type="submit"]').click();
    cy.get('button[type="submit"]').should('contain.text', 'Versturen');
    knopNaamKlopt('button[type="submit"]');
  });
  it('volgt ook de labels die een pagineringsvraag zelf instelt', () => {
    const veldenMetEigenLabels = [
      {
        type: 'text',
        title: 'Vraag een',
        fieldKey: 'vraag1',
        variant: 'text input',
      },
      {
        type: 'pagination',
        fieldKey: 'pag1',
        nextPageText: 'Verder naar deel 2',
        prevPageText: 'Terug naar deel 1',
      },
      {
        type: 'text',
        title: 'Vraag twee',
        fieldKey: 'vraag2',
        variant: 'text input',
      },
    ];

    function Wrapper() {
      const [pagina, setPagina] = React.useState(0);
      return (
        <div className="osc">
          <Form
            {...({
              fields: veldenMetEigenLabels,
              submitHandler: () => {},
              submitText: 'Versturen',
              prevPageText: 'Vorige',
              nextPageText: 'Volgende',
              title: '',
              currentPage: pagina,
              setCurrentPage: setPagina,
              totalPages: 2,
            } as any)}
          />
        </div>
      );
    }

    cy.mount(<Wrapper />);

    cy.get('button[type="submit"]').should(
      'contain.text',
      'Verder naar deel 2'
    );
    knopNaamKlopt('button[type="submit"]');

    cy.get('button[type="submit"]').click();
    knopNaamKlopt('.osc-prev-button');
  });
});
