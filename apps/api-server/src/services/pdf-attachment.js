/**
 * PDF attachment service.
 * Builds a PDF attachment from Q&A data for resource form submission emails.
 * Handles user details, logo fetching, and PDF generation via pdf-service.
 */

const {
  buildPdfHtml,
  generatePdf,
  fetchImageAsDataUrl,
} = require('./pdf-service');

const PDF_USER_NOTIFICATION_TYPES = [
  'new concept resource - user feedback',
  'new published resource - user feedback',
  'updated resource - user feedback',
];

/**
 * Check whether PDF attachment generation could run for this notification.
 * Only checks env vars and notification type. The project-level toggle
 * (pdfAttachmentEnabled) is checked separately after fetching the project.
 */
function shouldGeneratePdf(notificationType) {
  return (
    !!process.env.PDF_API_ENDPOINT &&
    !!process.env.PDF_API_KEY &&
    PDF_USER_NOTIFICATION_TYPES.includes(notificationType)
  );
}

/**
 * Collect user contact details for the PDF header section.
 */
async function collectUserDetails(userId, db) {
  if (!userId) return [];

  const user = await db.User.findByPk(userId);
  if (!user) return [];

  const details = [];

  const fullName =
    [user.firstname, user.lastname].filter(Boolean).join(' ') || user.name;
  if (fullName)
    details.push({ question: 'Voor- en achternaam', answer: fullName });
  if (user.phoneNumber)
    details.push({ question: 'Telefoonnummer', answer: user.phoneNumber });
  if (user.email) details.push({ question: 'Email', answer: user.email });

  const addressParts = [user.address, user.postcode, user.city]
    .filter(Boolean)
    .join(' ');
  if (addressParts) details.push({ question: 'Adres', answer: addressParts });

  return details;
}

/**
 * Fetch the project logo as a data URL for embedding in the PDF.
 * Tries emailConfig logo first, then the auth server client config.
 */
async function fetchLogoUrl(project) {
  let rawLogoUrl = project?.emailConfig?.styling?.logo || '';

  if (!rawLogoUrl) {
    try {
      const authSettings = require('../util/auth-settings');
      const providers = await authSettings.providers({ project });

      for (const provider of providers) {
        if (provider === 'default') continue;
        const authConfig = await authSettings.config({
          project,
          useAuth: provider,
        });
        const adapter = await authSettings.adapter({ authConfig });
        if (adapter.service.fetchClient && authConfig.clientId) {
          const client = await adapter.service.fetchClient({
            authConfig,
            project,
          });
          if (client?.config?.styling?.logo) {
            rawLogoUrl = client.config.styling.logo;
            break;
          }
        }
      }
    } catch (err) {
      console.error('Failed to fetch auth logo:', err.message);
    }
  }

  if (!rawLogoUrl) return '';

  try {
    return await fetchImageAsDataUrl(rawLogoUrl);
  } catch (err) {
    console.error('Failed to fetch logo for PDF:', err.message);
    return rawLogoUrl;
  }
}

/**
 * Build the list of PDF items (sections + Q&A rows) from widget items and Q&A data.
 */
function buildPdfItems(widgetItems, questionsAndAnswers, userDetails) {
  const pdfItems = [];

  // Add user data section if available
  if (userDetails.length > 0) {
    pdfItems.push({ section: 'Je gegevens' });
    pdfItems.push(...userDetails);
  }

  // Add form data with sections
  widgetItems.forEach((item, index) => {
    if (item.type === 'none') {
      pdfItems.push({ section: item.title || '' });
    } else {
      pdfItems.push(
        questionsAndAnswers[index] || {
          question: item.title || item.fieldKey || '',
          answer: '',
        }
      );
    }
  });

  return pdfItems;
}

/**
 * Build a PDF attachment for a resource form submission notification.
 * Returns the attachment object { filename, content, contentType } or null on failure.
 *
 * Note: The returned buffer is held in memory until the email is sent.
 * The caller should null the reference after sending to allow garbage collection.
 *
 * @param {object} instance - Notification instance
 * @param {Array} questionsAndAnswers - Processed Q&A array from qa-processor
 * @param {Array} widgetItems - Widget config items
 * @param {object} db - Sequelize models
 * @param {object} project - Project with emailConfig scope (pre-fetched by caller)
 * @returns {object|null} Attachment object or null
 */
async function buildPdfAttachment(
  instance,
  questionsAndAnswers,
  widgetItems,
  db,
  project
) {
  if (!questionsAndAnswers.length) return null;

  try {
    const userDetails = await collectUserDetails(instance.data?.userId, db);
    const pdfItems = buildPdfItems(
      widgetItems,
      questionsAndAnswers,
      userDetails
    );

    const logoUrl = await fetchLogoUrl(project);

    const pdfHtml = buildPdfHtml(pdfItems, {
      title:
        project?.emailConfig?.notifications?.pdfTitle || 'Nieuwe inzending',
      description: project?.emailConfig?.notifications?.pdfDescription || '',
      logoUrl,
    });

    const pdfBuffer = await generatePdf(pdfHtml);

    if (pdfBuffer && pdfBuffer.length > 5 * 1024 * 1024) {
      console.warn(
        `[Notification] Large PDF generated: ${(pdfBuffer.length / 1024 / 1024).toFixed(1)}MB`
      );
    }

    return {
      filename: `inzending-${new Date().toISOString().replace(/[:.]/g, '-').slice(0, 19)}.pdf`,
      content: pdfBuffer,
      contentType: 'application/pdf',
    };
  } catch (err) {
    console.error(
      'PDF generation failed, sending email without attachment:',
      err
    );
    return null;
  }
}

module.exports = { buildPdfAttachment, shouldGeneratePdf };
