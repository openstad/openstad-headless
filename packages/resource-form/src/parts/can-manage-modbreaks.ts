import hasRole from '../../../lib/has-role';

export function canManageModBreaks(
  currentUser: any,
  canEdit: unknown,
  existingResourceId: unknown
): boolean {
  return (
    !!hasRole(currentUser, ['editor', 'moderator']) &&
    !!canEdit &&
    !!existingResourceId
  );
}

export function isRestrictedToModBreaks(
  currentUser: any,
  resourceOwnerId: unknown
): boolean {
  const isModeratorOnly =
    !hasRole(currentUser, 'editor') && !!hasRole(currentUser, 'moderator');
  if (!isModeratorOnly) return false;

  const isOwner = !!resourceOwnerId && currentUser?.id == resourceOwnerId;
  return !isOwner;
}
