const Sequelize = require('sequelize');
const express = require('express');
const createError = require('http-errors');
const config = require('config');
const db = require('../../db');
const auth = require('../../middleware/sequelize-authorization-middleware');
const pagination = require('../../middleware/pagination');
const {Op} = require('sequelize');
const merge = require('merge');

const router = express.Router({mergeParams: true});

const activityKeys = ['ideas', 'comments', 'votes', 'projects'];

const activityConfig = {
  'ideas' : {
      descriptionKey: 'description',
      type: {
        slug: 'idea',
        label: 'inzending'
      }
  },
  'comments': {
    descriptionKey: 'description',
    type: {
      slug: 'comment',
      label: 'reactie'
    }
  },
  'votes': {
    descriptionKey: '',
    type: {
      slug: 'vote',
      label: 'stem'
    }
  },
  /*
  'projects': {
    descriptionKey: '',
    type: {
      slug: 'project',
      label: 'Project'
    }
  },

   */
}

router
  .all('*', function (req, res, next) {
    // req.scope = ['includeProject'];
    next();
  });

// list user ideas, comments, votes
// -------------------------------------------
router.route('/')

// what to include
  .get(function (req, res, next) {
    req.activities = [];
    ['ideas', 'comments', 'votes'].forEach(key => {
      let include = 'include' + key.charAt(0).toUpperCase() + key.slice(1);;
      if (req.query[include]) {
        req.activities.push(key)
      }
    });
    if ( req.activities.length == 0 ) req.activities = activityKeys;

    if (req.query.includeOtherProjects == 'false' || req.query.includeOtherProjects == '0') req.query.includeOtherProjects = false;
    req.includeOtherProjects = typeof req.query.includeOtherProjects != 'undefined' ? !!req.query.includeOtherProjects : true;
    req.results = {};
    next();
  })

// this user on other projects
  .get(function(req, res, next) {
    req.userIds = [ parseInt(req.params.userId) ];
    if (!req.includeOtherProjects) return next();
    return db.User
      .findOne({
        where: {
          id: req.params.userId,
        },
      })
      .then(function (user) {
        if (!user.idpUser || !user.idpUser.identifier) return next();

        return db.User
          .scope(['includeProject'])
          .findAll({
            where: {
              idpUser: { identifier: user.idpUser.identifier },
              // old users have no projectId, this will break the update
              // skip them
              // probably should clean up these users
              projectId: {
                [Op.not]: 0
              }
            }
          })
          .then(users => {
            users.forEach((user) => {
              req.userIds.push(user.id);
            });

            req.users =  users;

            return next()
          })
      });
  })
  // projects
  .get(function(req, res, next) {
    next()
  })
  .get(function(req, res, next) {

    if (!req.activities.includes('projects')) return next();
    return auth.can('Project', 'list')(req, res, next);
  })
  .get(function(req, res, next) {

    if (!req.activities.includes('projects')) return next();
    const projectIds = req.users.map(user => user.projectId);
    let where = { id: projectIds };

    return db.Project
      .findAll({ where })
      .then(function(rows) {
        // projects should only contain non sensitve fields
        // config contains keys, the standard library should prevent this
        // in case a bug makes that fails, we only cherry pick the fields to be sure
        req.results.projects = rows.map(project => {
          return {
            id: project.id,
            url: project.url,
            title: project.title,
            createdAt: project.createdAt,
            updatedAt: project.updatedAt,
          }
        });
        return next();
      })
  })
// ideas
  .get(function(req, res, next) {
    if (!req.activities.includes('ideas')) return next();
    return auth.can('Idea', 'list')(req, res, next);
  })
  .get(function(req, res, next) {
    if (!req.activities.includes('ideas')) return next();
    let where = { userId: req.userIds };
    return db.Idea
      .scope(['includeProject'])
      .findAll({ where })
      .then(function(rows) {
        req.results.ideas = rows;
        return next();
      })
  })

// comments
  .get(function(req, res, next) {
    if (!req.activities.includes('comments')) return next();
    return auth.can('Comment', 'list')(req, res, next);
  })
  .get(function(req, res, next) {
    if (!req.activities.includes('comments')) return next();
    let where = { userId: req.userIds };
    return db.Comment
      .scope(['withIdea'])
      .findAll({ where })
      .then(function(rows) {
        req.results.comments = rows.filter(row => !!row.idea);
        return next();
      })
  })

// votes
  .get(function(req, res, next) {
    if (!req.activities.includes('votes')) return next();
    return auth.can('Vote', 'list')(req, res, next);
  })
  .get(function(req, res, next) {
    if (!req.activities.includes('votes')) return next();
    let where = { userId: req.userIds };
    return db.Vote
      .scope(['withIdea'])
      .findAll({ where })
      .then(function(rows) {
        req.results.votes = rows.filter(row => !!row.idea);;
        return next();
      })
  })

  .get(function (req, res, next) {
    // customized version of auth.useReqUser

    let activity = [];

    req.activities.forEach(which => {

      req.results[which] && req.results[which].forEach( result => {
        result.auth = result.auth || {};
        result.auth.user = req.user;
      });

      if (activityConfig[which]) {
        const formattedAsActivities = req.results[which] && Array.isArray(req.results[which]) ? req.results[which].map((instance) => {
          const config = activityConfig[which];
          const idea = which === 'ideas' ? instance : instance.idea;

          const project =  req.results.projects.find((project) => {
            return project.id === idea.projectId;
          })

          return {
             //strip html tags
            description: instance[config.descriptionKey] ? instance[config.descriptionKey].replace(/<[^>]+>/g, '') : '',
            type: config.type,
            idea: idea,
            project: project ? project : false,
            createdAt: instance.createdAt
          }
        }) : [];

        // we merge activities
        activity = activity.concat(formattedAsActivities)
      }
    });



    // sort activities on createdAt

    activity.sort((a, b) => {
      var dateA = new Date(a.createdAt), dateB = new Date(b.createdAt)
      return dateB- dateA;
    })

    req.results.activity = activity;

    return next();
  })
  .get(function (req, res, next) {
    // console.log({
    //   ideas: req.results.ideas && req.results.ideas.length,
    //   comment: req.results.comment && req.results.comments.length,
    //   votes: req.results.votes && req.results.votes.length,
    // });

    res.json(req.results);
  })

module.exports = router;
