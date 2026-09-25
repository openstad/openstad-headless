const crypto = require('crypto');

// Builds a Set of ids from a modBreaks array, tolerating a missing/invalid
// array and entries that have no id.
function snapshotModBreakIds(modBreaks) {
  if (!Array.isArray(modBreaks)) return new Set();
  return new Set(
    modBreaks
      .map((modBreak) => modBreak && modBreak.id)
      .filter((id) => id !== undefined && id !== null)
  );
}

// Returns the entries of the saved modBreaks array whose id was not present
// before the save (and that carry a real description). Comparing against the
// SAVED array (not req.body) means an entry can only be "new" once, because
// the model mints a stable uuid for it on first save.
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

// Builds a Map of id -> description from a modBreaks array, tolerating a
// missing/invalid array and entries that have no id.
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

// Returns the entries of the saved modBreaks array that already existed
// before the save (same id) but whose description text changed. An edit to
// an existing modbreak -- e.g. via the admin resource form -- lands here
// rather than in findNewModBreaks.
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

// Resolves who should receive a modbreak notification: only the resource
// owner. Returns an empty array unless the owner has an email address and
// explicit notification consent, and is not the editor who placed the
// modbreak. Still returns an array (0 or 1 entries) so the send loop that
// consumes it stays unchanged.
async function resolveModBreakRecipients({ db, resource, excludeUserId }) {
  const owner = await db.User.findByPk(resource.userId);
  if (!owner || !owner.email || !owner.emailNotificationConsent) return [];
  if (excludeUserId && owner.id === excludeUserId) return [];

  return [{ userId: owner.id, email: owner.email }];
}

// Same unsubscribe-link shape as apps/api-server/src/routes/api/comment.js.
function buildUnsubscribeUrl({ userId, projectId }) {
  if (!userId) return '';
  const hash = crypto.createHash('md5');
  hash.update(`${process.env.USER_ID_SALT}.${userId}.${projectId}`);
  return `${process.env.URL}/api/project/${projectId}/user/unsubscribe/${userId}/${hash.digest('hex')}`;
}

// Builds a public link to the resource from the project's own configured
// URL only. A URL from the request body is never used here, since that
// would let a caller point an official notification email at any address.
function buildResourceRedirectUrl(project) {
  if (!project || !project.url) return '';
  let url = project.url.trim();
  if (!/^https?:\/\//i.test(url)) url = `https://${url}`;
  return url.replace(/\/+$/, '');
}

// Reads the modbreak-notification toggles for a project. Returns the loaded
// project too, so the send step does not have to query it again.
async function readModBreakNotificationSettings(db, projectId) {
  try {
    const project =
      await db.Project.scope('includeEmailConfig').findByPk(projectId);
    const notifyAuthor =
      project?.emailConfig?.notifications?.sendModBreakNotification === true;

    return { notifyAuthor, project };
  } catch (err) {
    console.error(
      `Failed to read sendModBreakNotification for project ${projectId}:`,
      err
    );
    return { notifyAuthor: false, project: null };
  }
}

// Sends the 'new modbreak - user feedback' mail for `resource` (defaults to
// req.results), shared by the resource create (POST) and update (PUT) routes.
// Never throws: a missing resource or a failed lookup is a silent no-op or a
// log line, so a mail problem can never break, hang or crash the request.
// Resolves once the recipients are known; the sends themselves run in the
// background. The returned promise of those sends is exposed for tests only.
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
    const { notifyAuthor, project } = await readModBreakNotificationSettings(
      db,
      projectId
    );

    if (!notifyAuthor) return;

    const redirectUrl = buildResourceRedirectUrl(project);
    const recipients = await resolveModBreakRecipients({
      db,
      resource,
      excludeUserId: req.user?.id,
    });

    // Fire-and-forget: matches the existing non-awaited Notification.create
    // calls in the resource route, so the response is not slowed down by mail
    // sending. Recipients are processed sequentially (not in parallel)
    // because each immediate notification re-queries the resource and widget,
    // and a parallel burst would hammer the database.
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
          // There is no retry for a failed send, so this log is the only
          // trace that this recipient did not get their notification.
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
