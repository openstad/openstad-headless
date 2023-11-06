const Sequelize = require('sequelize');
const express = require('express');
const createError = require('http-errors');
const config = require('config');
const db = require('../../db');
const auth = require('../../middleware/sequelize-authorization-middleware');
const pagination = require('../../middleware/pagination');
const {Op} = require('sequelize');
const searchInResults = require('../../middleware/search-in-results');
const fetch = require('node-fetch');
const merge = require('merge');
const authSettings = require('../../util/auth-settings');
const hasRole = require('../../lib/sequelize-authorization/lib/hasRole');

const filterBody = (req, res, next) => {
  const data = {};
  const keys = ['name', 'nickName', 'email', 'phoneNumber', 'address', 'city', 'postcode', 'extraData', 'listableByRole', 'detailsViewableByRole'];

  keys.forEach((key) => {
    if (typeof req.body[key] != 'undefined') {
      let value =  req.body[key];
      value = typeof value === 'string' ? value.trim() : value;
      data[key] = value;
    }
  });

  // role is a special case: only if you have at least that role
  if (req.body.role && hasRole( req.user, req.body.role )) {
    data.role = req.body.role
  }

  req.body = data;

  next();
}

const router = express.Router({mergeParams: true});

router
  .all('*', function (req, res, next) {

    req.scope = [];

    if (req.query.includeProject) {
      req.scope.push('includeProject');
    }

    if(req.query.fromIdpUser) {
      req.scope.push({ method:['fromIdpUser'] })
    }

    return next();

  });

router
// /user is only available for admins
  .all('*', function (req, res, next) {
    if (req.project) {
      return next();
    } else {
      if (req.method == 'GET' && hasRole(req.user, 'admin')) {
        return next();
      }
    }
    return next( new Error('Project not found') );

  });

router.route('/')
// list users
// ----------
// .get(auth.can('User', 'list')) -> now handled by onlyListable
  .get(function (req, res, next) {
    req.scope.push({method: ['onlyListable', req.user.id, req.user.role]});
    return next();
  })
  .get(function (req, res, next) {
    return next();
  })
  .get(pagination.init)
  .get(function (req, res, next) {

    let { dbQuery } = req;
    dbQuery.where = {
      ...req.queryConditions,
      ...dbQuery.where,
    };
    if (req.params.projectId) dbQuery.where.projectId = req.params.projectId;

    db.User
      .scope(...req.scope)
      .findAndCountAll(dbQuery)
      .then(function (result) {
        req.results = result.rows;
        req.dbQuery.count = result.count;
        return next();
      })
      .catch(next);
  })
  .get(auth.useReqUser)
  .get(searchInResults({ searchfields: ['name', 'role'] }))
  .get(pagination.paginateResults)
  .get(function (req, res, next) {
    res.json(req.results);
  })

// create user
// -----------
  .post(auth.can('User', 'create'))
  .post(function (req, res, next) {
    // check project
    if (!req.project) return next(createError(401, 'Project niet gevonden'));
    return next();
  })
  .post(function (req, res, next) {
    // check config
    if (!(req.project.config && req.project.config.users && req.project.config.users.canCreateNewUsers)) return next(createError(401, 'Gebruikers mogen niet aangemaakt worden'));
    return next();
  })
  .post(filterBody)
  .post(async function (req, res, next) {
    // auth server settings
    req.authConfig = await authSettings.config({ project: req.project, useAuth: req.query.useAuth || 'default' });
    req.adapter = await authSettings.adapter({ authConfig: req.authConfig });
    return next();
  })
  .post(async function (req, res, next) {
    // Look for an Openstad user with this e-mail
    // TODO: other types of users
    if (!req.body.email) return next(createError(401, 'E-mail is a required field'));
    let email = req.body && req.body.email;
    req.adapter.service
      .fetchUserData({ authConfig: req.authConfig, email })
      .then(json => {
        req.oAuthUser = json;
        return next();
      })
      .catch(next);
  })
/**
 * In case a user exists for that e-mail in the oAuth api move on, otherwise create it
 */
  .post(function (req, res, next) {
    if (req.oAuthUser) {
      next();
    } else {
      // in case no oauth user is found with this e-mail create it
      if (!req.adapter?.service?.createUser) throw createError(400, 'Users can not be created for this provider')
      req.adapter.service
        .createUser({ authConfig: req.authConfig, userData: req.body })
        .then(json => {
          req.oAuthUser = json;
          next()
        })
        .catch(next);
    }
  })
