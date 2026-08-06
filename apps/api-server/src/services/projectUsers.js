/**
 * Project user provisioning.
 *
 * Copies an existing user row onto a (new) project and syncs the role to the
 * auth server, plus the auto-admin feature (#1738): admin-project users with
 * `autoAddToNewProjects` set get admin rights on every newly created or
 * duplicated project.
 */
const Sequelize = require('sequelize');
const config = require('config');
const db = require('../db');
const authSettings = require('../util/auth-settings');

// Clone sourceUser onto project (upsert by idpUser identity) and sync the
// resulting role to the auth server. Pass `role` to override the copied role.
async function upsertProjectUser(sourceUser, project, role) {
  const userData = { ...sourceUser };
  delete userData.id;
  // the flag is a per-row setting on the admin project; never copy it along
  delete userData.autoAddToNewProjects;
  userData.projectId = project.id;
  if (role) userData.role = role;

  const existingProjectUser = await db.User.findOne({
    where: Sequelize.and(
      {
        idpUser: {
          identifier: sourceUser?.idpUser?.identifier,
          provider: sourceUser?.idpUser?.provider,
        },
      },
      { projectId: project.id }
    ),
  });

  if (existingProjectUser) {
    await existingProjectUser.update(userData);
  } else {
    await db.User.create(userData);
  }

  // Sync user role to auth server so user_roles entry is created
  try {
    const authConfig = await authSettings.config({
      project,
      useAuth: 'default',
    });
    const adapter = await authSettings.adapter({ authConfig });
    if (
      userData.idpUser &&
      userData.idpUser.identifier &&
      adapter.service.updateUser
    ) {
      await adapter.service.updateUser({
        authConfig,
        userData: {
          id: userData.idpUser.identifier,
          role: userData.role,
        },
      });
    }
  } catch (err) {
    console.error(
      'Failed to sync user role to auth server for new project:',
      err
    );
  }
}

// Give every flagged admin-project user admin rights on the new project.
// Eligibility (admin or editor on the admin project) is enforced here at
// grant time, not only in the UI.
async function addAutoAdminUsers(project) {
  const adminProjectId = Number(config.admin?.projectId) || 1;
  if (project.id == adminProjectId) return;

  const flaggedUsers = await db.User.findAll({
    where: {
      projectId: adminProjectId,
      autoAddToNewProjects: true,
      role: ['admin', 'editor'],
    },
    raw: true,
  });

  for (const sourceUser of flaggedUsers) {
    if (!sourceUser?.idpUser?.identifier) continue;
    try {
      await upsertProjectUser(sourceUser, project, 'admin');
    } catch (err) {
      console.error(
        `Failed to auto-add user ${sourceUser.id} as admin to project ${project.id}:`,
        err
      );
    }
  }
}

module.exports = {
  upsertProjectUser,
  addAutoAdminUsers,
};
