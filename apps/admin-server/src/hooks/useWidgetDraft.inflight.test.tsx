// @vitest-environment jsdom
import { act } from 'react';
import { type Root, createRoot } from 'react-dom/client';
import { SWRConfig, useSWRConfig } from 'swr';
import { afterEach, beforeEach, describe, expect, it, vi } from 'vitest';

import { useWidgetDraft } from './useWidgetDraft';

vi.mock('next/router', () => ({
  useRouter: () => ({
    query: { id: '5', project: '2' },
    isReady: true,
    events: { on() {}, off() {}, emit() {} },
  }),
}));

vi.mock('@/components/ui/save-controller', () => ({
  useRegisterSave() {},
  useSaveController: () => ({ invalidateInFlightSave() {} }),
}));

(globalThis as any).IS_REACT_ACT_ENVIRONMENT = true;

const KEY = '/api/openstad/api/project/2/widgets/5?includeType=1';

let stored: any;
let releasePut: (() => void) | null;
let puts: any[];

function respond(body: any) {
  return { ok: true, status: 200, statusText: 'OK', json: async () => body };
}

let api: ReturnType<typeof useWidgetDraft<any>>;
let revalidate: () => Promise<unknown>;

function Editor() {
  api = useWidgetDraft<any>({});
  const { mutate } = useSWRConfig();
  revalidate = () => mutate(KEY);
  return null;
}

const tick = (ms = 0) =>
  act(async () => {
    await new Promise((resolve) => setTimeout(resolve, ms));
  });

describe('useWidgetDraft: edits made while a save is running', () => {
  let root: Root;

  beforeEach(async () => {
    stored = { flag: false, title: 'A' };
    releasePut = null;
    puts = [];
    vi.stubGlobal('fetch', async (_url: string, init?: any) => {
      if (init?.method === 'PUT') {
        const body = JSON.parse(init.body);
        puts.push(body.config);
        await new Promise<void>((resolve) => (releasePut = resolve));
        stored = { ...stored, ...body.config };
      }
      return respond({ id: 5, config: stored });
    });
    root = createRoot(document.createElement('div'));
    act(() =>
      root.render(
        <SWRConfig
          value={{
            provider: () => new Map(),
            dedupingInterval: 0,
            fetcher: (url: string) => fetch(url).then((res: any) => res.json()),
          }}>
          <Editor />
        </SWRConfig>
      )
    );
    await tick(20);
    await tick(20);
  });

  afterEach(() => {
    act(() => root.unmount());
    vi.unstubAllGlobals();
  });

  async function startSave() {
    let done!: Promise<void>;
    await act(async () => {
      done = api.save();
      await new Promise((resolve) => setTimeout(resolve, 10));
    });
    return async () => {
      await act(async () => {
        releasePut!();
        await done;
      });
      await tick(20);
    };
  }

  it('keeps a field set back to its old value during the save', async () => {
    act(() => api.onFieldChanged('flag', true));
    await tick();
    const finish = await startSave();
    expect(puts[0]).toEqual({ flag: true });

    act(() => api.onFieldChanged('flag', false));
    await tick();
    await finish();

    expect(stored.flag).toBe(true);
    expect(api.previewConfig?.flag).toBe(false);
    expect(api.isDirty).toBe(true);
  });

  it('still follows a change made elsewhere during the save', async () => {
    act(() => api.onFieldChanged('flag', true));
    await tick();
    const finish = await startSave();

    stored = { ...stored, title: 'B' };
    await act(async () => {
      await revalidate();
    });
    await tick(20);
    expect(api.previewConfig?.title).toBe('B');
    expect(api.previewConfig?.flag).toBe(true);

    await finish();
    expect(api.previewConfig).toMatchObject({ flag: true, title: 'B' });
    expect(api.isDirty).toBe(false);
  });
});
