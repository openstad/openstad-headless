'use strict';

const {
  getExposedFields,
} = require('@openstad-headless/lib/report-data-scope');
// component-registry is required lazily (it pulls in db.js / Sequelize) so unit
// tests that inject opts.fieldTypes never load the database layer.

// Sequelize type keys we coerce specially. Everything else passes through,
// with any remaining object/array flattened to a JSON string.
const DATE_TYPES = new Set(['DATE', 'DATEONLY']);
const NUMBER_TYPES = new Set(['DECIMAL', 'FLOAT', 'DOUBLE', 'REAL']);
const JSON_TYPES = new Set(['JSON', 'JSONB']);

/**
 * Normalises a row to a plain object. Accepts a Sequelize instance
 * (row.get({plain:true})) or an already-plain object.
 */
function toPlain(row) {
  if (row && typeof row.get === 'function') return row.get({ plain: true });
  return row || {};
}

/**
 * Coerces a single value based on its Sequelize type key.
 *  - DATE/DATEONLY  → full ISO-8601 UTC string (null-safe)
 *  - DECIMAL/FLOAT… → Number (Sequelize returns DECIMAL as string)
 *  - JSON/objects/arrays → JSON string (flat/scalar for Power Query)
 *  - primitives     → as-is
 * null/undefined always → null.
 */
function coerceValue(value, typeKey) {
  if (value === null || value === undefined) return null;

  if (DATE_TYPES.has(typeKey)) {
    const d = value instanceof Date ? value : new Date(value);
    return Number.isNaN(d.getTime()) ? null : d.toISOString();
  }
  if (NUMBER_TYPES.has(typeKey)) {
    const n = Number(value);
    return Number.isNaN(n) ? null : n;
  }
  if (JSON_TYPES.has(typeKey)) {
    return JSON.stringify(value);
  }
  // Any remaining object/array (plain JSON, arrays, geometry, associations).
  if (typeof value === 'object') {
    return JSON.stringify(value);
  }
  return value;
}

/**
 * Serializes a single record for the reporting API.
 *
 * - Column set comes from getExposedFields(componentKey, enabledPersonalFields)
 *   in report-data-scope (single source of truth) — no separate catalog.
 * - Every allowed column is ALWAYS present; missing/undefined → null
 *   (consistent schema for Power BI; also compensates for filterRecord dropping
 *   undefined keys).
 * - Output is flat: a joined `user` object is dropped, since the catalog carries
 *   no user.* fields.
 * - Raw `userId` is never emitted here; the pseudonymous userId is added AFTER
 *   the field-filter by the report-finalize middleware (#438).
 *
 * @param {string} componentKey
 * @param {object} row - Sequelize instance or plain object
 * @param {{componentKey?:string, enabledPersonalFields?:string[]}} scope - req.reportingScope
 * @param {{fieldTypes?:Record<string,string>}} [opts] - inject fieldTypes to avoid db in tests
 * @returns {object}
 */
function serializeRecord(componentKey, row, scope, opts = {}) {
  const plain = toPlain(row);
  const scopeObj = scope || {};
  const enabled = scopeObj.enabledPersonalFields || [];
  const exposed = getExposedFields(componentKey, enabled);
  const fieldTypes =
    opts.fieldTypes ||
    require('./component-registry').getFieldTypes(componentKey);

  const topLevel = exposed.filter((f) => !f.includes('.'));

  const out = {};
  for (const key of topLevel) {
    const raw = plain[key];
    out[key] = coerceValue(
      raw === undefined ? null : raw,
      fieldTypes[key] || 'UNKNOWN'
    );
  }

  return out;
}

module.exports = { serializeRecord, coerceValue, toPlain };
