'use strict';

const db = require('../../../db');
const {
  fieldKeyOf,
  CONTROL_FIELD_KEYS,
} = require('../../../lib/reporting/flatten-submission');

// questionType values (packages/enquete/.../items.tsx hasOptions() switch)
// that render as a choice list.
const CHOICE_QUESTION_TYPES = new Set([
  'multiplechoice',
  'multiple',
  'swipe',
  'dilemma',
  'images',
  'matrix',
  'sort',
]);

/**
 * Maps a form item to a Power BI-friendly field type. Best-effort: these
 * widgets have no single canonical "type" column — `questionType` is
 * populated for choice-style questions, `variant` carries a free-form UI
 * label for the rest (e.g. "text input"). Documented mapping (AC #1652):
 *  - choice: questionType is one of the choice-style enum values above, OR
 *    the item defines a non-empty `options` list.
 *  - date / number: questionType or variant mentions 'date' / 'number'.
 *  - text: everything else (the default — free text, textarea, ...).
 * @param {object} item
 * @returns {'text'|'number'|'choice'|'date'}
 */
function inferFieldType(item) {
  const questionType = String(item.questionType || '').toLowerCase();
  const variant = String(item.variant || '').toLowerCase();

  if (
    CHOICE_QUESTION_TYPES.has(questionType) ||
    (Array.isArray(item.options) && item.options.length > 0)
  ) {
    return 'choice';
  }
  if (questionType.includes('date') || variant.includes('date')) {
    return 'date';
  }
  if (questionType.includes('number') || variant.includes('number')) {
    return 'number';
  }
  return 'text';
}

/**
 * @param {import('express').Request} req
 * @returns {string[]}
 */
function getEnabledFormFields(req) {
  const dataScope =
    req.project && req.project.config && req.project.config.dataScope;
  const submissionsScope = dataScope && dataScope.submissions;
  return (submissionsScope && submissionsScope.formFields) || [];
}

/**
 * Maps a widget's form items to the field rows this endpoint exposes,
 * applying the per-field opt-in gate. Pure/DB-free so it can be
 * unit-tested without a real Sequelize connection (mirrors
 * choice-guide-questions.js's buildQuestionRows test seam).
 * @param {any[]} items - widget.config.items
 * @param {string[]} enabledFormFields
 * @returns {Array<{name:string, label:string, type:string}>}
 */
function buildFieldRows(items, enabledFormFields) {
  const enabled = new Set(enabledFormFields || []);
  const seen = new Set();
  const fields = [];
  for (const item of items || []) {
    const key = fieldKeyOf(item);
    if (!key || CONTROL_FIELD_KEYS.has(key) || seen.has(key)) continue;
    seen.add(key);
    if (!enabled.has(key)) continue; // per-field opt-in, mirrors flattenSubmission

    fields.push({
      name: `field_${key}`,
      label: item.title || key,
      type: inferFieldType(item),
    });
  }
  return fields;
}

/**
 * Resolves the field rows for one widget's form. `db` is passed in (rather
 * than read from the module-level `require`) so this can be unit-tested with
 * a stub db, without a real DB connection — mirrors make-report-endpoint.js's
 * resolveCombinedInclude test seam.
 * @param {{db: object, widgetId: string|number, projectId: number, enabledFormFields: string[]}} args
 * @returns {Promise<{notFound: true}|{fields: Array<object>}>}
 */
async function resolveSubmissionFields({
  db,
  widgetId,
  projectId,
  enabledFormFields,
}) {
  const widget = await db.Widget.findOne({
    where: { id: widgetId, projectId },
    attributes: ['id', 'config'],
  });
  if (!widget) return { notFound: true };

  const items =
    widget.config && Array.isArray(widget.config.items)
      ? widget.config.items
      : [];
  return { fields: buildFieldRows(items, enabledFormFields) };
}

// GET /api/project/:projectId/reports/submissions/fields?widgetId=
//
// Metadata endpoint (#440 AC): describes the fields /reports/submissions
// exposes for one form, including type. Treated as SCHEMA (form structure),
// not participant data — it lists field names/labels/types, never answer
// values — so it sets req.reportSchemaResponse to bypass the
// report-field-filter's per-record projection (which would otherwise try to
// project this {name,label,type} shape against the submissions component's
// safeFields and empty it out). It still sits behind require-reporting-token
// and the scope-guard's normal 'submissions' component-enabled check
// (matchComponent resolves the trailing 'submissions' path segment), so a
// project must have submissions reporting enabled to see its form schema.
module.exports = async function submissionsFields(req, res, next) {
  try {
    const widgetId = req.query.widgetId;
    if (!widgetId) {
      return res.status(400).json({
        error: {
          code: 'missing_widget_id',
          message: '?widgetId= is required',
          param: 'widgetId',
        },
      });
    }

    const result = await resolveSubmissionFields({
      db,
      widgetId,
      projectId: req.project.id,
      enabledFormFields: getEnabledFormFields(req),
    });
    if (result.notFound) {
      return res.status(404).json({
        error: {
          code: 'widget_not_found',
          message: 'Widget not found for this project',
        },
      });
    }

    req.reportSchemaResponse = true;
    return res.json(result.fields);
  } catch (err) {
    return next(err);
  }
};
module.exports.inferFieldType = inferFieldType;
module.exports.buildFieldRows = buildFieldRows;
module.exports.resolveSubmissionFields = resolveSubmissionFields;
