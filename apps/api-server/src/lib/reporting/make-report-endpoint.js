'use strict';

const db = require('../../db');
const { parsePageParams, paginateReporting } = require('./paginate');
const { serializeRecord } = require('./serialize');
const { buildReportingWhere, respondFilterError } = require('./filters');
const { getModel } = require('./component-registry');

/**
 * Resolves the abstract project-scope descriptor from buildReportingWhere
 * (e.g. `[{ viaModel: 'Resource', where }]` for votes/comments, which have no
 * direct projectId column) into real Sequelize include objects, merged with
 * any component-specific include (e.g. enquiries' Widget.type='enquete' join).
 *
 * `db` is passed in (rather than read from the module-level `require`) so
 * this can be unit-tested with a stub db, without a real DB connection.
 *
 * `.unscoped()` is used on the joined model: Resource has a `defaultScope`
 * that auto-injects a nested Status (`as: 'statuses'`) association on every
 * query, including when Resource is pulled in as an include from another
 * model. Combined with this include's `attributes: []` (we only need it as a
 * project-scope filter, not for its data), that extra nested include breaks
 * Sequelize's row-grouping once there is more than zero matching rows
 * (`Cannot read properties of undefined (reading 'statuses')` in
 * `_groupJoinData`). `.unscoped()` keeps the join purely a project-scope
 * filter, with no side-effect default includes.
 *
 * @param {Array<{viaModel:string, where:object}>|undefined} scopeInclude
 * @param {any[]|undefined} callerInclude
 * @param {Record<string, any>} db
 * @returns {any[]}
 */
function resolveCombinedInclude(scopeInclude, callerInclude, db) {
  const resolvedScopeInclude = (scopeInclude || []).map((entry) => {
    const Model = db[entry.viaModel];
    const unscopedModel =
      typeof Model.unscoped === 'function' ? Model.unscoped() : Model;
    return {
      model: unscopedModel,
      attributes: [],
      required: true,
      where: entry.where,
    };
  });
  return [...resolvedScopeInclude, ...(callerInclude || [])];
}

/**
 * Builds an Express handler for a simple reporting endpoint. DRYs the shared
 * pipeline used by /reports/{resources,votes,comments,enquiries,projects}:
 *
 *   parsePageParams (#438) → buildReportingWhere (#443, 400 on bad filter)
 *   → Model.findAll({ where, order:[['id','ASC']], offset, limit: fetchLimit, include })
 *   → paginateReporting (#438, serialize #437) → res.json({data,nextLink})
 *
 * report-field-filter (#313) then strips, and report-finalize (#438) restores
 * the envelope + pseudonymous userId + extra columns.
 *
 * @param {{
 *   componentKey: string,
 *   model?: string,                 // Sequelize model name; defaults to registry
 *   include?: any[],                // Sequelize include (e.g. enquete Widget join)
 *   baseWhere?: (req)=>object,      // extra where constraints
 *   includeUserId?: boolean,        // false for projects (no userId)
 *   extraColumns?: (plainRow)=>object, // e.g. votes voteId
 * }} cfg
 * @returns {import('express').RequestHandler}
 */
function makeReportEndpoint({
  componentKey,
  model,
  include,
  baseWhere,
  includeUserId = true,
  extraColumns,
}) {
  return async function reportEndpoint(req, res, next) {
    try {
      const { page, pageSize, offset, fetchLimit } = parsePageParams(req);

      let where, scopeInclude;
      try {
        const built = buildReportingWhere(req, componentKey);
        const extra =
          typeof baseWhere === 'function' ? baseWhere(req) : baseWhere || {};
        where = { ...built.where, ...extra };
        scopeInclude = built.include;
      } catch (err) {
        return respondFilterError(res, err);
      }

      const Model = model ? db[model] : getModel(componentKey);
      if (!Model) {
        throw new Error(
          `Reporting model not found for component '${componentKey}'`
        );
      }

      const combinedInclude = resolveCombinedInclude(scopeInclude, include, db);

      const rows = await Model.findAll({
        where,
        order: [['id', 'ASC']],
        offset,
        limit: fetchLimit,
        ...(combinedInclude.length
          ? { include: combinedInclude, subQuery: false }
          : {}),
      });

      const { data, nextLink } = paginateReporting({
        req,
        componentKey,
        rows,
        page,
        pageSize,
        serialize: serializeRecord,
        includeUserId,
        extraColumns,
      });

      return res.json({ data, nextLink });
    } catch (err) {
      return next(err);
    }
  };
}

module.exports = { makeReportEndpoint, resolveCombinedInclude };
