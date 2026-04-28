/**
 * Routes for returning statistics in JSON format
 *
 * For performance reasons MySQL queries are used instead of Sequalize
 */
const express = require('express');
const createError = require('http-errors');
const { sequelize } = require('../../../src/db');

const router = express.Router({ mergeParams: true });
const hasRole = require('../../lib/sequelize-authorization/lib/hasRole');

const rateLimiter = require('@openstad-headless/lib/rateLimiter');

/**
 * After SQL query only the missing
 *
 * @param results [{counted: INT, date: DATE}]
 * @returns [{counted: INT, date: DATE}]
 */
const addMissingDays = (results) => {
  // in case results are one or less return the results directly
  if (results.length <= 1) {
    return results;
  }

  // just to be sure, sort the order to DESC by date
  // SQL already should have done this, but this makes it a bit more stable
  results = results.sort((a, b) => {
    return new Date(a.date) - new Date(b.date);
  });

  //get first and last date
  const firstDate = results[0].date;
  const lastDate = results[results.length - 1].date;

  // if for some strange reasons they are not found, send back results
  // might be better to throw an error...
  if (!firstDate || !lastDate) {
    return results;
  }

  const newResults = [];

  let start = new Date(firstDate);
  const end = new Date(lastDate);

  // loop through every date from start to end add the data from the query
  while (start <= end) {
    // get date in SQL format by turning it to json and cutting it till the day
    // although often done like this, it's not the prettiest way, might be better to move it to moment.js at some point
    const formattedDate = start.toJSON().slice(0, 10);

    const resultForDate = results.find((result) => {
      return result.date === formattedDate;
    });

    newResults.push({
      date: formattedDate,
      counted:
        resultForDate && resultForDate.counted ? resultForDate.counted : 0,
    });

    // set the next day as the start date so we keep the while going untill the last day
    var newDate = start.setDate(start.getDate() + 1);
    start = new Date(newDate);
  }

  return newResults;
};

/**
 * Generic function for outputting all statistic queries
 */

// for all get requests
router.all('*', function (req, res, next) {
  return next();
});

