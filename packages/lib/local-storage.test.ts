import { afterEach, beforeEach, describe, expect, test, vi } from 'vitest';

import { LocalStorage } from './local-storage';

describe('LocalStorage', () => {
  let originalWindow: any;
  let setItem: ReturnType<typeof vi.fn>;

  beforeEach(() => {
    originalWindow = (global as any).window;
    const items: Record<string, string> = {
      openstad: JSON.stringify({ 6: { cmsUser: { id: 1 } } }),
    };
    setItem = vi.fn((key: string, value: string) => {
      items[key] = value;
    });
    (global as any).window = {
      localStorage: { getItem: (key: string) => items[key] ?? null, setItem },
    };
  });

  afterEach(() => {
    (global as any).window = originalWindow;
  });

  test('does not write when the value is unchanged', () => {
    new LocalStorage({ projectId: '6' }).set('cmsUser', { id: 1 });
    expect(setItem).not.toHaveBeenCalled();
  });

  test('writes when the value changes', () => {
    new LocalStorage({ projectId: '6' }).set('cmsUser', { id: 2 });
    expect(setItem).toHaveBeenCalledTimes(1);
  });

  test('does not write when removing a missing key', () => {
    new LocalStorage({ projectId: '6' }).remove('openStadUser');
    expect(setItem).not.toHaveBeenCalled();
  });
});
