import { describe, expect, it } from 'vitest';

import { routeParamsKey } from './route-params-key';

describe('routeParamsKey', () => {
  const editor = '/projects/[project]/widgets/agenda/[id]';

  it('changes when another widget of the same type is opened', () => {
    expect(routeParamsKey(editor, { project: '2', id: '70' })).not.toBe(
      routeParamsKey(editor, { project: '2', id: '71' })
    );
  });

  it('stays the same when only a tab in the query changes', () => {
    expect(routeParamsKey(editor, { project: '2', id: '70' })).toBe(
      routeParamsKey(editor, { project: '2', id: '70', tab: 'items' })
    );
  });

  it('reads catch-all segments', () => {
    const page = '/projects/[project]/widgets/[...widgetPath]';
    expect(routeParamsKey(page, { project: '2', widgetPath: ['a', 'b'] })).toBe(
      `${page}|2|a/b`
    );
    expect(routeParamsKey('/[[...slug]]', { slug: ['x'] })).toBe(
      '/[[...slug]]|x'
    );
  });

  it('is just the path for a page without segments', () => {
    expect(routeParamsKey('/projects', { tab: 'x' })).toBe('/projects');
  });
});
