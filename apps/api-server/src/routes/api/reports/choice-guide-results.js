'use strict';

const db = require('../../../db');
const {
  makeReportEndpoint,
} = require('../../../lib/reporting/make-report-endpoint');
const {
  flattenSubmission,
  fieldKeyOf,
} = require('../../../lib/reporting/flatten-submission');
const { parseWidgetId } = require('../../../lib/reporting/parse-widget-id');

/**
 * The opted-in answer keys for this project — project-wide per key, see the
 * SCOPE note in models/lib/project-config.js.
 *
 * @param {import('express').Request} req
 * @returns {string[]}
 */
function getEnabledAnswerFields(req) {
  const dataScope =
    req.project && req.project.config && req.project.config.dataScope;
  const choiceguidesScope = dataScope && dataScope.choiceguides;
  return (choiceguidesScope && choiceguidesScope.answerFields) || [];
}

/**
 * @param {object} plainRow - a plain ChoicesGuideResult row with the `widget` include
 * @returns {Array<object>}
 */
function widgetItemsOf(plainRow) {
  const items =
    plainRow && plainRow.widget && plainRow.widget.config
      ? plainRow.widget.config.items
      : undefined;
  return Array.isArray(items) ? items : [];
}

/**
 * The de-duplicated question items across every row on the page, in first-seen
 * order — the "guide definition" the whole page is flattened against.
 *
 * @param {Array<object>} plainRows
 * @returns {Array<object>}
 */
function unionQuestionItems(plainRows) {
  const unionItems = [];
  const seenKeys = new Set();
  for (const row of plainRows) {
    for (const item of widgetItemsOf(row)) {
      const key = fieldKeyOf(item);
      if (key && !seenKeys.has(key)) {
        seenKeys.add(key);
        unionItems.push(item);
      }
    }
  }
  return unionItems;
}

/**
 * Page-wide values every row's extraColumns needs, computed ONCE per request.
 *
 * extraColumns is invoked per row (paginate.js), so deriving the union inside it
 * would re-scan the whole page for every row. Safe to memoise on req:
 * paginateReporting has a single call site (make-report-endpoint.js) and builds
 * allPlainRows once per handler run.
 *
 * @param {import('express').Request} req
 * @param {Array<object>} allPlainRows
 * @returns {{unionItems: Array<object>, enabledAnswerFields: string[]}}
 */
function pageContext(req, allPlainRows) {
  if (!req._reportChoiceGuideResultsPageContext) {
    req._reportChoiceGuideResultsPageContext = {
      unionItems: unionQuestionItems(allPlainRows),
      enabledAnswerFields: getEnabledAnswerFields(req),
    };
  }
  return req._reportChoiceGuideResultsPageContext;
}

// Throwing a ReportingFilterError here is turned into the standard 400 body by
// make-report-endpoint's respondFilterError.
const baseWhere = (req) => {
  const widgetId = parseWidgetId(req.query.widgetId);
  return widgetId !== undefined ? { widgetId } : {};
};

const extraColumns = (row, req, allRows) => {
  // Only the page-wide context is memoised. A caller that passes no allRows
  // gets this row's own items, uncached — caching a single-row union would hand
  // it to every later row too and silently drop their answer_<key> columns.
  const { unionItems, enabledAnswerFields } = allRows
    ? pageContext(req, allRows)
    : {
        unionItems: unionQuestionItems([row]),
        enabledAnswerFields: getEnabledAnswerFields(req),
      };
  return flattenSubmission(
    row.result,
    unionItems,
    enabledAnswerFields,
    'answer_'
  );
};

// GET /api/project/:projectId/reports/choice-guide-results
//
// Reuses the existing `choiceguides` component (ChoicesGuideResult) — same
// safeFields (id, projectId, widgetId, createdAt, updatedAt, isSpam) as the
// legacy /stats /choicesguides path. `widgetId` is the join key back to
// /reports/choice-guides and /reports/choice-guide-questions — there is no
// real `choicesGuideId` in this schema (verified: ChoicesGuideResult has no
// such column; see report-data-scope.js's `choiceguideguides` comment), so
// it is NOT fabricated here.
//
// `result` (the answers blob) is flattened into answer_<fieldKey> columns
// exactly like #440's submissions: reuses flattenSubmission with the
// `answer_` prefix, gated by the separate dataScope.choiceguides.answerFields
// per-field opt-in, injected AFTER the field filter via extraColumns +
// report-finalize.
module.exports = makeReportEndpoint({
  componentKey: 'choiceguides',
  model: 'ChoicesGuideResult',
  // Scoped to type='choiceguide' and required, mirroring enquiries.js: without
  // it a result row could join a widget of another type (the project also has a
  // 'choiceguideResults' widget) and contribute ITS items to the question union,
  // emitting answer_<key> columns that belong to a different widget.
  //
  // required:true (an INNER JOIN) cannot lose a legitimate row here: the
  // choices_guide_results.widgetId foreign key is ON DELETE NO ACTION, so MySQL
  // refuses to delete a widget that still has results — a result without a
  // widget cannot exist, and the model's `defaultValue: 0` can never be
  // persisted either.
  include: [
    {
      model: db.Widget,
      attributes: ['id', 'type', 'config'],
      where: { type: 'choiceguide' },
      required: true,
    },
  ],
  baseWhere,
  extraColumns,
});

// Test seams — the endpoint itself needs a DB, these are pure.
module.exports.baseWhere = baseWhere;
module.exports.extraColumns = extraColumns;
module.exports.unionQuestionItems = unionQuestionItems;
