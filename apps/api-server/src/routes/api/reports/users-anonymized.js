'use strict';

const { Op } = require('sequelize');
const db = require('../../../db');
const {
  parsePageParams,
  buildNextLink,
} = require('../../../lib/reporting/paginate');
const { pseudonymizeUserId } = require('../../../lib/reporting/pseudonymize');

// Real participants only: excludes the system placeholder (id 0) and every role
// that is not a participant. A staff role is often unique in a project, which
// singles that person out via the participantId <-> userId join.
// /reports/users/aggregates still counts all activity, so its participant count
// can exceed this roster's row count.
//
// Deliberately an ALLOWLIST rather than a list of roles to exclude: User.role
// (models/User.js) also permits 'su' and 'superAdmin', and roles.js knows
// 'superuser' and 'owner'. Blocklisting means every role added later leaks into
// the roster until someone remembers to extend the list; allowlisting fails
// closed instead.
const PARTICIPANT_ROLES = ['member'];

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
    participantId: pseudonymizeUserId(row.id, row.projectId),
    role: row.role,
    projectId: row.projectId,
    createdAt: toIsoOrNull(row.createdAt),
    lastLogin: toIsoOrNull(row.lastLogin),
  };
}

/**
 * @openapi
 * /users/anonymized:
 *   get:
 *     summary: List pseudonymized participant rows across every data source
 *     tags: [Reports]
 *     security: [{ bearerAuth: [] }]
 *     parameters:
 *       - $ref: '#/components/parameters/page'
 *       - $ref: '#/components/parameters/pageSize'
 *     responses:
 *       200:
 *         description: A page of pseudonymized participants (participantId, role, projectId, createdAt, lastLogin). No raw user id is ever exposed.
 *         content:
 *           application/json:
 *             schema: { $ref: '#/components/schemas/ReportEnvelope' }
 *       401: { $ref: '#/components/responses/Unauthorized' }
 *       403: { $ref: '#/components/responses/Forbidden' }
 */
// GET /api/project/:projectId/reports/v1/users/anonymized
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
        role: { [Op.in]: PARTICIPANT_ROLES },
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
module.exports.PARTICIPANT_ROLES = PARTICIPANT_ROLES;
