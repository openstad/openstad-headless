// roles definition; should be configurable once that is used in the rest of the applications

let roles = {
  superuser: ['superuser', 'admin', 'editor', 'moderator', 'member', 'anonymous', 'all'],
  admin: ['admin', 'editor', 'moderator', 'member', 'anonymous', 'all'],
  editor: ['editor', 'moderator', 'member', 'anonymous', 'all'],
  moderator: ['moderator', 'member', 'anonymous', 'all'],
  member: ['member', 'anonymous', 'all'],
  anonymous: ['anonymous', 'all'],
  all: ['all'],   // special
  owner: null, // special
}

module.exports = roles;
