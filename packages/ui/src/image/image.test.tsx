import { renderToStaticMarkup } from 'react-dom/server';
import { describe, expect, it } from 'vitest';

import { Image } from './index';

const inDeLink = (markup: string) =>
  markup.match(/<a[^>]*>([\s\S]*?)<\/a>/)?.[1] ?? '';

describe('Image', () => {
  it('laat alleen de afbeelding in de link, niet de figcaption (WCAG 2.5.3)', () => {
    const markup = renderToStaticMarkup(
      <Image
        src="/foto.jpg"
        href="/foto.jpg"
        linkLabel="Bekijk afbeelding (opent in nieuw tabblad)"
        imageFooter={<p>Reageer op deze inzending</p>}
      />
    );

    expect(inDeLink(markup)).toContain('<img');
    // de statustekst zou anders de zichtbare linknaam worden
    expect(inDeLink(markup)).not.toContain('Reageer op deze inzending');
    expect(markup).toContain('Reageer op deze inzending');
  });

  it('rendert geen link zonder href', () => {
    expect(renderToStaticMarkup(<Image src="/foto.jpg" />)).not.toContain('<a');
  });
});
