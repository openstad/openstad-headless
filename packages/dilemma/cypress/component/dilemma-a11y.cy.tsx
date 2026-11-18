import '../../../enquete/src/enquete.scss';
import DilemmaField from '../../src/dilemma';

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

describe('<DilemmaField /> a11y', () => {
  beforeEach(() => {
    cy.mount(
      <DilemmaField
        {...({
          fieldKey: 'dilemma',
          title: 'Dilemma',
          imageClickable: true,
          dilemmas: [
            {
              id: '1',
              title: 'Waar geef je de ruimte aan?',
              a: {
                title: 'Parkeren',
                description: 'Meer parkeerplekken in de wijk.',
                image: IMAGE,
              },
              b: {
                title: 'Groen',
                description: 'Meer bomen en planten.',
                image: IMAGE,
              },
            },
          ],
        } as any)}
      />
    );
  });

  it('keeps only phrasing content inside the option labels', () => {
    cy.get('.dilemma-option label').each(($label) => {
      expect(
        $label.find(BLOCK_OR_INTERACTIVE).length,
        'block or interactive content in label'
      ).to.eq(0);
    });
  });

  it('names each option after its title and describes it with its description', () => {
    cy.get('.dilemma-option input[type="radio"]')
      .should('have.length', 2)
      .then(($inputs) => {
        const doc = $inputs[0].ownerDocument;
        const inputs = $inputs.toArray();
        expect(
          inputs.map((input) =>
            textOfIds(doc, input.getAttribute('aria-labelledby') || undefined)
          )
        ).to.deep.eq(['Parkeren', 'Groen']);
        expect(
          inputs.map((input) =>
            textOfIds(doc, input.getAttribute('aria-describedby') || undefined)
          )
        ).to.deep.eq([
          'Meer parkeerplekken in de wijk.',
          'Meer bomen en planten.',
        ]);
      });
  });

  it('keeps a zoom button per option that returns focus after closing', () => {
    cy.get('.dilemma-option .osc-clickable-image-zoom').should(
      'have.length',
      2
    );
    cy.get('.dilemma-option .osc-clickable-image-zoom').first().focus().click();
    cy.get('[role="dialog"]').should('exist');
    cy.focused().type('{esc}');
    cy.get('[role="dialog"]').should('not.exist');
    cy.focused().should('have.class', 'osc-clickable-image-zoom');
  });
});
