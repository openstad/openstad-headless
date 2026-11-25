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

describe('amapsCreateClusterIcon colours', () => {
  const attack = '"/><img src=x onerror=alert(1)>';
  const rgbAttack = 'rgb("/><img src=x onerror=alert`1`>)';

  function clusterWith(color: string) {
    const cluster = {
      getChildCount: () => 1,
      getAllChildMarkers: () => [{ options: { data: { tag: 'a' } } }],
    } as any;
    return String(
      (
        amapsCreateClusterIcon(cluster, {
          categorizeByField: 'tag',
          categories: { a: { color } },
        } as any) as any
      ).options.html
    );
  }

  it('keeps a normal category colour', () => {
    expect(clusterWith('#ff0000')).toContain('stroke="#ff0000"');
    expect(clusterWith('rgb(255, 0, 0)')).toContain('stroke="rgb(255, 0, 0)"');
  });

  it.each([attack, rgbAttack])('drops a colour that breaks out: %s', (c) => {
    const html = clusterWith(c);
    expect(html).not.toContain('<img');
    expect(html).toContain('stroke="#000000"');
  });
});
