// @vitest-environment jsdom
import React from 'react';
import ReactDOMServer from 'react-dom/server';
import { describe, expect, test } from 'vitest';

import RteContent from './rte-content';

function renderMarkup(props) {
  return ReactDOMServer.renderToStaticMarkup(<RteContent {...props} />);
}

describe('RteContent forceInline', () => {
  test('flattens block tags without an inlineComponent', () => {
    const markup = renderMarkup({
      content: '<p>Welkom op <i>Doe Mee</i></p>',
      forceInline: true,
    });

    expect(markup).not.toContain('<p');
    expect(markup).toContain('Welkom op');
    expect(markup).toContain('<i>Doe Mee</i>');
  });

  test('flattens block tags into the given inlineComponent', () => {
    const markup = renderMarkup({
      content: '<p>Sorteer <strong>mij</strong></p>',
      forceInline: true,
      inlineComponent: 'strong',
    });

    expect(markup.startsWith('<strong')).toBe(true);
    expect(markup).not.toContain('<p');
    expect(markup).toContain('mij');
  });

  test('keeps block content intact without forceInline', () => {
    const markup = renderMarkup({
      content: '<p>Blijf een paragraaf</p>',
    });

    expect(markup).toContain('<p');
    expect(markup).toContain('Blijf een paragraaf');
  });
});
