import { renderToStaticMarkup } from 'react-dom/server';
import { describe, expect, it } from 'vitest';

import SelectField from './select';

// De auditor vond op /verdeelmodule en /emoji-slider invoervelden met een
// aria-describedby die naar een id wees dat nergens bestaat (bevinding
// GTT-33.F48, WCAG 1.3.1). Het foutelement wordt namelijk pas gerenderd als
// er daadwerkelijk een fout is — de verwijzing stond er altijd.
const props = {
  title: 'Kies een optie',
  fieldKey: 'keuze',
  randomId: 'abc',
  choices: [{ value: 'a', label: 'A' }],
} as any;

describe('aria-describedby naar het foutelement', () => {
  it('verwijst niet naar _error zolang het veld geldig is', () => {
    const markup = renderToStaticMarkup(<SelectField {...props} />);
    expect(markup).toContain('<select');
    expect(markup).not.toContain('abc_error');
  });

  it('verwijst wel naar _error zodra het veld ongeldig is', () => {
    const markup = renderToStaticMarkup(
      <SelectField {...props} fieldInvalid={true} />
    );
    expect(markup).toContain('aria-describedby="abc_error"');
  });
});
