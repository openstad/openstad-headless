import { beforeEach, describe, expect, it, vi } from 'vitest';

import { waitForDuplication } from './use-project';

type Reply = { status: number; body?: unknown } | Error;

function replies(...list: Reply[]) {
  let index = 0;
  return vi.fn(async () => {
    const reply = list[Math.min(index, list.length - 1)];
    index += 1;
    if (reply instanceof Error) throw reply;
    return {
      ok: reply.status >= 200 && reply.status < 300,
      status: reply.status,
      json: async () => reply.body,
    };
  }) as unknown as typeof fetch;
}

const fast = { interval: 1, timeoutMs: 200 };

beforeEach(() => {
  vi.spyOn(console, 'error').mockImplementation(() => {});
});

describe('waitForDuplication', () => {
  it('polls the status of the new project', async () => {
    const fetcher = replies({ status: 200, body: { status: 'done' } });

    await waitForDuplication(42, { ...fast, fetcher });

    expect(fetcher).toHaveBeenCalledWith(
      '/api/openstad/api/project/42/duplication-status'
    );
  });

  it('keeps polling until the duplication is done', async () => {
    const fetcher = replies(
      { status: 200, body: { status: 'running' } },
      { status: 200, body: { status: 'done' } }
    );

    expect(await waitForDuplication(42, { ...fast, fetcher })).toEqual({
      status: 'done',
      errors: [],
    });
    expect(fetcher).toHaveBeenCalledTimes(2);
  });

  it('returns the errors and leftover data of a failed duplication', async () => {
    const errors = [{ step: 'Widgets', error: 'kapot' }];
    const duplicatedData = { rollbackSessionId: 'abc', projectId: 42 };
    const fetcher = replies({
      status: 200,
      body: { status: 'failed', errors, duplicatedData },
    });

    expect(await waitForDuplication(42, { ...fast, fetcher })).toEqual({
      status: 'failed',
      errors,
      duplicatedData,
    });
  });

  it.each([403, 404])(
    'stops with an error when the api answers %i',
    async (status) => {
      const fetcher = replies(
        { status },
        { status: 200, body: { status: 'done' } }
      );

      const result = await waitForDuplication(42, { ...fast, fetcher });

      expect(result.status).toBe('failed');
      expect(result.errors).toEqual([
        {
          step: 'Status ophalen',
          error: `De voortgang kon niet worden opgehaald (status ${status}).`,
        },
      ]);
      expect(fetcher).toHaveBeenCalledTimes(1);
    }
  );

  it('keeps polling after a server error', async () => {
    const fetcher = replies(
      { status: 500 },
      { status: 200, body: { status: 'done' } }
    );

    expect((await waitForDuplication(42, { ...fast, fetcher })).status).toBe(
      'done'
    );
    expect(fetcher).toHaveBeenCalledTimes(2);
  });

  it('keeps polling after a network error', async () => {
    const fetcher = replies(new Error('offline'), {
      status: 200,
      body: { status: 'done' },
    });

    expect((await waitForDuplication(42, { ...fast, fetcher })).status).toBe(
      'done'
    );
  });

  it('reports a duplication that is still running at the deadline', async () => {
    const fetcher = replies({ status: 502 });

    expect(
      await waitForDuplication(42, { interval: 1, timeoutMs: 20, fetcher })
    ).toEqual({ status: 'running', errors: [] });
  });
});
