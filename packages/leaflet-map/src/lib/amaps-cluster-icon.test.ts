// @vitest-environment jsdom
import { describe, expect, it } from 'vitest';

import amapsCreateClusterIcon from './amaps-cluster-icon';

function fakeCluster(count: number) {
  return {
    getChildCount: () => count,
    getAllChildMarkers: () => [],
  } as any;
}

describe('amapsCreateClusterIcon accessibility', () => {
  const html = String(
    (amapsCreateClusterIcon(fakeCluster(12), undefined) as any).options.html
  );

  it('hides the svg from screen readers', () => {
    expect(html).toContain('<svg viewBox="0 0 36 36" aria-hidden="true">');
  });

  it('has the Dutch screen reader text with the count', () => {
    expect(html).toContain(
      '<span class="sr-only">12 locaties gegroepeerd, druk op Enter om in te zoomen</span>'
    );
  });
});
