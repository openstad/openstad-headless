'use strict';

// User account sub-fields that are ALWAYS removed — can never be opt-in.
const ALWAYS_BLOCKED_USER_KEYS = new Set([
  'email',
  'name',
  'firstname',
  'firstName',
  'lastname',
  'lastName',
  'phoneNumber',
  'address',
  'city',
  'postcode',
]);

// Top-level record fields that are ALWAYS removed regardless of configuration.
// 'ip' is a voter IP address; 'userId' links a row to a person.
const ALWAYS_BLOCKED_TOP_LEVEL = new Set(['ip', 'userId']);

// Free-form JSON blobs that are ALWAYS removed.
// These can contain arbitrary PII typed in by end-users. `result` is the raw
// choiceguide answers blob — never exposed as-is; answers are only available
// opt-in via the flattened `answer_<key>` columns (dataScope.choiceguides.
// answerFields), exactly like submissions' `submittedData`/formFields.
const ALWAYS_BLOCKED_BLOBS = new Set(['submittedData', 'extraData', 'result']);

/**
 * The complete catalog of reportable components.
 *
 * safeFields   — fields that are never PII; exposed without any admin opt-in.
 * personalFields — user-authored text or identifiers that require explicit
 *                  admin opt-in.  Free text (title/summary/description) and
 *                  user.* dot-paths live here. The opt-in itself lives in
 *                  project.config.dataScope — admin-configured, enforced in
 *                  the project PUT route (routes/api/project.js): only an
 *                  admin may change it.
 * pathPattern  — URL path segment used in /stats routing to match this component.
 */
const COMPONENTS = {
  resources: {
    label: 'Plannen',
    pathPattern: '/resource',
    safeFields: [
      'id',
      'projectId',
      'widgetId',
      'createdAt',
      'updatedAt',
      'publishDate',
      'startDate',
      'endDate',
      'status',
      'budget',
      'tags',
      'location',
    ],
    // title/summary/description are free text authored by the submitter.
    personalFields: [
      'title',
      'summary',
      'description',
      'images',
      'user.displayName',
      'user.nickName',
    ],
  },

  votes: {
    label: 'Stemmen',
    pathPattern: '/vote',
    safeFields: [
      'id',
      'projectId',
      'resourceId',
      'createdAt',
      'updatedAt',
      'opinion',
      'checked',
      'confirmed',
    ],
    // ip and userId are always blocked — not listed here.
    personalFields: ['user.displayName', 'user.nickName'],
  },

  comments: {
    label: 'Reacties',
    pathPattern: '/comment',
    safeFields: [
      'id',
      'projectId',
      'resourceId',
      'parentId',
      'createdAt',
      'updatedAt',
      'sentiment',
      'label',
      'status',
      'modBreak',
      'modBreakDatetime',
    ],
    // description is free text authored by the commenter.
    personalFields: ['description', 'user.displayName', 'user.nickName'],
  },

  submissions: {
    label: 'Enquêtes',
    pathPattern: '/submission',
    safeFields: [
      'id',
      'projectId',
      'widgetId',
      'createdAt',
      'updatedAt',
      'status',
      'isSpam',
    ],
    // submittedData is always blocked — arbitrary user JSON, not listed here.
    personalFields: ['user.displayName', 'user.nickName'],
  },

  choiceguides: {
    label: 'Keuzewijzers',
    pathPattern: '/choicesguides',
    safeFields: [
      'id',
      'projectId',
      'widgetId',
      'createdAt',
      'updatedAt',
      'isSpam',
    ],
    // result (the raw answers blob) is always blocked — see
    // ALWAYS_BLOCKED_BLOBS. Answers are only exposed via the flattened
    // answer_<key> columns (dataScope.choiceguides.answerFields opt-in).
    personalFields: ['user.displayName', 'user.nickName'],
  },

  // ADDITIVE (reporting endpoints, issue #1651): the project's own metadata.
  // Safe-only — public project config content, no participant PII. Does NOT
  // loosen any existing PII rule. Project.config (JSON) is intentionally
  // excluded from safeFields.
  projects: {
    label: 'Projecten',
    pathPattern: '/reports/projects',
    safeFields: ['id', 'name', 'title', 'url', 'createdAt', 'updatedAt'],
    personalFields: [],
  },

  // ADDITIVE (reporting endpoints, issue #1653): choice-guide DEFINITION
  // content (the guide itself + its question definitions) — safe-only, same
  // rationale as `projects` above. This is admin-authored form structure, not
  // participant data: no PII, so no personalFields to opt into.
  //
  // Backed by the Widget model (type='choiceguide'), NOT the separate
  // ChoicesGuide/ChoicesGuideQuestion(Group) tables — verified against the
  // live schema while building #441: ChoicesGuideResult has no
  // `choicesGuideId` column (only `widgetId`), those tables are empty in this
  // deployment, have no admin UI, and the one route that queries
  // ChoicesGuideResult by `choicesGuideId` (routes/api/choicesguide.js) would
  // error against a nonexistent column if it were ever hit — i.e. dead code.
  // The live choiceguide widget stores its question definitions in
  // Widget.config.items, exactly like enquete/submissions (#440), and
  // ChoicesGuideResult.widgetId is the only real join key. `widgetId` (on
  // choiceguideguides' own `id` / choiceguidequestions' `widgetId`) therefore
  // takes the place of the plan's assumed `choicesGuideId`.
  choiceguideguides: {
    label: 'Keuzewijzers (definitie)',
    pathPattern: '/reports/choice-guides',
    // Widget has no separate `title` column — `description` is the
    // admin-facing guide name (the existing GET /choicesguide/widgets admin
    // route already treats it as such). Widget.config (introTitle etc.) is a
    // free-form JSON blob, excluded from safeFields like every other
    // component's config/result blob.
    safeFields: ['id', 'projectId', 'description', 'createdAt', 'updatedAt'],
    personalFields: [],
  },
  choiceguidequestions: {
    label: 'Keuzewijzer vragen',
    pathPattern: '/reports/choice-guide-questions',
    safeFields: ['id', 'widgetId', 'fieldKey', 'title', 'type', 'seqnr'],
    personalFields: [],
  },
};

