// Widgets staan meestal ingebed in een CMS-pagina die zelf al een <h1> heeft, en
// hun subkoppen moeten aansluiten op het niveau van hun eigen titel — anders sla
// je niveaus over (WCAG 1.3.1). Vandaar h2 als default.
//
// Uitzondering: een widget die zélf de hoofdinhoud van de pagina is, mag de h1
// leveren. Dat geldt voor resource-detail met "Inzending titel gebruiken als
// paginatitel" — dan ís de inzendingstitel de paginatitel. Die keuze ligt bij de
// redacteur, dus h1 kan alleen als er expliciet om gevraagd wordt; leeg of onzin
// blijft h2.
//
// Gebruik: const [hTitle, hSection, hSub] = headingLevels(props.headingLevel);

export type HeadingLevel = 1 | 2 | 3 | 4;
type Level = 1 | 2 | 3 | 4 | 5 | 6;
// Subkoppen zitten altijd onder de titel, dus die kunnen nooit h1 zijn. Dat is
// niet alleen waar in de praktijk maar ook in het type, zodat componenten die
// een subkop verwachten geen h1 aangeboden kunnen krijgen.
type SubLevel = 2 | 3 | 4 | 5 | 6;

const clamp = (n: number): SubLevel => Math.min(Math.max(n, 2), 6) as SubLevel;

export function headingLevels(
  base?: number | string
): [Level, SubLevel, SubLevel] {
  const gevraagd = Number(base);
  const b: Level = gevraagd === 1 ? 1 : clamp(gevraagd || 2);
  return [b, clamp(b + 1), clamp(b + 2)];
}
