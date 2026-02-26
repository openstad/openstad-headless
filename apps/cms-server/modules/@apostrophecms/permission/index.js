/**
 *
 * Checks if the user has permission to perform a specific action on a document or type.
 * The can function is copied from the original ApostropheCMS codebase.
 * The action was sometimes passed as 'undefined', which caused an error.
 * Therefore, the code has been copied and adjusted to address this issue.
 *
 */

const ranks = {
  guest: 0,
  contributor: 1,
  editor: 2,
  admin: 3,
};

module.exports = {
  methods(self) {
    return {
      can(req, action, docOrType, mode) {
        mode = mode || req.mode;
        const role = req.user && req.user.role;

        if (role === 'admin') {
          return true;
        }

        const type = docOrType && (docOrType.type || docOrType);
        const doc = docOrType && docOrType._id ? docOrType : null;
        const manager = type && self.apos.doc.getManager(type);
        if (type && !manager) {
          self.apos.util.warn(
            'A permission.can() call was made with a type that has no manager:',
            type
          );
          return false;
        }

        if (action === 'view') {
          return canView();
        }

        if (action === 'view-draft') {
          // Checked at the middleware level to determine if req.mode should
          // be allowed to be set to draft at all
          return role === 'contributor' || role === 'editor';
        }

        if (['edit', 'create'].includes(action)) {
          return canEdit();
        }

        if (action === 'publish') {
          return canPublish();
        }

        if (action === 'upload-attachment') {
          return role === 'contributor' || role === 'editor';
        }

        if (action === 'delete') {
          return canDelete();
        }

        if (action !== undefined) {
          throw self.apos.error('invalid', 'That action is not implemented');
        }

        function checkRoleConfig(permRole) {
          return (
            manager &&
            manager.options[permRole] &&
            ranks[role] < ranks[manager.options[permRole]]
          );
        }

        function canView() {
          if (checkRoleConfig('viewRole')) {
            return false;
          }
          if (
            typeof docOrType === 'object' &&
            docOrType.visibility !== 'public'
          ) {
            return (
              role === 'guest' || role === 'contributor' || role === 'editor'
            );
          }
          return true;
        }

        function canEdit() {
          if (checkRoleConfig('editRole')) {
            return false;
          }
          if (mode === 'draft') {
            return role === 'contributor' || role === 'editor';
          }
          return role === 'editor';
        }

        function canPublish() {
          if (checkRoleConfig('publishRole')) {
            return false;
          }
          return role === 'editor';
        }

        function canDelete() {
          if (doc && (!doc.lastPublishedAt || doc.aposMode === 'draft')) {
            return self.can(req, 'edit', doc, mode);
          }

          return self.can(req, 'publish', docOrType, mode);
        }
      },
    };
  },
};
