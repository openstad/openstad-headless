import React from 'react';

import { Enquete, EnqueteWidgetProps } from '../../src/enquete';

const IMAGE =
  "data:image/svg+xml;utf8,<svg xmlns='http://www.w3.org/2000/svg' width='400' height='200'><rect width='400' height='200' fill='%23999'/></svg>";

const HOST_CSS = `
  .a-b-slider-container { align-items: center; }
  .openstad .utrecht-form-field__label { order: 1; }
`;

const createConfig = (
  scaleDisplay: 'smileys' | 'numbers',
  itemOverrides: Record<string, unknown> = {}
): EnqueteWidgetProps =>
  ({
    api: { url: 'http://localhost:31410' },
    projectId: '1',
    widgetId: 200,
    title: 'Youth Enquete',
    displayTitle: false,
    formVisibility: 'always',
    formStyle: 'youth',
    items: [
      {
        key: '',
        trigger: '1',
        fieldKey: 'scaleField',
        title: 'How satisfied are you?',
        description: '',
        questionType: 'scale',
        scaleDisplay,
        scaleStepCount: 5,
        image: IMAGE,
        imageAlt: 'Test image',
        fieldRequired: false,
        options: [],
        matrix: { rows: [], columns: [] },
        ...itemOverrides,
      },
    ],
  }) as unknown as EnqueteWidgetProps;

const rect = (selector: string) =>
  cy
    .get(selector)
    .first()
    .then(($el) => $el[0].getBoundingClientRect());

const TOLERANCE = 2;

const mountYouthScale = (config: EnqueteWidgetProps) => {
  cy.viewport(900, 900);
  cy.mount(
    <div className="openstad">
      <style>{HOST_CSS}</style>
      <Enquete {...config} />
    </div>
  );
  cy.get('.question-type-tickmark-slider input[type="range"]').should(
    'be.visible'
  );
  cy.get('.question-type-tickmark-slider figure img').should(($img) => {
    const image = $img[0] as HTMLImageElement;
    expect(image.complete && image.naturalWidth > 0).to.equal(true);
  });
};

const expectLayout = (withDescription: boolean) => {
  const slider = '.question-type-tickmark-slider';
  const img = `${slider} figure.info-image-container`;
  const title = `${slider} .utrecht-form-field__label`;
  const steps = `${slider} .range-slider-labels`;
  const range = `${slider} input[type="range"]`;

  rect(img).then((image) => {
    rect(title).then((titleRect) => {
      rect(steps).then((stepsRect) => {
        rect(range).then((rangeRect) => {
          expect(image.bottom, 'image bottom <= title top').to.be.at.most(
            titleRect.top + TOLERANCE
          );
          expect(titleRect.bottom, 'title bottom <= steps top').to.be.at.most(
            stepsRect.top + TOLERANCE
          );
          expect(stepsRect.bottom, 'steps bottom <= range top').to.be.at.most(
            rangeRect.top + TOLERANCE
          );
          expect(image.bottom, 'image bottom <= range top').to.be.at.most(
            rangeRect.top + TOLERANCE
          );
          expect(
            Math.abs(stepsRect.width - rangeRect.width),
            'steps width ~ range width'
          ).to.be.at.most(TOLERANCE);
          rect(slider).then((questionRect) => {
            expect(
              rangeRect.width,
              'range width >= 80% of the question'
            ).to.be.at.least(questionRect.width * 0.8);
          });
        });
      });
    });
  });

  cy.get(`${steps} button`).should('have.length', 5);
  cy.get(`${steps} button`).then(($buttons) => {
    const centres = [...$buttons].map((b) => {
      const r = b.getBoundingClientRect();
      return r.left + r.width / 2;
    });
    for (let i = 1; i < centres.length; i++) {
      expect(centres[i], `step ${i + 1} right of step ${i}`).to.be.greaterThan(
        centres[i - 1]
      );
    }
    rect(range).then((rangeRect) => {
      const quarter = rangeRect.width / 4;
      expect(centres[0], 'first step in left quarter').to.be.lessThan(
        rangeRect.left + quarter
      );
      expect(centres[4], 'last step in right quarter').to.be.greaterThan(
        rangeRect.right - quarter
      );
      const gaps = centres.slice(1).map((c, i) => c - centres[i]);
      expect(
        Math.abs(gaps[1] - gaps[2]),
        'middle steps evenly spaced'
      ).to.be.at.most(TOLERANCE);
    });
  });

  if (withDescription) {
    rect(title).then((titleRect) => {
      rect(`${slider} .utrecht-form-field-description`).then((descRect) => {
        rect(steps).then((stepsRect) => {
          expect(
            descRect.top,
            'description top >= title bottom'
          ).to.be.at.least(titleRect.bottom - TOLERANCE);
          expect(
            descRect.bottom,
            'description bottom <= steps top'
          ).to.be.at.most(stepsRect.top + TOLERANCE);
        });
      });
    });
  }
};

describe('Youth scale question layout', () => {
  it('smileys: image on top, steps in order over the full bar', () => {
    mountYouthScale(createConfig('smileys'));
    expectLayout(false);
  });

  it('numbers: image on top, steps in order over the full bar', () => {
    mountYouthScale(createConfig('numbers'));
    expectLayout(false);
  });

  it('keeps the description between the title and the steps', () => {
    mountYouthScale(
      createConfig('smileys', { description: 'Some extra explanation' })
    );
    expectLayout(true);
  });
});
