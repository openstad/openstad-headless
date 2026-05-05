/**
 * Q&A processor service.
 * Extracts questions and answers from widget items + data source (resource or submission).
 * Applies HTML escaping at the source to prevent XSS in email and PDF output.
 */

const { escapeHtml, escapeAttr, stripHtml } = require('./pdf-service');

/**
 * Transform a raw answer value into a safe, display-ready string.
 * Handles: strings, JSON-encoded arrays, object arrays with URLs,
 * plain arrays, and plain objects.
 *
 * All user-submitted values are HTML-escaped at this level so that
 * the returned string is safe to embed in HTML templates.
 */
function transformAnswer(answer, fieldKey, tags) {
  // Handle tag fields like tags[type]
  if (fieldKey.includes('[') && fieldKey.includes(']') && tags) {
    const [mainKey, subKey] = fieldKey.split(/[\[\]]/).filter(Boolean);
    if (mainKey === 'tags') {
      const filtered = tags.filter((tag) => tag.type === subKey);
      return filtered.map((tag) => escapeHtml(tag.name)).join(', ');
    }
  }

  // JSON-encoded array string
  if (
    typeof answer === 'string' &&
    answer.startsWith('[') &&
    answer.endsWith(']')
  ) {
    try {
      const parsed = JSON.parse(answer);
      if (Array.isArray(parsed)) {
        return parsed.length
          ? parsed.map((v) => escapeHtml(String(v))).join(', ')
          : '';
      }
    } catch (e) {
      // If parsing fails, fall through to plain string escaping
    }
  }

  // Array of objects with URL (uploaded images/documents)
  if (Array.isArray(answer)) {
    if (
      answer.every(
        (item) => typeof item === 'object' && item !== null && 'url' in item
      )
    ) {
      return answer
        .map((item, index) => {
          const name =
            item.name ||
            (fieldKey === 'images'
              ? `Afbeelding ${index + 1}`
              : `Document ${index + 1}`);
          return `<a href="${escapeAttr(item.url)}" target="_blank">${escapeHtml(name)}</a>`;
        })
        .join(', ');
    }
    // Plain array
    return answer.map((v) => escapeHtml(String(v))).join(', ');
  }

  // Plain object
  if (typeof answer === 'object' && answer !== null) {
    return Object.entries(answer)
      .map(
        ([key, value]) =>
          `${escapeHtml(String(key))}: ${escapeHtml(String(value))}`
      )
      .join(', ');
  }

  // Plain string (or anything else)
  if (typeof answer === 'string') {
    return escapeHtml(answer);
  }

  return escapeHtml(String(answer || ''));
}

/**
 * Build the MJML HTML table from a questions-and-answers array.
 */
function buildQAHtmlTable(questionsAndAnswers) {
  return `
    <mj-table cellpadding="5" border="1px solid black" width="100%">
      <tbody>
        ${questionsAndAnswers
          .map((qa) => {
            if (qa.section !== undefined) {
              return `
          <tr style="background-color: #f0f0f0;">
            <td style="padding: 10px; font-weight: bold; color: #000; font-size: 13px;font-family: Roboto;">${escapeHtml(qa.section)}</td>
          </tr>`;
            }
            return `
          <tr style="background-color: #f0f0f0;">
            <td style="padding: 10px; font-weight: bold; color: #000; font-size: 13px;font-family: Roboto;">${escapeHtml(qa.question)}</td>
          </tr>
          <tr style="background-color: #ffffff;">
            <td style="padding: 10px; color: #000; font-size: 13px;font-family: Roboto;">
              ${qa.answer}
              <br/>
            </td>
          </tr>`;
          })
          .join('')}
      </tbody>
    </mj-table>
  `;
}

/**
 * Process resource data into questions, answers, and HTML content.
 *
 * @param {object} instance - Notification instance
 * @param {object} db - Sequelize models
 * @returns {{ htmlContent: string, questionsAndAnswers: Array, widgetItems: Array }}
 */
async function processResourceQA(instance, db) {
  const result = { htmlContent: '', questionsAndAnswers: [], widgetItems: [] };

  const resource = await db.Resource.findByPk(instance.data.resourceId, {
    include: [{ model: db.Tag, attributes: ['name', 'type'] }],
  });

  const widget = resource
    ? await db.Widget.findByPk(resource.widgetId)
    : instance.widgetId || null;

  if (!widget || !widget.dataValues.config || !widget.dataValues.config.items) {
    return result;
  }

  const widgetItems = widget.dataValues.config.items;
  result.widgetItems = widgetItems;

  result.questionsAndAnswers = widgetItems.map((item) => {
    if (item.type === 'none') {
      return { section: stripHtml(item.title || '') };
    }

    const question = stripHtml(item.title || item.fieldKey);
    const fieldKey = item.fieldKey;
    const rawAnswer =
      resource[fieldKey] || resource.extraData?.[fieldKey] || '';

    const answer = transformAnswer(rawAnswer, fieldKey, resource.tags);

    return { question, answer };
  });

  result.htmlContent = buildQAHtmlTable(result.questionsAndAnswers);

  return result;
}

/**
 * Process submission data into questions, answers, and HTML content.
 *
 * @param {object} instance - Notification instance
 * @param {object} db - Sequelize models
 * @returns {{ htmlContent: string, questionsAndAnswers: Array }}
 */
async function processSubmissionQA(instance, db) {
  const result = { htmlContent: '', questionsAndAnswers: [] };

  const submission = await db.Submission.findByPk(instance.data.submissionId);

  const widget = instance.data.widgetId
    ? await db.Widget.findByPk(instance.data.widgetId)
    : null;

  if (
    !widget ||
    !widget.dataValues.config ||
    !widget.dataValues.config.items ||
    !submission ||
    !submission.dataValues ||
    !submission.dataValues.submittedData
  ) {
    return result;
  }

  const widgetItems = widget.dataValues.config.items;
  const submittedData = submission.dataValues.submittedData;

  result.questionsAndAnswers = widgetItems.map((item) => {
    if (item.type === 'none') {
      return { section: stripHtml(item.title || '') };
    }

    const question = stripHtml(item.title || item.fieldKey);
    const fieldKey = item.fieldKey;
    const rawAnswer = submittedData[fieldKey] || '';

    const answer = transformAnswer(rawAnswer, fieldKey);

    return { question, answer };
  });

  result.htmlContent = buildQAHtmlTable(result.questionsAndAnswers);

  return result;
}

module.exports = { processResourceQA, processSubmissionQA };
