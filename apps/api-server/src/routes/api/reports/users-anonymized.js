'use strict';

const { Op } = require('sequelize');
const db = require('../../../db');
const {
  parsePageParams,
  buildNextLink,
} = require('../../../lib/reporting/paginate');
const { pseudonymizeUserId } = require('../../../lib/reporting/pseudonymize');

// Real deelnemers only: excludes the system/anonymous placeholder (id 0) and
// the anonymous/unknown roles (#442 AC: no PII by default, only participants).
const EXCLUDED_ROLES = ['anonymous', 'unknown'];

function toIsoOrNull(value) {
  if (!value) return null;
  const d = value instanceof Date ? value : new Date(value);
  return Number.isNaN(d.getTime()) ? null : d.toISOString();
}

/**
 * Maps a plain User row (id, role, projectId, createdAt, lastLogin) to the
 * flat, pseudonymized participant row this endpoint exposes. Pure/DB-free so
 * it can be unit-tested without a real Sequelize connection (mirrors
 * choice-guide-questions.js's buildQuestionRows test seam).
 * @param {{id:number, role:string, projectId:number, createdAt:*, lastLogin:*}} row
 * @returns {{participantId:string|null, role:string, projectId:number, createdAt:string|null, lastLogin:string|null}}
 */
function toParticipantRow(row) {
  return {
    participantId: pseudonymizeUserId(row.id),
    role: row.role,
    projectId: row.projectId,
    createdAt: toIsoOrNull(row.createdAt),
    lastLogin: toIsoOrNull(row.lastLogin),
  };
}

// GET /api/project/:projectId/reports/users/anonymized
//
// Pseudonymized participant rows — NOT a normal report-data-scope component
// (see api-token-scope-guard.js ALLOWED_NON_COMPONENT_SEGMENTS): there is no
// safe/opt-in field catalog here, the field list is fixed and hand-built
// directly in this route (never via a User-model serializer) specifically to
// avoid any risk of a PII field leaking through. Never expose the raw user
// id — only the HMAC pseudonym (#437's pseudonymizeUserId, shared with
// #440/#441 so it's the same join key across every reporting endpoint).
//
// Because this is a non-component path, report-field-filter runs it through
// the aggregate/shape screen (componentKey === null) rather than a
// safeFields projection — every row MUST be a flat object of primitives
// only (no nested objects) to pass that check.
async function usersAnonymized(req, res, next) {
  try {
    const { page, pageSize, offset, fetchLimit } = parsePageParams(req);

    const rows = await db.User.findAll({
      where: {
        projectId: req.project.id,
        id: { [Op.ne]: 0 },
        role: { [Op.notIn]: EXCLUDED_ROLES },
      },
      attributes: ['id', 'role', 'projectId', 'createdAt', 'lastLogin'],
      order: [['id', 'ASC']],
      offset,
      limit: fetchLimit,
    });

    const hasNext = rows.length > pageSize;
    const pageRows = hasNext ? rows.slice(0, pageSize) : rows;

    const data = pageRows.map(toParticipantRow);
    const nextLink = hasNext ? buildNextLink(req, page + 1) : null;
    return res.json({ data, nextLink });
  } catch (err) {
    return next(err);
  }
}

module.exports = usersAnonymized;
module.exports.toParticipantRow = toParticipantRow;
module.exports.toIsoOrNull = toIsoOrNull;
