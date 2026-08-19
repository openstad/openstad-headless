'use strict';

/**
 * Maps a reporting component key (from report-data-scope COMPONENTS) to its
 * Sequelize model name. Kept in sync with packages/lib/report-data-scope.js.
 *
 * `enquiries` is NOT listed here: it reuses the `submissions` component/model
 * with a Widget.type='enquete' filter (see routes/api/reports/enquiries.js).
 */
const COMPONENT_MODEL = {
  resources: 'Resource',
  votes: 'Vote',
  comments: 'Comment',
  submissions: 'Submission',
  choiceguides: 'ChoicesGuideResult',
  projects: 'Project',
  // ADDITIVE (#441): choice-guide definition content is backed by Widget
  // (type='choiceguide'), not the unused ChoicesGuide model — see the
  // report-data-scope.js comment on choiceguideguides for why.
  choiceguideguides: 'Widget',
};

/**
 * Describes how each reporting component is scoped to a single project.
 * Most models have a direct `projectId` column ('column'). Vote and Comment
 * do NOT — they only reach their project via their `resource` association
 * (resourceId -> resources.projectId), so they use 'viaResource' instead.
 * `projects` scopes by its own `id`, not a foreign key.
 *
 * This is the single source of truth for project-scoping strategy, so
 * buildReportingWhere (filters.js) never has to assume every component has a
 * `projectId` column — add new components here, not as per-endpoint hacks.
 */
const PROJECT_SCOPE = {
  resources: { type: 'column', column: 'projectId' },
  votes: { type: 'viaResource' },
  comments: { type: 'viaResource' },
  submissions: { type: 'column', column: 'projectId' },
  choiceguides: { type: 'column', column: 'projectId' },
  projects: { type: 'column', column: 'id' },
  choiceguideguides: { type: 'column', column: 'projectId' },
};

/**
 * @param {string} componentKey
 * @returns {{type:'column',column:string}|{type:'viaResource'}}
 */
function getProjectScope(componentKey) {
  const scope = PROJECT_SCOPE[componentKey];
  if (!scope) {
    throw new Error(`Unknown reporting component: ${componentKey}`);
  }
  return scope;
}

const _typeCache = new Map();

/**
 * Returns the Sequelize model for a component key.
 * db is required lazily here (not at module top) so importing this module for
 * its pure lookups (e.g. getProjectScope) never loads the database layer —
 * unit tests rely on this to test buildReportingWhere without a DB.
 * @param {string} componentKey
 */
function getModel(componentKey) {
  const db = require('../../db');
  const name = COMPONENT_MODEL[componentKey];
  if (!name) {
    throw new Error(`Unknown reporting component: ${componentKey}`);
  }
  const model = db[name];
  if (!model) {
    throw new Error(
      `Sequelize model '${name}' not found for reporting component '${componentKey}'`
    );
  }
  return model;
}

/**
 * Returns a map { fieldName: TYPE_KEY } for a component's model attributes,
 * derived via Sequelize introspection (getAttributes() in Sequelize 6, falling
 * back to rawAttributes). TYPE_KEY is e.g. 'DATE', 'DATEONLY', 'DECIMAL',
 * 'JSON', 'INTEGER', 'STRING', 'VIRTUAL'.
 *
 * This drives per-component value coercion in serialize.js (dates→ISO,
 * DECIMAL→Number, JSON→string) WITHOUT hardcoding field lists.
 *
 * @param {string} componentKey
 * @returns {Record<string,string>}
 */
function getFieldTypes(componentKey) {
  if (_typeCache.has(componentKey)) return _typeCache.get(componentKey);

  const model = getModel(componentKey);
  const attrs =
    typeof model.getAttributes === 'function'
      ? model.getAttributes()
      : model.rawAttributes;

  const out = {};
  for (const [name, def] of Object.entries(attrs || {})) {
    const t = def && def.type;
    out[name] =
      (t && (t.key || (t.constructor && t.constructor.key))) || 'UNKNOWN';
  }

  _typeCache.set(componentKey, out);
  return out;
}

/**
 * Returns the allowed values for a component's field, if that field is a
 * Sequelize ENUM — e.g. Submission.status is ENUM('approved','pending',
 * 'unapproved'). Returns null when the field isn't an ENUM (free-text status,
 * or a per-project/dynamic status set that can't be validated against a
 * static list here — e.g. resources' statuses live in a separate per-project
 * Status association, not a column, so they never reach this function).
 *
 * This is the "real status set of the component" referred to by
 * filters.js's status validation — deriving it from the model instead of a
 * hardcoded enum keeps it correct if a model's status values ever change.
 *
 * @param {string} componentKey
 * @param {string} fieldName
 * @returns {string[]|null}
 */
function getFieldEnumValues(componentKey, fieldName) {
  const model = getModel(componentKey);
  const attrs =
    typeof model.getAttributes === 'function'
      ? model.getAttributes()
      : model.rawAttributes;
  const def = attrs && attrs[fieldName];
  const type = def && def.type;
  return type && Array.isArray(type.values) ? type.values : null;
}

module.exports = {
  COMPONENT_MODEL,
  getModel,
  getFieldTypes,
  getFieldEnumValues,
  getProjectScope,
  // test seam
  _resetCache: () => _typeCache.clear(),
};
