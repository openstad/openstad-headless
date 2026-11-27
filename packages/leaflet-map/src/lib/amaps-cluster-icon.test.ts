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

describe('amapsCreateClusterIcon styling hooks', () => {
  function iconHtml(markers: any[], categories: Record<string, any> = {}) {
    const cluster = {
      getChildCount: () => markers.length,
      getAllChildMarkers: () => markers,
    } as any;
    return String(
      (
        amapsCreateClusterIcon(cluster, {
          categorizeByField: 'tag',
          categories,
        } as any) as any
      ).options.html
    );
  }

  it('gives markers without a category the default segment', () => {
    const html = iconHtml([{ options: {} }]);
    expect(html).toContain(
      'class="osc-map-marker-cluster-segment osc-map-marker-cluster-segment-default"'
    );
    expect(html).toContain('stroke="#164995"');
  });

  it('keeps category segments out of the default class', () => {
    const html = iconHtml([{ options: { data: { tag: 'a' } } }], {
      a: { color: '#ff0000' },
    });
    expect(html).not.toContain('osc-map-marker-cluster-segment-default');
    expect(html).toContain('class="osc-map-marker-cluster-segment"');
    expect(html).toContain('stroke="#ff0000"');
  });

  it('marks the count for styling', () => {
    expect(iconHtml([{ options: {} }])).toContain(
      'class="osc-map-marker-cluster-count'
    );
  });
});
