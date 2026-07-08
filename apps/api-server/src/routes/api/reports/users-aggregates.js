'use strict';

const { sequelize } = require('../../../db');

// Per-source distinct-participant queries (userId != 0, soft-deleted rows
// excluded). votes/comments have no direct projectId column (like
// component-registry's 'viaResource' components) so they join resources;
// submissions/choices_guide_results scope directly. Mirrors the raw-SQL
// COUNT(DISTINCT) pattern already used by routes/stats/vote.js.
const BY_TYPE_QUERIES = {
  votes: `SELECT COUNT(DISTINCT v.userId) AS counted FROM votes v
    LEFT JOIN resources r ON v.resourceId = r.id
    WHERE r.projectId = ? AND v.deletedAt IS NULL AND r.deletedAt IS NULL AND v.userId != 0`,
  comments: `SELECT COUNT(DISTINCT c.userId) AS counted FROM comments c
    LEFT JOIN resources r ON c.resourceId = r.id
    WHERE r.projectId = ? AND c.deletedAt IS NULL AND r.deletedAt IS NULL AND c.userId != 0`,
  submissions: `SELECT COUNT(DISTINCT userId) AS counted FROM submissions
    WHERE projectId = ? AND deletedAt IS NULL AND userId IS NOT NULL AND userId != 0`,
  choiceGuides: `SELECT COUNT(DISTINCT userId) AS counted FROM choices_guide_results
    WHERE projectId = ? AND deletedAt IS NULL AND userId IS NOT NULL AND userId != 0`,
};

// The overall uniqueParticipants figure is a UNION of userIds across all four
// sources (not a sum of the per-type counts above, which would double-count
// a participant who both voted and commented).
const UNIQUE_PARTICIPANTS_QUERY = `
  SELECT COUNT(DISTINCT userId) AS counted FROM (
    SELECT v.userId AS userId FROM votes v
      LEFT JOIN resources r ON v.resourceId = r.id
      WHERE r.projectId = ? AND v.deletedAt IS NULL AND r.deletedAt IS NULL AND v.userId != 0
    UNION
    SELECT c.userId AS userId FROM comments c
      LEFT JOIN resources r ON c.resourceId = r.id
      WHERE r.projectId = ? AND c.deletedAt IS NULL AND r.deletedAt IS NULL AND c.userId != 0
    UNION
    SELECT userId FROM submissions
      WHERE projectId = ? AND deletedAt IS NULL AND userId IS NOT NULL AND userId != 0
    UNION
    SELECT userId FROM choices_guide_results
      WHERE projectId = ? AND deletedAt IS NULL AND userId IS NOT NULL AND userId != 0
  ) AS combined`;

async function countDistinct(query, bindvars) {
  const [rows] = await sequelize.query(query, {
    replacements: bindvars,
    type: sequelize.QueryTypes.SELECT,
  });
  return (rows && rows.counted) || 0;
}

// GET /api/project/:projectId/reports/users/aggregates
//
// Mandatory aggregation (#442 AC: "Not optional, this is a requirement") —
// number of unique participants, overall and per data source. Non-component
// path (see users-anonymized.js) so the response must pass
// report-field-filter's aggregate/shape screen: `byType` is an array of flat
// {type, count} objects (an object keyed by type would fail that screen —
// see the existing /overview `result: [{counted}]` precedent in
// report-field-filter.test.js) rather than a nested keyed object.
module.exports = async function usersAggregates(req, res, next) {
  try {
    const projectId = req.project.id;

    const [uniqueParticipants, votes, comments, submissions, choiceGuides] =
      await Promise.all([
        countDistinct(UNIQUE_PARTICIPANTS_QUERY, [
          projectId,
          projectId,
          projectId,
          projectId,
        ]),
        countDistinct(BY_TYPE_QUERIES.votes, [projectId]),
        countDistinct(BY_TYPE_QUERIES.comments, [projectId]),
        countDistinct(BY_TYPE_QUERIES.submissions, [projectId]),
        countDistinct(BY_TYPE_QUERIES.choiceGuides, [projectId]),
      ]);

    return res.json({
      uniqueParticipants,
      byType: [
        { type: 'votes', count: votes },
        { type: 'comments', count: comments },
        { type: 'submissions', count: submissions },
        { type: 'choiceGuides', count: choiceGuides },
      ],
    });
  } catch (err) {
    return next(err);
  }
};
