import { validateProjectNumber } from '@/lib/validateProjectNumber';

/**
 * Which set of notification templates a form works on: the ones of a single project, or
 * the global ones on the general settings page. Passed as a prop rather than held in a
 * context, because NotificationForm is also rendered on its own (settings/users.tsx) and
 * a missing provider there would be a silent bug.
 */
export type NotificationScope =
  | { kind: 'project'; projectId: string }
  | { kind: 'global' };

export const GLOBAL_NOTIFICATION_SCOPE: NotificationScope = { kind: 'global' };

export function projectNotificationScope(
  projectId?: string | number
): NotificationScope {
  return { kind: 'project', projectId: String(projectId ?? '') };
}

/**
 * Accepts the scope object or the bare project id the hooks took before, so existing call
 * sites keep working unchanged.
 */
export function toNotificationScope(
  scopeOrProjectId?: NotificationScope | string | number
): NotificationScope {
  if (
    scopeOrProjectId &&
    typeof scopeOrProjectId === 'object' &&
    'kind' in scopeOrProjectId
  ) {
    return scopeOrProjectId;
  }
  return projectNotificationScope(scopeOrProjectId as string | undefined);
}

export function isGlobalScope(scope: NotificationScope): boolean {
  return scope.kind === 'global';
}

/**
 * The template collection this scope reads and writes. Returns null for a project scope
 * without a usable id, which is how the hooks tell SWR not to fetch yet.
 */
export function notificationTemplateBaseUrl(
  scope: NotificationScope
): string | null {
  if (scope.kind === 'global') {
    return '/api/openstad/notification/global/template';
  }
  const projectNumber = validateProjectNumber(scope.projectId);
  return projectNumber
    ? `/api/openstad/notification/project/${projectNumber}/template`
    : null;
}

/**
 * Read-only view of the global templates from inside a project, used to show and restore
 * what the project inherits. Null in global scope: there it is the base url itself.
 */
export function inheritedGlobalTemplatesUrl(
  scope: NotificationScope
): string | null {
  if (scope.kind === 'global') return null;
  const projectNumber = validateProjectNumber(scope.projectId);
  return projectNumber
    ? `/api/openstad/notification/project/${projectNumber}/global-template`
    : null;
}
