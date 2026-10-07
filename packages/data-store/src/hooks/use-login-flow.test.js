import { afterEach, beforeEach, describe, expect, test, vi } from 'vitest';

import useLoginFlow from './use-login-flow';

// Minimal hook runtime: the flow is called once, state lives in `hook`
let hook;
vi.mock('react', () => ({
  useState: (initial) => [
    initial,
    (value) => {
      hook.dialog = typeof value === 'function' ? value(hook.dialog) : value;
    },
  ],
  useRef: (initial) => (hook.ref ??= { current: initial }),
}));

const apiUrl = 'https://api.example.com';
const loginUrl = `${apiUrl}/auth/project/2/login?useAuth=default`;
const jwtFor = (sub) =>
  `x.${btoa(JSON.stringify({ sub, exp: Date.now() / 1000 + 3600 }))}.y`;

describe('useLoginFlow popup login', () => {
  let stored;
  let popup;
  let self;
  let flow;

  const storeLogin = (projectId, jwt) => {
    stored[projectId] = { openStadUser: { jwt, apiUrl } };
  };

  beforeEach(() => {
    vi.useFakeTimers();
    hook = { dialog: null };
    stored = {};
    popup = { closed: false, location: { href: '' }, close: vi.fn() };
    vi.stubGlobal('window', {
      open: vi.fn(() => popup),
      localStorage: { getItem: () => JSON.stringify(stored) },
      addEventListener: vi.fn(),
      removeEventListener: vi.fn(),
      setInterval: (callback, ms) => setInterval(callback, ms),
      clearInterval: (id) => clearInterval(id),
    });
    vi.stubGlobal('document', { cookie: '', location: { href: 'page' } });
    self = {
      api: { apiUrl, user: { exchangeLogin: vi.fn() } },
      projectId: 2,
      applyJwt: vi.fn(),
    };
    flow = useLoginFlow.call(self, { multiProjectLogin: true });
  });

  afterEach(() => {
    vi.useRealTimers();
    vi.unstubAllGlobals();
  });

  test('opens the popup within the click when no identity is known', async () => {
    flow.requireLogin({ loginUrl });

    expect(window.open).toHaveBeenCalledTimes(1);
    await vi.advanceTimersByTimeAsync(0);
    expect(new URL(popup.location.href).searchParams.get('popup')).toBe('1');
  });

  test('tries the known identity before opening a window', async () => {
    storeLogin(3, jwtFor(1));
    self.api.user.exchangeLogin.mockResolvedValue({
      status: 409,
      data: { status: 'uniquecode_required' },
    });

    flow.requireLogin({ loginUrl });
    await vi.advanceTimersByTimeAsync(0);

    expect(window.open).not.toHaveBeenCalled();
    expect(hook.dialog.step).toBe('uniquecode');
  });

  test('offers a same-window login when the popup is blocked', async () => {
    window.open.mockReturnValue(null);
    const onBeforeRedirect = vi.fn();

    flow.requireLogin({ loginUrl, onBeforeRedirect });
    await vi.advanceTimersByTimeAsync(0);

    expect(hook.dialog.step).toBe('blocked');
    expect(document.location.href).toBe('page');

    flow.dialogProps.onRedirect();
    expect(onBeforeRedirect).toHaveBeenCalled();
    expect(document.location.href).toBe(loginUrl);
  });

  test('treats a popup that closes right away as blocked', async () => {
    flow.requireLogin({ loginUrl });
    popup.closed = true;
    await vi.advanceTimersByTimeAsync(500);

    expect(hook.dialog.step).toBe('blocked');
  });

  test('resolves when another tab stores a login for this project', async () => {
    const result = flow.requireLogin({ loginUrl });
    await vi.advanceTimersByTimeAsync(0);
    const jwt = jwtFor(9);
    storeLogin(2, jwt);
    await vi.advanceTimersByTimeAsync(500);

    expect(await result).toBe(true);
    expect(self.applyJwt).toHaveBeenCalledWith(jwt);
    expect(popup.close).toHaveBeenCalled();
  });

  test('resolves false when the user closes the popup later', async () => {
    const result = flow.requireLogin({ loginUrl });
    await vi.advanceTimersByTimeAsync(2000);
    popup.closed = true;
    await vi.advanceTimersByTimeAsync(500);

    expect(await result).toBe(false);
    expect(hook.dialog).toBe(null);
  });
});
