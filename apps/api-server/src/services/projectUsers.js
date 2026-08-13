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

async function resolveAuthContext(project) {
  try {
    const authConfig = await authSettings.config({
      project,
      useAuth: 'default',
    });
    const adapter = await authSettings.adapter({ authConfig });
    return { authConfig, adapter };
  } catch (err) {
    console.error(
      'Failed to resolve auth server context for new project:',
      err
    );
    return null;
  }
}

async function upsertProjectUser(sourceUser, project, role, authContext) {
  const userData = { ...sourceUser };
  delete userData.id;
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

  if (
    authContext &&
    userData.idpUser &&
    userData.idpUser.identifier &&
    authContext.adapter?.service?.updateUser
  ) {
    try {
      await authContext.adapter.service.updateUser({
        authConfig: authContext.authConfig,
        userData: {
          id: userData.idpUser.identifier,
          role: userData.role,
        },
      });
    } catch (err) {
      console.error(
        'Failed to sync user role to auth server for new project:',
        err
      );
    }
  }
}

async function addAutoAdminUsers(project) {
  const adminProjectId = Number(config.admin?.projectId) || 1;
  if (project.id == adminProjectId) return;

  const flaggedUsers = await db.User.findAll({
    where: {
      projectId: adminProjectId,
      autoAddToNewProjects: true,
      role: { [Sequelize.Op.in]: ['admin', 'editor'] },
    },
    raw: true,
  });

  const eligibleUsers = flaggedUsers.filter(
    (sourceUser) => sourceUser?.idpUser?.identifier
  );
  if (!eligibleUsers.length) return;

  const authContext = await resolveAuthContext(project);

  for (const sourceUser of eligibleUsers) {
    try {
      await upsertProjectUser(sourceUser, project, 'admin', authContext);
    } catch (err) {
      console.error(
        `Failed to auto-add user ${sourceUser.id} as admin to project ${project.id}:`,
        err
      );
    }
  }
}

module.exports = {
  resolveAuthContext,
  upsertProjectUser,
  addAutoAdminUsers,
};
