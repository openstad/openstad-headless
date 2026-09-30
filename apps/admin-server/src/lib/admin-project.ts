/**
 * The image upload route is project scoped (`/project/:id/upload/image`), but the global
 * settings have no project. Uploads from those pages go through the admin project the
 * session authenticates against.
 */
export const ADMIN_PROJECT_ID = '1';
