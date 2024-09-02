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
  const keys = ['password', 'name', 'nickName', 'email', 'phoneNumber', 'address', 'city', 'postcode', 'extraData', 'listableByRole', 'detailsViewableByRole', 'firstname', 'lastname'];

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

    if (req.query.byIdpUser) {
      req.scope.push({ method: [ 'byIdpUser', req.query.byIdpUser.identifier, req.query.byIdpUser.provider ]  });
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
    return next( new Error('Users: project not found') );
  });

router.route('/')
// list users
// ----------
  .get(function (req, res, next) {
    let role = req.user.role == 'superuser' ? 'admin' : req.user.role;
    req.scope.push({method: ['onlyListable', req.user.id, role]});
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
  .post(async function (req, res, next) {
    // auth server settings
    req.authConfig = await authSettings.config({ project: req.project, useAuth: req.query.useAuth || 'default' });
    req.adapter = await authSettings.adapter({ authConfig: req.authConfig });
    return next();
  })
  .post(async function (req, res, next) {
    if (!req.body.idpUser) return next();
    // new user is another instance of an existing user
    if (!req.body.idpUser?.identifier || !req.body.idpUser.provider || req.body.idpUser.provider != req.authConfig.provider) return next(createError(400, 'User not found'));
    let referenceUser = await db.User.findOne({
      where: {
        idpUser: {
          identifier: req.body.idpUser.identifier,
          provider: req.body.idpUser.provider
        },
        projectId: { [ Sequelize.Op.not ]: req.params.projectId }
      }
    })
    if (!referenceUser) return next(createError(400, 'User not found'));
    try {
      req.oAuthUser = await req.adapter.service.fetchUserData({ authConfig: req.authConfig, userId: req.body.idpUser.identifier })
      req.referenceUser = referenceUser;
      return next();
    } catch(err) {
      return next(err)
    }
  })
  .post(filterBody)
  .post(async function (req, res, next) {
    if (req.oAuthUser) return next();
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
    if (req.oAuthUser) return next();
    // in case no oauth user is found with this e-mail create it
    if (!req.adapter?.service?.createUser) throw createError(400, 'Users can not be created for this provider')
    req.adapter.service
      .createUser({ authConfig: req.authConfig, userData: req.body })
      .then(json => {
        req.oAuthUser = json;
        next()
      })
      .catch(next);
  })
// check if user not already exists in API
  .post(function (req, res, next) {
    db.User
      .scope(...req.scope)
      .findOne({
        where: {idpUser: { identifier: req.oAuthUser.idpUser.identifier, provider: req.oAuthUser.idpUser.provider }, projectId: req.project.id},
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
  .post(async function(req, res, next) {
    const data = {
      ...req.body,
      ...req.oAuthUser,
      projectId: req.project.id,
      role: req.body.role || req.oAuthUser.role || 'member',
      lastLogin: Date.now(),
    };
    
    db.User
      .authorizeData(data, 'create', req.user)
      .create(data)
      .then(async result => {
        req.results = result;
        if (req.referenceUser) await req.adapter.service.updateUser({ authConfig: req.authConfig, userData: { id: req.oAuthUser.idpUser.identifier, role: req.body.role } })
        return next();
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
  })
  .post(function (req, res, next) {
    return res.json(req.results);
  })

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
        req.externalUserId = found.idpUser.identifier;
        req.externalUserProvider = found.idpUser.provider;
        next();
        return null;
      })
      .catch(next);
  })
  .put(function (req, res, next) {
    if (!req.externalUserId) return next();
    // this user on other projects
    let where = { idpUser: { identifier: req.externalUserId, provider: req.externalUserProvider }, [Op.not]: { id: req.userId } };
    console.log('===', where);
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
        "resources": [],
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
          req.results.resources = req.results.resources.concat(result.resources || []);
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
    let where = { idpUser: { identifier: req.externalUserId, provider: req.externalUserProvider } };
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

      if (user.idpUser?.identifier) {
        let updatedUserData = merge(true, userData, { id: user.idpUser && user.idpUser.identifier });
        const updatedUserDataForProject = merge.recursive({}, updatedUserData);

        if (req.results.idpUser.provider == req.authConfig.provider && req.adapter.service.updateUser) {
          updatedUserData = await req.adapter.service.updateUser({ authConfig: req.authConfig, userData: merge(true, userData, { id: user.idpUser && user.idpUser.identifier }) });
        }

        // user updates should not be done on certain project specific fields
        let synchronizedUpdatedUserData = merge.recursive({}, updatedUserData);
        let userProjectSpecificFields = ['nickName', 'role']; // todo: dit moet natuurlijk niet hier, maar dat is nu minder relevant
        for (let userProjectSpecificField of userProjectSpecificFields) {
          delete synchronizedUpdatedUserData[ userProjectSpecificField ];
        }

        let apiUsers = await db.User
            .scope(['includeProject'])
            .findAll({
              where: {
                idpUser: { identifier: updatedUserData.idpUser.identifier, provider: updatedUserData.idpUser.provider },
                projectId: { [Op.not]: 0 }
              }
            })

        apiUsers.forEach((apiUser, i) => {
          return new Promise((resolve, reject) => {
            let data = apiUser.projectId == req.params.projectId ? updatedUserDataForProject : synchronizedUpdatedUserData;

            if (req.user.can('update', apiUser)) {
              apiUser
                .authorizeData(data, 'update', req.user)
                .update(data)
                .then((result) => {
                  resolve();
                })
                .catch((err) => {
                  resolve(err);
                });
            } else {
              resolve(new Error('User not authorized to update nickName'));
            }
          });
        });

      } else {

        let apiUser = await db.User
            .scope(['includeProject'])
            .findOne({
              where: {
                id: user.id,
                projectId: req.params.projectId,
              }
            })
        apiUser
            .authorizeData(userData, 'update', req.user)
            .update(userData)
      }

      return next();

    } catch(err) {
      console.log(err);
      return next( createError(500, 'User update failed') )
    }

  })
  .put(async function (req, res, next) {
    let result = await db.User
        .findOne({
          where: {id: req.params.userId, projectId: req.params.projectId}
        })
    res.json(result);
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
        adapter.service.deleteUser({ authConfig, userData: { id: user.idpUser.identifier, provider: user.idpUser.provider } })
      }
    }
    
    /**
     * Delete all connected comments, votes and resources created by the user
     * TODO: dit is niet meer nodig als we paranoid er uit halen
     */
    await db.Resource.destroy({where: {userId: req.results.id}});
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
