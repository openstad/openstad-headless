import { readFileSync } from 'node:fs';
import { join } from 'node:path';
import { describe, expect, it } from 'vitest';

// Het keuzevlak zet zijn maten met custom properties waarvan de defaults in
// :root staan. De widget-build scopet alle CSS onder `.openstad` en gooit
// :root daarbij weg, dus die defaults halen productie niet. Zonder fallback in
// de var() wordt width/height ongeldig en dus `auto`: het vlak groeit naar de
// natuurlijke beeldgrootte en het paneel bedekt bij 200% zoom het hele scherm
// (bevinding GTT-33.F10, WCAG 1.4.4). Live gemeten: 653px in plaats van 229px.
const css = readFileSync(join(__dirname, 'style.css'), 'utf8');

describe('choiceguide maatvoering', () => {
  it('gebruikt nergens een base-size-variabele zonder fallback', () => {
    const zonderFallback = css.match(
      /var\(\s*--choiceguide-(half-)?base-size\s*\)/g
    );
    expect(zonderFallback).toBeNull();
  });

  // De 0fr-truc klapte het paneel live niet in: de rij bleef op de
  // contenthoogte staan, ook met !important. Zonder inklappen blijft het paneel
  // bij 200% zoom over de pagina liggen.
  it('klapt het paneel echt in als het dicht staat', () => {
    const dicht = css.match(
      /\.expand-container\[aria-hidden='true'\]\s*\{[^}]*\}/
    );
    expect(dicht?.[0]).toMatch(/display:\s*none/);
  });

  it('heeft de defaults nog in :root staan als bron van waarheid', () => {
    expect(css).toMatch(/--choiceguide-base-size:\s*180px/);
    expect(css).toMatch(/--choiceguide-half-base-size:\s*90px/);
  });
});
