import React from 'react';
import { renderToStaticMarkup } from 'react-dom/server';
import { describe, expect, test } from 'vitest';

import { GridderResourceDetail } from './gridder-resource-detail';

const resource = {
  id: 1,
  title: 'Speeltuin',
  summary: 'Samenvatting',
  description: 'Beschrijving',
  images: [{ url: 'https://example.com/foto.jpg' }],
  tags: [],
};

const render = (props: Record<string, unknown> = {}) =>
  renderToStaticMarkup(
    <GridderResourceDetail {...({ resource, ...props } as any)} />
  );

describe('GridderResourceDetail', () => {
  test('shows the image by default', () => {
    expect(render()).toContain('foto.jpg');
  });

  test('hides the image when displayImage is false', () => {
    const markup = render({ displayImage: false });
    expect(markup).not.toContain('foto.jpg');
    expect(markup).toContain('osc-gridder-resource-detail-budget-theme-bar');
  });

  test('drops the photo section when image, budget and tags are all hidden', () => {
    expect(
      render({ displayImage: false, displayBudget: false, displayTags: false })
    ).not.toContain('osc-gridder-resource-detail-photo');
  });
});
