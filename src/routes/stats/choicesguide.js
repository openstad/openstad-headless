const config    = require('config');
const dbConfig  = config.get('database');
const mysql = require('mysql2');
const express = require('express');
const createError = require('http-errors')

const pool = mysql.createPool({
  host: dbConfig.host,
  user: dbConfig.user,
  password: dbConfig.password,
  database: dbConfig.database,
  waitForConnections: true,
  connectionLimit: 10,
  queueLimit: 0
});

const router = express.Router({mergeParams: true});

// for all get requests
router
  .all('*', function(req, res, next) {
    return next();
  })

router.route('/total')
  .get(function(req, res, next) {

    let query = `
        SELECT count(choicesGuideResults.id) AS counted 
        FROM choicesGuideResults
        INNER JOIN choicesGuides ON choicesGuides.id = choicesGuideResults.choicesGuideId
        WHERE choicesGuideResults.deletedAt IS NULL 
        AND choicesGuides.projectId=?    
        AND choicesGuides.deletedAt IS NULL
    `;
    const bindvars = [req.params.projectId]

    if (req.query.choicesGuideId) {
      query += `AND choicesGuideResults.choicesGuideId=?`;
      bindvars.push(req.query.choicesGuideId);
    }

    pool
      .promise()
      .query(query, bindvars)
      .then( ([rows,fields]) => {
        let counted = rows && rows[0] && rows[0].counted || -1;
        res.json({count: counted})
      })
      .catch(err => {
        next(err);
      })

  })

module.exports = router;
