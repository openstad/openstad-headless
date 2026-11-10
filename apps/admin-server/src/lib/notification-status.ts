export const NOTIFICATION_STATUS_POLL_INTERVAL_MS = 1000;
export const NOTIFICATION_STATUS_MAX_ATTEMPTS = 10;

export type FinalNotificationStatus = 'sent' | 'failed';

const wait = (ms: number) => new Promise((resolve) => setTimeout(resolve, ms));

async function fetchNotificationStatus(
  projectNumber: number,
  notificationId: number
): Promise<string | null> {
  try {
    const response = await fetch(
      `/api/openstad/notification/project/${projectNumber}/notification/${notificationId}`
    );
    if (!response.ok) return null;
    const notification = await response.json();
    return typeof notification?.status === 'string'
      ? notification.status
      : null;
  } catch {
    return null;
  }
}

export async function waitForNotificationStatus(
  projectNumber: number,
  notificationId: number
): Promise<FinalNotificationStatus | null> {
  for (let attempt = 0; attempt < NOTIFICATION_STATUS_MAX_ATTEMPTS; attempt++) {
    await wait(NOTIFICATION_STATUS_POLL_INTERVAL_MS);
    const status = await fetchNotificationStatus(projectNumber, notificationId);
    if (status === 'sent' || status === 'failed') return status;
  }
  return null;
}
