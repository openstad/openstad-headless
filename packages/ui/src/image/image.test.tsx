import React from 'react';
import { renderToStaticMarkup } from 'react-dom/server';
import { describe, expect, it } from 'vitest';

import { Image, focalPointStyle } from './index';

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

describe('focalPoint', () => {
  it('focalPointStyle returns objectPosition or undefined', () => {
    expect(focalPointStyle({ x: 30, y: 70.5 })).toEqual({
      objectPosition: '30% 70.5%',
    });
    expect(focalPointStyle(undefined)).toBeUndefined();
    expect(focalPointStyle(null)).toBeUndefined();
  });

  it('sets object-position, merges with style, and adds no DOM attribute', () => {
    const markup = renderToStaticMarkup(
      <Image
        src="/a.jpg"
        focalPoint={{ x: 20, y: 80 }}
        style={{ opacity: 0.5 }}
      />
    );
    expect(markup).toContain('object-position:20% 80%');
    expect(markup).toContain('opacity:0.5');
    expect(markup.toLowerCase()).not.toContain('focalpoint');
  });

  it('renders no object-position without a focal point', () => {
    expect(renderToStaticMarkup(<Image src="/a.jpg" />)).not.toContain(
      'object-position'
    );
  });
});
