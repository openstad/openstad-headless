const { processResourceQA } = require('./qa-processor');
const { buildPdfAttachment, shouldGeneratePdf } = require('./pdf-attachment');

/**
 * Send resource submission notifications for admin and/or user audiences,
 * building the PDF attachment once and sharing it between both notifications.
 *
 * @param {object} params
 * @param {number} params.projectId
 * @param {number} params.resourceId
 * @param {number} params.userId
 * @param {{ type: string, emailReceivers?: string[] } | null} params.admin
 * @param {{ type: string } | null} params.user
 * @param {object} params.db - Sequelize models
 */
async function sendResourceSubmissionNotifications({
  projectId,
  resourceId,
  userId,
  admin,
  user,
  db,
}) {
  const project =
    await db.Project.scope('includeEmailConfig').findByPk(projectId);

  const adminPdfEligible = !!(
    admin &&
    project?.emailConfig?.notifications?.pdfAttachmentAdminEnabled &&
    shouldGeneratePdf(admin.type)
  );

  const userPdfEligible = !!(
    user &&
    project?.emailConfig?.notifications?.pdfAttachmentEnabled &&
    shouldGeneratePdf(user.type)
  );

  let sharedPdf = null;

  if (adminPdfEligible || userPdfEligible) {
    try {
      const fakeInstance = { data: { resourceId, userId } };
      const qaResult = await processResourceQA(fakeInstance, db);
      if (qaResult.questionsAndAnswers.length) {
        sharedPdf = await buildPdfAttachment(
          fakeInstance,
          qaResult.questionsAndAnswers,
          qaResult.widgetItems,
          db,
          project
        );
      }
    } catch (err) {
      console.error(
        'Shared PDF build failed, sending notifications without attachment:',
        err
      );
      sharedPdf = null;
    }
  }

  const creates = [];

  if (admin) {
    creates.push(
      db.Notification.create(
        {
          type: admin.type,
          projectId,
          data: {
            userId,
            resourceId,
            ...(admin.emailReceivers
              ? { emailReceivers: admin.emailReceivers }
              : {}),
          },
        },
        { sharedPdfAttachment: adminPdfEligible ? sharedPdf : null }
      )
    );
  }

  if (user) {
    creates.push(
      db.Notification.create(
        {
          type: user.type,
          projectId,
          data: { userId, resourceId },
        },
        { sharedPdfAttachment: userPdfEligible ? sharedPdf : null }
      )
    );
  }

  await Promise.all(creates);

  if (sharedPdf) {
    sharedPdf.content = null;
    sharedPdf = null;
  }
}

module.exports = { sendResourceSubmissionNotifications };