// check if user not already exists in API
  .post(function (req, res, next) {
    db.User
      .scope(...req.scope)
      .findOne({
        where: {email: req.body.email, projectId: req.project.id},
      })
      .then(found => {
        if (found) {
          console.log('user already exists', found);
          throw new Error('User already exists');
        } else {
          next();
        }
      })
      .catch(next);
  })
  .post(auth.useReqUser)
  .post(function (req, res, next) {
    const data = {
      ...req.body,
      ...req.oAuthUser,
      projectId: req.project.id,
      role: req.oAuthUser.role || 'member',
      lastLogin: Date.now(),
    };
    
    db.User
      .authorizeData(data, 'create', req.user)
      .create(data)
      .then(result => {
        return res.json(result);
      })
      .catch(function (error) {
        // todo: dit komt uit de oude routes; maak het generieker
        if (typeof error == 'object' && error instanceof Sequelize.ValidationError) {
          let errors = [];

          error.errors.forEach(function (error) {
            errors.push(error.message);
          });

          res.status(422).json(errors);
        } else {
          next(error);
        }
      });
  });

// anonymize user
// --------------
router.route('/:userId(\\d+)/:willOrDo(will|do)-anonymize(:all(all)?)')
  .put(function (req, res, next) {
    // this user
    req.userId = parseInt(req.params.userId);
    if (!req.userId) return next(new createError(404, 'User not found'))
    return db.User
      .scope(...req.scope)
      .findOne({
        where: {id: req.userId, projectId: req.params.projectId},
        //where: { id: userId }
      })
      .then(found => {
        if (!found) throw new createError(404, 'User not found');
        req.targetUser = found;
        req.externalUserId= found.idpUser.identifier;
        next();
        return null;
      })
      .catch(next);
  })
  .put(function (req, res, next) {
    if (!req.externalUserId) return next();
    // this user on other projects
    let where = { idpUser: { identifier: req.externalUserId }, [Op.not]: { id: req.userId } };
    db.User
      .scope(...req.scope)
      .findAll({
        where,
      })
      .then(found => {
        if (!found) return next();
        req.linkedUsers = found;
        next();
        return null;
      })
      .catch(next);
  })
  .put(async function (req, res, next) {
    // if body contains user ids then anonymize only those
    try {
      let ids = req.body && req.body.onlyUserIds;
      if (!ids) return next();
      if (!Array.isArray(ids)) ids = [ids];
      ids = ids.map(id => parseInt(id)).filter(id => typeof id == 'number');
      if (ids.length) req.onlyUserIds = ids;
    } catch (err) {
      return next(err);
    }
    return next();
  })
  .put(async function (req, res, next) {
    // if body contains project ids then anonymize only the users for those projects
    try {
      let ids = req.body && req.body.onlyProjectIds;
      if (!ids) return next();
      if (!Array.isArray(ids)) ids = [ids];
      ids = ids.map(id => parseInt(id)).filter(id => typeof id == 'number');
      if (ids.length) {
        let users = [ req.targetUser, ...req.linkedUsers ];
        let xx = ids.map( projectId => users.find(user => projectId == user.projectId) );
        let userIds = ids.map( projectId => users.find(user => projectId == user.projectId) ).filter(user => !!user).map( user => user.id );
        req.onlyUserIds = (req.onlyUserIds || []).concat(userIds);
        req.onlyUserIds = req.onlyUserIds.filter((value, index, self) => self.indexOf(value) === index ); // filter duplication
      }
    } catch (err) {
      return next(err);
    }
    return next();
  })
  .put(async function (req, res, next) {
    let result;
    if (!(req.targetUser && req.targetUser.can && req.targetUser.can('update', req.user))) return next(new Error('You cannot update this User'));
    if (req.onlyUserIds && !req.onlyUserIds.includes(req.targetUser.id)) {
      req.results = {
        "ideas": [],
        "comments": [],
        "votes": [],
        "users": [],
        "projects": [],
      }
      return next();
    }
    try {
      if (req.params.willOrDo == 'do') {
        result = await req.targetUser.doAnonymize();
      } else {
        result = await req.targetUser.willAnonymize();
      }
      result.users = [ result.user ];
      delete result.user;
      result.projects = [ result.project ];
      delete result.project;
      req.results = result;
    } catch (err) {
      return next(err);
    }
    return next();
  })
  .put(async function (req, res, next) {
    if ( !(req.params.all) ) return next();
    if ( !(req.linkedUsers) ) return next();
    try {
      for (const user of req.linkedUsers) {
        if (!req.onlyUserIds || req.onlyUserIds.includes(user.id)) {
          let result;
          if (!(user && user.can && user.can('update', req.user))) return next(new Error('You cannot update this User'));
          if (req.params.willOrDo == 'do') {
            result = await user.doAnonymize();
          } else {
            result = await user.willAnonymize();
          }
          req.results.users.push(result.user);
          req.results.projects.push(result.project);
          req.results.ideas = req.results.ideas.concat(result.ideas || []);
          req.results.comments = req.results.comments.concat(result.comments || []);
          req.results.votes = req.results.votes.concat(result.votes || []);
        }
      }
    } catch (err) {
      return next(err);
    }
    return next();
  })
  .put(function (req, res, next) {
    if (!req.externalUserId) return next();
    // refresh: this user including other projects
    let where = { idpUser: { identifier: req.externalUserId } };
    db.User
      .scope(...req.scope)
      .findAll({
        where,
      })
      .then(found => {
        if (!found) return next();
        req.remainingUsers = found;
        next();
        return null;
      })
      .catch(next);
  })
  .put(async function (req, res, next) {
    if (req.params.willOrDo != 'do') return next();
    if ( !req.remainingUsers || req.remainingUsers.length > 0 ) return next();

    // no api users left for this oauth user, so remove the oauth user
    try {
      let authConfig = await authSettings.config({ project: req.project, useAuth: req.query.useAuth || 'default' });
      let adapter = await authSettings.adapter({ authConfig: req.authConfig });
      if (adapter.service.deleteUser) {
        adapter.service.deleteUser({ authConfig, userData: { id: req.externalUserId } })
      }
    } catch (err) {
      return next(err);
    }
    return next();
  })
  .put(function (req, res, next) {
    // customized version of auth.useReqUser
    Object.keys(req.results).forEach(which => {
      req.results[which] && req.results[which].forEach( result => {
        result.auth = result.auth || {};
        result.auth.user = req.user;
      });
    });
    return next();
  })
  .put(function (req, res, next) {
    res.json(req.results);
  })

