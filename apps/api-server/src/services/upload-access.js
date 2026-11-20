// Visitor uploads stay off unless this project actually shows an upload field.
// Submission forms are stored as `enquete` widgets; resource forms as `resourceform`.
const UPLOAD_WIDGET_TYPES = ['enquete', 'resourceform'];

const UPLOAD_FIELD_TYPES = new Set([
  'imageUpload',
  'documentUpload',
  'image-upload',
  'document-upload',
]);

function parseWidgetConfig(config) {
  if (typeof config === 'string') {
    try {
      return JSON.parse(config);
    } catch {
      return null;
    }
  }
  return config && typeof config === 'object' ? config : null;
}

function isUploadField(item) {
  if (!item || typeof item !== 'object') return false;
  return [item.type, item.fieldType, item.questionType].some((value) =>
    UPLOAD_FIELD_TYPES.has(value)
  );
}

// Moderator-only fields are not a visitor upload, so they do not open the
// anonymous endpoint. Nested `items` covers grouped form questions.
function containsVisitorUploadField(item) {
  if (!item || typeof item !== 'object') return false;
  if (isUploadField(item) && item.onlyForModerator !== true) return true;
  return (
    Array.isArray(item.items) && item.items.some(containsVisitorUploadField)
  );
}

function widgetConfigHasUploadField(config) {
  const parsed = parseWidgetConfig(config);
  const items = parsed && Array.isArray(parsed.items) ? parsed.items : [];
  return items.some(containsVisitorUploadField);
}

function projectAllowsAnonymousUpload(widgets) {
  if (!Array.isArray(widgets)) return false;
  return widgets.some((widget) =>
    widgetConfigHasUploadField(widget && widget.config)
  );
}

/**
 * A logged-in user may upload only to their own project. An admin of the
 * admin project (and anyone already promoted to superuser) may upload to any
 * project, matching the rest of the API.
 */
function userCanUploadToProject(user, projectId, adminProjectId) {
  if (!user || user.id == null) return false;
  if (user.role === 'superuser') return true;
  if (
    adminProjectId != null &&
    user.projectId != null &&
    String(user.projectId) === String(adminProjectId) &&
    user.role === 'admin'
  ) {
    return true;
  }
  if (projectId == null || user.projectId == null) return false;
  return String(user.projectId) === String(projectId);
}

module.exports = {
  UPLOAD_WIDGET_TYPES,
  widgetConfigHasUploadField,
  projectAllowsAnonymousUpload,
  userCanUploadToProject,
};
