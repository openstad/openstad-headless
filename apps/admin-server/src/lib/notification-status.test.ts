import { afterEach, beforeEach, describe, expect, it, vi } from 'vitest';

import {
  NOTIFICATION_STATUS_MAX_ATTEMPTS,
  NOTIFICATION_STATUS_POLL_INTERVAL_MS,
  waitForNotificationStatus,
} from './notification-status';

const jsonResponse = (body: unknown, status = 200) =>
  ({
    ok: status >= 200 && status < 300,
    status,
    json: async () => body,
  }) as Response;

describe('waitForNotificationStatus', () => {
  let fetchMock: ReturnType<typeof vi.fn>;

  beforeEach(() => {
    vi.useFakeTimers();
    fetchMock = vi.fn();
    vi.stubGlobal('fetch', fetchMock);
  });

  afterEach(() => {
    vi.useRealTimers();
    vi.unstubAllGlobals();
  });

  const run = async (promise: Promise<unknown>) => {
    await vi.advanceTimersByTimeAsync(
      NOTIFICATION_STATUS_POLL_INTERVAL_MS *
        (NOTIFICATION_STATUS_MAX_ATTEMPTS + 1)
    );
    return promise;
  };

  it('returns "sent" once the notification is sent', async () => {
    fetchMock
      .mockResolvedValueOnce(jsonResponse({ status: 'pending' }))
      .mockResolvedValueOnce(jsonResponse({ status: 'sent' }));

    expect(await run(waitForNotificationStatus(5, 11))).toBe('sent');
    expect(fetchMock).toHaveBeenCalledTimes(2);
    expect(fetchMock).toHaveBeenCalledWith(
      '/api/openstad/notification/project/5/notification/11'
    );
  });

  it('returns "failed" once the notification failed', async () => {
    fetchMock.mockResolvedValue(jsonResponse({ status: 'failed' }));

    expect(await run(waitForNotificationStatus(5, 11))).toBe('failed');
    expect(fetchMock).toHaveBeenCalledTimes(1);
  });

  it('returns null when the notification is still pending after the last attempt', async () => {
    fetchMock.mockResolvedValue(jsonResponse({ status: 'pending' }));

    expect(await run(waitForNotificationStatus(5, 11))).toBeNull();
    expect(fetchMock).toHaveBeenCalledTimes(NOTIFICATION_STATUS_MAX_ATTEMPTS);
  });

  it('keeps polling when a request fails', async () => {
    fetchMock
      .mockRejectedValueOnce(new Error('network'))
      .mockResolvedValueOnce(jsonResponse({}, 500))
      .mockResolvedValueOnce(jsonResponse({ status: 'sent' }));

    expect(await run(waitForNotificationStatus(5, 11))).toBe('sent');
    expect(fetchMock).toHaveBeenCalledTimes(3);
  });
});
