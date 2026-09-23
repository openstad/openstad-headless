import hasRole from '../../../lib/has-role';

// modBreaks requires 'editor' or 'moderator' (matches the api-server guard in
// routes/api/resource.js), and only makes sense on an existing resource.
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

// A moderator (below editor) editing someone else's resource sees only the
// modbreak field; on their own resource they edit as the owner. Mirrors
// restrict-moderator-only-body.js in the api-server.
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