router
  .route('/')

  // Check if user is allowed to see the statistics
  // -----------
  .get(rateLimiter(), (req, res, next) => {
    const isViewable = req.user && hasRole(req.user, 'editor');

    if (isViewable) {
      return next();
    } else {
      return next(createError(401, 'Je kunt deze statistieken niet bekijken'));
    }
  })
  .get((req, res, next) => {
    /**
     * List of queries with their description
     *
     * Results are automatically send to browser as JSON
     * Made for rendering analytics dashboard per project
     *
     * @type [{
     *      variables: [string],
     *      description: string, Describe type of statistics, might be used for displaying, but not for logic, can be changed
     *      key: string, Should be unique
     *      sql: string, Currently frontend assumes key: counted, and key counted & date for graphs.
     *      formatResults: Optional, function, can be used to parse, change results after SQL query is run.
     *      }]
     */

    // Optional date range filter via query params (?from=YYYY-MM-DD&to=YYYY-MM-DD)
    const dateRegex = /^\d{4}-\d{2}-\d{2}$/;
    const fromDate = dateRegex.test(req.query.from) ? req.query.from : null;
    const toDate = dateRegex.test(req.query.to) ? req.query.to : null;

    const resourceDateFilter =
      fromDate && toDate
        ? ' AND resources.createdAt >= ? AND resources.createdAt < DATE_ADD(?, INTERVAL 1 DAY)'
        : '';
    const voteDateFilter =
      fromDate && toDate
        ? ' AND votes.createdAt >= ? AND votes.createdAt < DATE_ADD(?, INTERVAL 1 DAY)'
        : '';
    const commentDateFilter =
      fromDate && toDate
        ? ' AND comments.createdAt >= ? AND comments.createdAt < DATE_ADD(?, INTERVAL 1 DAY)'
        : '';
    const choicesGuideDateFilter =
      fromDate && toDate
        ? ' AND choices_guide_results.createdAt >= ? AND choices_guide_results.createdAt < DATE_ADD(?, INTERVAL 1 DAY)'
        : '';
    const dateVars = fromDate && toDate ? [fromDate, toDate] : [];

    const queries = [
      {
        key: 'resourceTotal',
        description: 'Amount of resources',
        sql: `SELECT count(resources.id) AS counted FROM resources WHERE resources.deletedAt IS NULL AND resources.projectId=?${resourceDateFilter}`,
        variables: [req.params.projectId, ...dateVars],
        resultType: 'count',
      },
      {
        key: 'resourcesSubmittedPerDay',
        description: 'Resources submitted per day',
        sql: `SELECT count(resources.id) AS counted, DATE_FORMAT(resources.createdAt, '%Y-%m-%d') as date
                    FROM resources
                    WHERE resources.deletedAt IS NULL
                    AND resources.deletedAt IS NULL AND resources.projectId=?${resourceDateFilter}
                    GROUP BY date
                    ORDER BY date ASC`,
        variables: [req.params.projectId, ...dateVars],
        formatResults: addMissingDays,
      },
      {
        key: 'userVoteTotal',
        description: 'Amount of users that voted',
        sql: `SELECT count(DISTINCT votes.userId) AS counted FROM votes LEFT JOIN resources ON votes.resourceId = resources.id WHERE votes.deletedAt IS NULL AND (votes.checked IS NULL OR votes.checked = 1) AND resources.deletedAt IS NULL AND resources.projectId=?${voteDateFilter}`,
        variables: [req.params.projectId, ...dateVars],
        resultType: 'count',
      },
      {
        key: 'resourceVotesCountTotal',
        description: 'Amount of votes on resources',
        sql: `SELECT count(votes.id) AS counted FROM votes LEFT JOIN resources ON votes.resourceId = resources.id WHERE votes.deletedAt IS NULL AND (votes.checked IS NULL OR votes.checked = 1) AND resources.deletedAt IS NULL AND resources.projectId=?${voteDateFilter}`,
        variables: [req.params.projectId, ...dateVars],
        resultType: 'count',
      },
      {
        key: 'resourceVotesCountForTotal',
        description: 'Amount of votes for an resource',
        sql: `SELECT count(votes.id) AS counted FROM votes LEFT JOIN resources ON votes.resourceId = resources.id WHERE votes.deletedAt IS NULL AND (votes.checked IS NULL OR votes.checked = 1) AND resources.deletedAt IS NULL AND resources.projectId=? AND votes.opinion = 'yes'${voteDateFilter}`,
        variables: [req.params.projectId, ...dateVars],
        resultType: 'count',
      },
      {
        key: 'resourceVotesCountAgainstTotal',
        description: 'Amount of votes against an resource',
        sql: `SELECT count(votes.id) AS counted FROM votes LEFT JOIN resources ON votes.resourceId = resources.id WHERE votes.deletedAt IS NULL AND (votes.checked IS NULL OR votes.checked = 1) AND resources.deletedAt IS NULL AND resources.projectId=? AND votes.opinion = 'no'${voteDateFilter}`,
        variables: [req.params.projectId, ...dateVars],
        resultType: 'count',
      },
      {
        key: 'usersVotedPerDay',
        description: 'Amount of users that voted per day.',
        help: 'This is not the same as total votes per days, since a user can often vote on more then one resource.',
        sql: `SELECT count(DISTINCT votes.userId) AS counted, DATE_FORMAT(votes.createdAt, '%Y-%m-%d') as date
                    FROM votes
                    LEFT JOIN resources ON votes.resourceId = resources.id
                    WHERE votes.deletedAt IS NULL
                    AND (votes.checked IS NULL OR votes.checked = 1)
                    AND resources.deletedAt IS NULL AND resources.projectId=?${voteDateFilter}
                    GROUP BY date
                    ORDER BY date ASC`,
        variables: [req.params.projectId, ...dateVars],
        formatResults: addMissingDays,
      },
      {
        key: 'votesPerDay',
        description: 'Amount of votes per day',
        sql: `SELECT count(votes.id) AS counted, DATE_FORMAT(votes.createdAt, '%Y-%m-%d') as date
                    FROM votes
                    LEFT JOIN resources ON votes.resourceId = resources.id
                    WHERE votes.deletedAt IS NULL
                    AND (votes.checked IS NULL OR votes.checked = 1)
                    AND resources.deletedAt IS NULL AND resources.projectId=?${voteDateFilter}
                    GROUP BY date
                    ORDER BY date ASC`,
        variables: [req.params.projectId, ...dateVars],
        formatResults: addMissingDays,
      },
      {
        key: 'commentCountTotal',
        description: 'Amount of comments, total count',
        sql: `SELECT count(comments.id) AS counted FROM comments LEFT JOIN resources ON resources.id = comments.resourceId WHERE comments.deletedAt IS NULL AND resources.deletedAt IS NULL AND resources.projectId=?${commentDateFilter}`,
        variables: [req.params.projectId, ...dateVars],
      },
      {
        key: 'commentForCountTotal',
        description: 'Amount of comments for an resource, total count',
        sql: `SELECT count(comments.id) AS counted FROM comments LEFT JOIN resources ON resources.id = comments.resourceId WHERE comments.deletedAt IS NULL AND resources.deletedAt IS NULL AND resources.projectId=? AND comments.sentiment = 'for'${commentDateFilter}`,
        variables: [req.params.projectId, ...dateVars],
      },
      {
        key: 'commentAgainstCountTotal',
        description: 'Amount of comments against an resource, total count',
        sql: `SELECT count(comments.id) AS counted FROM comments LEFT JOIN resources ON resources.id = comments.resourceId WHERE comments.deletedAt IS NULL AND resources.deletedAt IS NULL AND resources.projectId=? AND comments.sentiment = 'against'${commentDateFilter}`,
        variables: [req.params.projectId, ...dateVars],
      },
      {
        key: 'choicesguideresultsCountTotal',
        description: 'Amount of choices guide results',
        sql: `SELECT count(choices_guide_results.id) AS counted FROM choices_guide_results WHERE choices_guide_results.deletedAt IS NULL AND choices_guide_results.projectId=?${choicesGuideDateFilter}`,
        variables: [req.params.projectId, ...dateVars],
      },
    ];

    req.queries = queries;

    next();
  })
  .get(async (req, res, next) => {
    try {
      const results = await Promise.all(
        req.queries.map(async (query) => {
          const rows = await sequelize.query(query.sql, {
            replacements: query.variables,
            type: sequelize.QueryTypes.SELECT,
          });
          return {
            key: query.key,
            description: query.description,
            result: query.formatResults ? query.formatResults(rows) : rows,
          };
        })
      );
      req.stats = results;
      next();
    } catch (e) {
      console.log('Error while executing statistic query: ', e);
      return next(
        createError(500, 'Error while executing statistic query: ' + e)
      );
    }
  })
  .get((req, res, next) => {
    res.json(req.stats);
  });
module.exports = router;
