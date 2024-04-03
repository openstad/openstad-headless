export type Role =
  'superuser' |
  'admin' |
  'editor' |
  'moderator' |
  'member' |
  'anonymous' |
  'all';

type rolesType = {
  [key:string]: Array<Role>;
}

export const roles:rolesType = {
  superuser: ['superuser', 'admin', 'editor', 'moderator', 'member', 'anonymous', 'all'],
  admin: ['admin', 'editor', 'moderator', 'member', 'anonymous', 'all'],
  editor: ['editor', 'moderator', 'member', 'anonymous', 'all'],
  moderator: ['moderator', 'member', 'anonymous', 'all'],
  member: ['member', 'anonymous', 'all'],
  anonymous: ['anonymous', 'all'],
  all: ['all'],   // special
}
