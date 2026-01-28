const express = require('express');
const createError = require('http-errors')
const hasRole = require('../../lib/sequelize-authorization/lib/hasRole');
const rateLimiter = require("@openstad-headless/lib/rateLimiter");
const { sequelize } = require('../../../src/db');

let router = express.Router({mergeParams: true});

// for all get requests
router
    .all('*', function(req, res, next) {

        return next();

    })

router.route('/total')

    // count votes
    .get( rateLimiter(), async function(req, res, next) {

        let isViewable = req.project && req.project.config && req.project.config.votes && req.project.config.votes.isViewable;
        isViewable = isViewable || hasRole( req.user, 'editor')
        if (!isViewable) return next(createError(401, 'Je kunt deze stats niet bekijken'));

        let query = "SELECT count(votes.id) AS counted FROM votes LEFT JOIN resources ON votes.resourceId = resources.id WHERE votes.deletedAt IS NULL AND  (votes.checked IS NULL OR votes.checked = 1) AND resources.deletedAt IS NULL AND resources.projectId=?";
        let bindvars = [req.params.projectId]

        if (req.query.opinion) {
            query += " AND votes.opinion=?"
            bindvars.push(req.query.opinion);
        }

        try {
            const [rows] = await sequelize.query(query, {
                replacements: bindvars,
                type: sequelize.QueryTypes.SELECT
            })
            
            let counted = rows?.counted ?? 0;

            res.json({ count: counted })
        } catch (err) {
            next(err)
        }

    })


router.route('/no-of-users')

    // count unique users who voted
    .get( rateLimiter(), async function(req, res, next) {

        let query = "SELECT count(DISTINCT votes.userId) AS counted FROM votes LEFT JOIN resources ON votes.resourceId = resources.id WHERE resources.projectId=? AND votes.deletedAt IS NULL AND (votes.checked IS NULL OR votes.checked = 1) AND resources.deletedAt IS NULL";
        let bindvars = [req.params.projectId]

        try{
            const [rows] = await sequelize.query(query, {
                replacements: bindvars,
                type: sequelize.QueryTypes.SELECT
            })

            let counted = rows?.counted ?? 0

            res.json({ count: counted })
        } catch (err) {
            next(err)
        }
    })

module.exports = router;