/**
 * Maps a single URL path segment to a component key. Includes singular and
 * plural spellings because the main API and the /stats routes are inconsistent
 * (e.g. main API uses /choicesguide, /stats uses /choicesguides).
 */
const SEGMENT_TO_COMPONENT = {
  resource: 'resources',
  resources: 'resources',
  vote: 'votes',
  votes: 'votes',
  comment: 'comments',
  comments: 'comments',
  submission: 'submissions',
  submissions: 'submissions',
  choicesguide: 'choiceguides',
  choicesguides: 'choiceguides',
  choiceguide: 'choiceguides',
  // ADDITIVE (reporting endpoints). `enquiries` reuses the submissions
  // component (enquete-type submissions). Only the plural `projects` segment is
  // mapped — NOT the singular `project`, which would collide with the
  // ubiquitous /api/project/:id path segment (matchComponent scans from the end,
  // so the trailing `projects`/`enquiries` segment wins).
  enquiries: 'submissions',
  projects: 'projects',
  // ADDITIVE (#441). Hyphenated path segments, matched whole (matchComponent
  // splits on '/', not '-').
  'choice-guides': 'choiceguideguides',
  'choice-guide-questions': 'choiceguidequestions',
  // choice-guide-results reuses the existing `choiceguides` component
  // (ChoicesGuideResult) — same model/safeFields as the legacy
  // /choicesguides `/stats` path, just a new URL segment.
  'choice-guide-results': 'choiceguides',
};

/**
 * Returns the component key for the given URL path, or null.
 *
 * Anchors on whole path segments (not substring) and returns the LAST matching
 * segment, so nested routes attribute correctly:
 *  - /project/1/resource/5/comment  → 'comments' (not 'resources')
 *  - /project/1/resources-evil      → null       (no false-positive substring)
 *  - /project/1/choicesguide        → 'choiceguides' (singular main-API route)
 *
 * @param {string} urlPath
 * @returns {string|null}
 */
