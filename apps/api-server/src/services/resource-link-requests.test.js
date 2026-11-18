import { createRequire } from 'node:module';
import { afterEach, beforeEach, describe, expect, it, vi } from 'vitest';

const require = createRequire(import.meta.url);
const pluginExtensions = require('./plugin-extensions');
const {
  parseSelection,
  parseRemoved,
  assertHandlerAvailable,
  submitSelection,
} = require('./resource-link-requests');

function withHandler(handler) {
  vi.spyOn(pluginExtensions, 'get').mockReturnValue({
    getLinkRequestHandler: () => handler,
  });
}

describe('parseSelection', () => {
  it('returns null when no links are given', () => {
    expect(parseSelection(undefined)).toBeNull();
    expect(parseSelection(null)).toBeNull();
  });

  it('normalizes ids to strings and keeps messages', () => {
    expect(
      parseSelection([
        { source: 'openstad', id: 2, message: 'Hoi' },
        { source: 'metkoos', id: 'abc' },
      ])
    ).toEqual([
      { source: 'openstad', id: '2', message: 'Hoi' },
      { source: 'metkoos', id: 'abc' },
    ]);
  });

  it('keeps an empty array so an edit can revoke everything', () => {
    expect(parseSelection([])).toEqual([]);
  });

  it.each([
    ['a non-array', 'openstad'],
    [
      'too many items',
      Array.from({ length: 51 }, () => ({ source: 'openstad', id: 1 })),
    ],
    ['an invalid source', [{ source: 'Not Valid', id: 1 }]],
    ['an empty id', [{ source: 'openstad', id: '' }]],
    ['an object id', [{ source: 'openstad', id: { a: 1 } }]],
    [
      'a too long message',
      [{ source: 'openstad', id: 1, message: 'x'.repeat(1001) }],
    ],
  ])('rejects %s with 422', (_label, links) => {
    expect(() => parseSelection(links)).toThrow(
      expect.objectContaining({ status: 422 })
    );
  });
});

describe('parseRemoved', () => {
  it('keeps only source and id', () => {
    expect(
      parseRemoved([{ source: 'openstad', id: 2, message: 'weg' }])
    ).toEqual([{ source: 'openstad', id: '2' }]);
  });

  it('returns null when nothing is removed', () => {
    expect(parseRemoved(undefined)).toBeNull();
  });
});

describe('link request hand-off', () => {
  let errorSpy;

  beforeEach(() => {
    errorSpy = vi.spyOn(console, 'error').mockImplementation(() => {});
  });

  afterEach(() => {
    vi.restoreAllMocks();
  });

  it('rejects a selection when no plugin handles link requests', async () => {
    withHandler(null);
    expect(() => assertHandlerAvailable([])).toThrow(
      expect.objectContaining({ status: 422 })
    );
    await expect(
      submitSelection({ resource: { id: 1 }, selection: [], mode: 'create' })
    ).rejects.toMatchObject({ status: 422 });
  });

  it('rejects removed links when no plugin handles link requests', () => {
    withHandler(null);
    expect(() =>
      assertHandlerAvailable(null, [{ source: 'openstad', id: '2' }])
    ).toThrow(expect.objectContaining({ status: 422 }));
  });

  it('passes removed links and defaults to empty lists', async () => {
    const submit = vi.fn().mockResolvedValue({ removed: 1 });
    withHandler({ pluginName: 'fixture', submit });

    await submitSelection({
      resource: { id: 5 },
      selection: null,
      removed: [{ source: 'openstad', id: '2' }],
      mode: 'update',
    });

    expect(submit).toHaveBeenCalledWith(
      expect.objectContaining({
        selection: [],
        removed: [{ source: 'openstad', id: '2' }],
      })
    );
  });

  it('allows a request without selection when no plugin is present', async () => {
    withHandler(null);
    expect(() => assertHandlerAvailable(null)).not.toThrow();
    expect(
      await submitSelection({ resource: { id: 1 }, selection: null })
    ).toBeNull();
  });

  it('returns the plugin result', async () => {
    const submit = vi.fn().mockResolvedValue({ received: 1 });
    withHandler({ pluginName: 'fixture', submit });

    const args = {
      project: { id: 1 },
      resource: { id: 5 },
      selection: [{ source: 'openstad', id: '2' }],
      user: { id: 3 },
      mode: 'update',
    };

    expect(await submitSelection(args)).toEqual({ received: 1 });
    expect(submit).toHaveBeenCalledWith({ ...args, removed: [] });
  });

  it('returns the plugin error without failing the request', async () => {
    withHandler({
      pluginName: 'fixture',
      submit: vi.fn().mockRejectedValue(new Error('boom')),
    });

    expect(
      await submitSelection({
        resource: { id: 5 },
        selection: [],
        mode: 'create',
      })
    ).toEqual({ error: 'boom' });
    expect(errorSpy).toHaveBeenCalledWith(
      expect.stringContaining('resource 5'),
      'boom'
    );
  });
});
