import { describe, expect, test, vi } from 'vitest';

import user from './user';

const bound = () => {
  const self = {
    fetchWithStatus: vi.fn().mockResolvedValue({ status: 200, data: {} }),
  };
  return {
    self,
    exchangeLogin: user.exchangeLogin.bind(self),
    loginWithUniqueCode: user.loginWithUniqueCode.bind(self),
    completeFields: user.completeFields.bind(self),
  };
};

describe('inline login api calls', () => {
  test('exchangeLogin posts the source jwt and allows the flow statuses', async () => {
    const api = bound();
    await api.exchangeLogin({ projectId: 3, sourceJwt: 'jwt-2' });

    const [url, options, statuses] = api.self.fetchWithStatus.mock.calls[0];
    expect(url).toBe('/auth/project/3/exchange?useAuth=default');
    expect(JSON.parse(options.body)).toEqual({ sourceJwt: 'jwt-2' });
    expect(statuses).toEqual([401, 403, 409]);
  });

  test('loginWithUniqueCode lets the lockout through as data', async () => {
    const api = bound();
    await api.loginWithUniqueCode({ projectId: 3, code: 'ABC' });

    expect(api.self.fetchWithStatus.mock.calls[0][2]).toContain(429);
  });

  test('completeFields sends the pending jwt and fields', async () => {
    const api = bound();
    await api.completeFields({
      projectId: 3,
      pendingJwt: 'p',
      fields: { name: 'Jan' },
    });

    expect(JSON.parse(api.self.fetchWithStatus.mock.calls[0][1].body)).toEqual({
      pendingJwt: 'p',
      fields: { name: 'Jan' },
    });
  });
});