function matchComponent(urlPath) {
  const segments = String(urlPath || '')
    .split('/')
    .filter(Boolean);
  for (let i = segments.length - 1; i >= 0; i--) {
    const component = SEGMENT_TO_COMPONENT[segments[i].toLowerCase()];
    if (component) return component;
  }
  return null;
}

/**
 * Returns the list of fields that may be exposed for a component.
 * Always includes safeFields; adds the intersection of the admin's
 * opted-in personalFields with the defined personalFields universe.
 *
 * @param {string} componentKey
 * @param {string[]} enabledPersonalFields - admin-configured opt-in fields
 * @returns {string[]}
 */
function getExposedFields(componentKey, enabledPersonalFields) {
  const def = COMPONENTS[componentKey];
  if (!def) return [];

  const allowedPersonal = new Set(def.personalFields);
  const personalToInclude = (enabledPersonalFields || []).filter((f) =>
    allowedPersonal.has(f)
  );

  return [...def.safeFields, ...personalToInclude];
}

/**
 * Hard-removes always-blocked fields from a single record in-place.
 * Runs as a safety pass regardless of the allowed-fields list.
 */
function stripAlwaysBlocked(record) {
  if (!record || typeof record !== 'object') return record;

  for (const key of ALWAYS_BLOCKED_TOP_LEVEL) {
    delete record[key];
  }
  for (const key of ALWAYS_BLOCKED_BLOBS) {
    delete record[key];
  }
  if (record.user && typeof record.user === 'object') {
    for (const key of ALWAYS_BLOCKED_USER_KEYS) {
      delete record.user[key];
    }
  }

  return record;
}

/**
 * Projects a single record down to only the allowed fields, then strips PII.
 *
 * Top-level keys and user.* dot-paths are handled separately.
 *
 * @param {object} record
 * @param {string[]} allowedFields
 * @returns {object}
 */
function filterRecord(record, allowedFields) {
  if (!record || typeof record !== 'object') return record;

  const topLevelKeys = new Set(allowedFields.filter((f) => !f.includes('.')));

  const allowedUserKeys = new Set(
    allowedFields
      .filter((f) => f.startsWith('user.'))
      .map((f) => f.slice('user.'.length))
  );

  const result = {};

  for (const key of topLevelKeys) {
    if (typeof record[key] !== 'undefined') {
      result[key] = record[key];
    }
  }

  if (
    allowedUserKeys.size > 0 &&
    record.user &&
    typeof record.user === 'object'
  ) {
    result.user = {};
    for (const key of allowedUserKeys) {
      if (typeof record.user[key] !== 'undefined') {
        result.user[key] = record.user[key];
      }
    }
  }

  return stripAlwaysBlocked(result);
}

/**
 * Filters a full API payload: array, paginated wrapper ({ records, metadata }
 * — the shape produced by middleware/pagination.js — or the legacy
 * { data, metadata } shape), or a single record object.
 *
 * Metadata (count, totals) passes through unmodified.
 *
 * @param {any} payload
 * @param {string[]} allowedFields
 * @returns {any}
 */
function filterPayload(payload, allowedFields) {
  if (Array.isArray(payload)) {
    return payload.map((record) => filterRecord(record, allowedFields));
  }

  // Real pagination wrapper from middleware/pagination.js: { metadata, records }.
  if (
    payload &&
    typeof payload === 'object' &&
    Array.isArray(payload.records)
  ) {
    return {
      metadata: payload.metadata,
      records: payload.records.map((record) =>
        filterRecord(record, allowedFields)
      ),
    };
  }

  // Legacy { data, metadata } wrapper.
  if (payload && typeof payload === 'object' && Array.isArray(payload.data)) {
    return {
      metadata: payload.metadata,
      data: payload.data.map((record) => filterRecord(record, allowedFields)),
    };
  }

  if (payload && typeof payload === 'object') {
    return filterRecord(payload, allowedFields);
  }

  return payload;
}

module.exports = {
  COMPONENTS,
  SEGMENT_TO_COMPONENT,
  ALWAYS_BLOCKED_TOP_LEVEL,
  ALWAYS_BLOCKED_USER_KEYS,
  ALWAYS_BLOCKED_BLOBS,
  matchComponent,
  getExposedFields,
  filterRecord,
  filterPayload,
};
