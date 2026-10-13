import toast from 'react-hot-toast';
import { beforeEach, describe, expect, it, vi } from 'vitest';

import { restoreWidgetVersion } from './use-widget-versions';

vi.mock('react-hot-toast', () => ({ default: { error: vi.fn() } }));

const url = '/api/openstad/api/project/2/widgets/102/versions/5/restore';

function setup(fetcher: typeof fetch) {
  const calls: string[] = [];
  const deps = {
    url,
    fetcher,
    mutateVersions: vi.fn(async () => {
      calls.push('versions');
    }),
    mutateWidget: vi.fn(async () => {
      calls.push('widget');
    }),
    resetPreview: vi.fn(() => {
      calls.push('reset');
    }),
  };
  return { deps, calls };
}

function respond(ok: boolean, body: unknown = {}) {
  return vi.fn(async () => ({
    ok,
    json: async () => body,
  })) as unknown as typeof fetch;
}

beforeEach(() => {
  vi.mocked(toast.error).mockClear();
});

describe('restoreWidgetVersion', () => {
  it('posts to the restore url', async () => {
    const fetcher = respond(true);
    const { deps } = setup(fetcher);

    await restoreWidgetVersion(deps);

    expect(fetcher).toHaveBeenCalledWith(url, {
      method: 'POST',
      headers: { 'Content-Type': 'application/json' },
    });
  });

  it('refreshes the versions and the widget before resetting the editor', async () => {
    const { deps, calls } = setup(respond(true, { undoVersionId: 7 }));

    const result = await restoreWidgetVersion(deps);

    expect(calls).toEqual(['versions', 'widget', 'reset']);
    expect(result).toEqual({ ok: true, undoVersionId: 7 });
    expect(toast.error).not.toHaveBeenCalled();
  });

  it('returns no undo version when the api sends none', async () => {
    const { deps } = setup(respond(true, {}));

    expect(await restoreWidgetVersion(deps)).toEqual({
      ok: true,
      undoVersionId: null,
    });
  });

  it('keeps the editor as it is when the api refuses the restore', async () => {
    const { deps, calls } = setup(respond(false));

    const result = await restoreWidgetVersion(deps);

    expect(calls).toEqual([]);
    expect(result).toEqual({ ok: false, undoVersionId: null });
    expect(toast.error).toHaveBeenCalledWith(
      'De versie kon niet worden hersteld'
    );
  });

  it('keeps the editor as it is when the request fails', async () => {
    const fetcher = vi.fn(async () => {
      throw new Error('network');
    }) as unknown as typeof fetch;
    const { deps, calls } = setup(fetcher);

    const result = await restoreWidgetVersion(deps);

    expect(calls).toEqual([]);
    expect(result).toEqual({ ok: false, undoVersionId: null });
    expect(toast.error).toHaveBeenCalledTimes(1);
  });
});
