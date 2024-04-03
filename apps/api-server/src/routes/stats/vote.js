const config    = require('config');
const dbConfig  = config.get('database');
const mysql = require('mysql2');
const express = require('express');
const createError = require('http-errors')
const hasRole = require('../../lib/sequelize-authorization/lib/hasRole');

const pool = mysql.createPool({
    host: dbConfig.host,
    user: dbConfig.user,
    password: dbConfig.password,
    database: dbConfig.database,
    waitForConnections: true,
    connectionLimit: 10,
    queueLimit: 0
});

let router = express.Router({mergeParams: true});

// for all get requests
router
    .all('*', function(req, res, next) {

        return next();

    })

router.route('/total')

    // count votes
    // -----------
    .get(function(req, res, next) {

        let isViewable = req.project && req.project.config && req.project.config.votes && req.project.config.votes.isViewable;
        isViewable = isViewable || hasRole( req.user, 'moderator')
        if (!isViewable) return next(createError(401, 'Je kunt deze stats niet bekijken'));

        let query = "SELECT count(votes.id) AS counted FROM votes LEFT JOIN resources ON votes.resourceId = resources.id WHERE votes.deletedAt IS NULL AND  (votes.checked IS NULL OR votes.checked = 1) AND resources.deletedAt IS NULL AND resources.projectId=?";
        let bindvars = [req.params.projectId]

        if (req.query.opinion) {
            query += " AND votes.opinion=?"
            bindvars.push(req.query.opinion);
        }

        pool
            .promise()
            .query(query, bindvars)
            .then( ([rows,fields]) => {
                console.log(rows);
                let counted = rows && rows[0] && rows[0].counted || -1;
                res.json({count: counted})
            })
            .catch(err => {
                next(err);
            })

    })


router.route('/no-of-users')

    // count votes
    // -----------
    .get(function(req, res, next) {

        let query = "SELECT count(votes.id) AS counted FROM votes LEFT JOIN resources ON votes.resourceId = resources.id WHERE resources.projectId=? AND votes.deletedAt  IS NULL AND  (votes.checked IS NULL OR votes.checked = 1)  AND resources.deletedAt IS NULL GROUP BY votes.userId";
        let bindvars = [req.params.projectId]

        pool
            .promise()
            .query(query, bindvars)
            .then( ([rows,fields]) => {
                console.log(rows);
                let counted = rows && rows.length || -1;
                res.json({count: counted})
            })
            .catch(err => {
                next(err);
            })

    })

module.exports = router;
