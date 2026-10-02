const crypto = require('crypto');
const { Op } = require('sequelize');

function snapshotModBreakIds(modBreaks) {
  if (!Array.isArray(modBreaks)) return new Set();
  return new Set(
    modBreaks
      .map((modBreak) => modBreak && modBreak.id)
      .filter((id) => id !== undefined && id !== null)
  );
}

function findNewModBreaks(previousIds, savedModBreaks) {
  if (!Array.isArray(savedModBreaks)) return [];
  return savedModBreaks.filter((modBreak) => {
    if (!modBreak || previousIds.has(modBreak.id)) return false;
    return (
      typeof modBreak.description === 'string' &&
      modBreak.description.trim().length > 0
    );
  });
}

function snapshotModBreakDescriptions(modBreaks) {
  const map = new Map();
  if (!Array.isArray(modBreaks)) return map;
  for (const modBreak of modBreaks) {
    if (!modBreak || modBreak.id === undefined || modBreak.id === null)
      continue;
    map.set(modBreak.id, modBreak.description);
  }
  return map;
}

function findChangedModBreaks(previousDescriptions, savedModBreaks) {
  if (!Array.isArray(savedModBreaks)) return [];
  return savedModBreaks.filter((modBreak) => {
    if (!modBreak || !previousDescriptions.has(modBreak.id)) return false;
    if (
      typeof modBreak.description !== 'string' ||
      modBreak.description.trim().length === 0
    ) {
      return false;
    }
    const previousDescription = previousDescriptions.get(modBreak.id);
    return (
      typeof previousDescription !== 'string' ||
      previousDescription.trim() !== modBreak.description.trim()
    );
  });
}

async function resolveModBreakRecipients({
  db,
  resource,
  notifyOwner = true,
  notifyCommenters = false,
  excludeUserId,
}) {
  const candidates = [];

  if (notifyOwner) {
    const owner = await db.User.findByPk(resource.userId);
    if (owner) candidates.push({ user: owner, isResourceOwner: true });
  }

  if (notifyCommenters) {
    const comments = await db.Comment.findAll({
      where: { resourceId: resource.id },
      attributes: ['userId'],
      raw: true,
    });
    const commenterIds = [
      ...new Set(comments.map((comment) => comment.userId).filter(Boolean)),
    ].filter((id) => id !== resource.userId);

    if (commenterIds.length) {
      const commenters = await db.User.findAll({
        where: { id: { [Op.in]: commenterIds } },
        attributes: ['id', 'email', 'emailNotificationConsent'],
      });
      for (const user of commenters) {
        candidates.push({ user, isResourceOwner: false });
      }
    }
  }

  const seenEmails = new Set();
  const recipients = [];
  for (const { user, isResourceOwner } of candidates) {
    if (!user || !user.email || !user.emailNotificationConsent) continue;
    if (excludeUserId && user.id === excludeUserId) continue;

    const normalizedEmail = user.email.trim().toLowerCase();
    if (seenEmails.has(normalizedEmail)) continue;
    seenEmails.add(normalizedEmail);

    recipients.push({ userId: user.id, email: user.email, isResourceOwner });
  }

  return recipients;
}

function buildUnsubscribeUrl({ userId, projectId }) {
  if (!userId) return '';
  const hash = crypto.createHash('md5');
  hash.update(`${process.env.USER_ID_SALT}.${userId}.${projectId}`);
  return `${process.env.URL}/api/project/${projectId}/user/unsubscribe/${userId}/${hash.digest('hex')}`;
}

function buildResourceRedirectUrl(project) {
  if (!project || !project.url) return '';
  let url = project.url.trim();
  if (!/^https?:\/\//i.test(url)) url = `https://${url}`;
  return url.replace(/\/+$/, '');
}

async function readModBreakNotificationSettings(db, projectId) {
  try {
    const project =
      await db.Project.scope('includeEmailConfig').findByPk(projectId);
    const notifications = project?.emailConfig?.notifications;
    const notifyAuthor = notifications?.sendModBreakNotification === true;
    const notifyCommenters =
      notifications?.sendModBreakNotificationToCommenters === true;

    return { notifyAuthor, notifyCommenters, project };
  } catch (err) {
    console.error(
      `Failed to read sendModBreakNotification for project ${projectId}:`,
      err
    );
    return { notifyAuthor: false, notifyCommenters: false, project: null };
  }
}

async function sendModBreakNotifications({
  db,
  req,
  resource = req.results,
  newModBreaks,
  changedModBreaks,
}) {
  if (!resource) return;
  if (!newModBreaks.length && !changedModBreaks.length) return;

  try {
    const projectId = req.project?.id || Number(req.params?.projectId);
    const { notifyAuthor, notifyCommenters, project } =
      await readModBreakNotificationSettings(db, projectId);

    if (!notifyAuthor && !notifyCommenters) return;

    const redirectUrl = buildResourceRedirectUrl(project);
    const recipients = await resolveModBreakRecipients({
      db,
      resource,
      notifyOwner: notifyAuthor,
      notifyCommenters,
      excludeUserId: req.user?.id,
    });

    const sending = (async () => {
      console.log(
        `Sending modbreak notification for resource ${resource.id} to ${recipients.length} recipient(s)`
      );
      for (const recipient of recipients) {
        try {
          await db.Notification.create({
            type: 'new modbreak - user feedback',
            projectId,
            to: recipient.email,
            data: {
              userId: recipient.userId,
              resourceId: resource.id,
              isResourceOwner: recipient.isResourceOwner,
              newModBreaks,
              changedModBreaks,
              redirectUrl,
              unsubscribeUrl: buildUnsubscribeUrl({
                userId: recipient.userId,
                projectId,
              }),
            },
          });
        } catch (err) {
          console.error(
            `Failed to send modbreak notification for resource ${resource.id} to ${recipient.email}:`,
            err
          );
        }
      }
    })();

    return { sending };
  } catch (err) {
    console.error(
      `Failed to prepare modbreak notification for resource ${resource.id}:`,
      err
    );
  }
}

module.exports = {
  snapshotModBreakIds,
  snapshotModBreakDescriptions,
  findNewModBreaks,
  findChangedModBreaks,
  resolveModBreakRecipients,
  buildUnsubscribeUrl,
  buildResourceRedirectUrl,
  readModBreakNotificationSettings,
  sendModBreakNotifications,
};