// one user
// --------
router.route('/:userId(\\d+)')
  .all(function (req, res, next) {
    const userId = parseInt(req.params.userId) || 1;
    db.User
      .scope(...req.scope)
      .findOne({
        //where: {id: userId, projectId: req.params.projectId},
        where: { id: userId }
      })
      .then(found => {
        if (!found) throw new createError(404, 'User not found');
        req.results = found;
        next();
      })
      .catch(next);
  })

// view user
// ---------
  .get(auth.can('User', 'view'))
  .get(auth.useReqUser)
  .get(function (req, res, next) {
    res.json(req.results);
  })

// update user
// -----------
  .put(auth.useReqUser)
  .put(filterBody)
  .put(function (req, res, next) {
    if (!(req.results && req.results.can && req.results.can('update'))) throw createError(400, 'You cannot update this User');
    return next()
  })
  .put(async function (req, res, next) {
    // auth server settings
    req.authConfig = await authSettings.config({ project: req.project, useAuth: req.query.useAuth || 'default' });
    req.adapter = await authSettings.adapter({ authConfig: req.authConfig });
    return next();
  })
  .put(async function (req, res, next) {

    let user = req.results;
    let userData = merge.recursive(true, req.body);

    try {

      let updatedUserData = merge(true, userData, { id: user.idpUser && user.idpUser.identifier });
            
      if (req.adapter.service.updateUser) {
        updatedUserData = await req.adapter.service.updateUser({ authConfig: req.authConfig, userData: merge(true, userData, { id: user.idpUser && user.idpUser.identifier }) });
        delete updatedUserData.nickName // TODO: these updates should not be done for fields that can be different per project. For now: nickName
      }

      let apiUsers = await db.User
          .scope(['includeProject'])
          .findAll({
            where: {
              idpUser: { identifier: updatedUserData.idpUser.identifier },
              projectId: { [Op.not]: 0 }
            }
          })
      for (let apiUser of apiUsers) {
        let result = await apiUser
            .authorizeData(updatedUserData, 'update', req.user)
            .update(updatedUserData)
      };

      let result = await db.User
        .findOne({
          where: {id: req.params.userId, projectId: req.params.projectId}
        })

      res.json(result);

    } catch(err) {
      console.log(err);
      return next( createError(500, 'User update failed') )
    }

  })

// delete user
// -----------
  .delete(auth.useReqUser)
  .delete(async function (req, res, next) {

    const user = req.results;

    if (!(user && user.can && user.can('delete'))) return next(new Error('You cannot delete this User'));

    /**
     * An oauth user can have multiple users in the api, every project has it's own user and right
     * In case for this oauth user there is only one project user in the API we also delete the oAuth user
     * Otherwise we keep the oAuth user since it's still needed for the other website
     */
    const userForAllProjects = await db.User.findAll({where: {idpUser: { identifier: user.idpUser && user.idpUser.identifier }}});
    if (userForAllProjects.length <= 1) {
      let authConfig = await authSettings.config({ project: req.project, useAuth: req.query.useAuth || 'default' });
      let adapter = await authSettings.adapter({ authConfig: req.authConfig });
      if (adapter.service.deleteUser) {
        adapter.service.deleteUser({ authConfig, userData: { id: user.idpUser.identifier } })
      }
    }
    
    /**
     * Delete all connected comments, votes and ideas created by the user
     * TODO: dit is niet meer nodig als we paranoid er uit halen
     */
    await db.Idea.destroy({where: {userId: req.results.id}});
    await db.Comment.destroy({where: {userId: req.results.id}});
    await db.Vote.destroy({where: {userId: req.results.id}});
    
    /**
     * Make anonymous? Delete posts
     */
    return req.results
      .destroy({force: true})
      .then(() => {
        res.json({"user": "deleted"});
      })
      .catch(next);

  })

module.exports = router;
