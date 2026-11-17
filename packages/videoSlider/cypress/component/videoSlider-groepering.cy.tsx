import React from 'react';

import { VideoSlider } from '../../src/videoSlider';

// De antwoordopties per slide stonden in een kale <ul>, met de vraag als los <h2>
// ernaast. Een schermlezer gaf daardoor de bovenliggende vraag niet mee bij het
// doorlopen van de opties. LIA-bevinding, WCAG 1.3.1 / 3.3.2.
const checkboxVraag = 'Wat zou je helpen om meer te sporten?';
const radioVraag = 'Hoe vaak sport je nu?';

const opties = (prefix: string) => [
  { id: `${prefix}-1`, trigger: '1', titles: [{ key: `${prefix} optie A` }] },
  { id: `${prefix}-2`, trigger: '2', titles: [{ key: `${prefix} optie B` }] },
];

const items = [
  {
    id: 'vraag-checkbox',
    trigger: 'vraag-checkbox',
    questionType: 'multiple',
    title: checkboxVraag,
    options: opties('checkbox'),
  },
  {
    id: 'vraag-radio',
    trigger: 'vraag-radio',
    questionType: 'multiplechoice',
    title: radioVraag,
    options: opties('radio'),
  },
];

describe('videoslider vraaggroepering', () => {
  it('groepeert de checkboxopties in een fieldset met de vraag als legend', () => {
    cy.mount(<VideoSlider {...({ items } as any)} />);

    cy.get('fieldset:has(input[type="checkbox"]) > legend').should(
      'have.text',
      checkboxVraag
    );
  });

  it('groepeert de radio-opties in een fieldset met de vraag als legend', () => {
    cy.mount(<VideoSlider {...({ items } as any)} />);

    cy.get('fieldset:has(input[type="radio"]) > legend').should(
      'have.text',
      radioVraag
    );
  });

  it('houdt de legend buiten beeld, de zichtbare kop blijft staan', () => {
    cy.mount(<VideoSlider {...({ items } as any)} />);

    cy.get('fieldset:has(input[type="checkbox"]) > legend').should(
      'not.be.visible'
    );
    cy.contains('h2', checkboxVraag).should('exist');
  });
});
