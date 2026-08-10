// Widgets staan ingebed in een CMS-pagina die zelf al een <h1> heeft. Een widget
// mag dus nooit een eigen h1 produceren, en zijn subkoppen moeten aansluiten op
// het niveau van zijn eigen titel — anders sla je niveaus over (WCAG 1.3.1).
//
// Gebruik: const [hTitle, hSection, hSub] = headingLevels(props.headingLevel);

export type HeadingLevel = 2 | 3 | 4;
type Level = 2 | 3 | 4 | 5 | 6;

const clamp = (n: number): Level => Math.min(Math.max(n, 2), 6) as Level;

export function headingLevels(base?: number | string): [Level, Level, Level] {
  const b = clamp(Number(base) || 2);
  return [b, clamp(b + 1), clamp(b + 2)];
}
