const Sequelize = require('sequelize');
const express = require('express');
const moment = require('moment');
const createError = require('http-errors');
const config = require('config');
const db = require('../../db');
const auth = require('../../middleware/sequelize-authorization-middleware');
const mail = require('../../lib/mail');
const pagination = require('../../middleware/pagination');
const searchResults = require('../../middleware/search-results-static');
const isJson = require('../../util/isJson');
const publishConcept = require('../../middleware/publish-concept');
const c = require('config');

const router = express.Router({ mergeParams: true });
const userhasModeratorRights = (user) => {
  return user && (user.role === 'admin' || user.role === 'editor' || user.role === 'moderator');
};

// scopes: for all get requests
router
  .all('*', function(req, res, next) {
    req.scope = ['api', { method: ['onlyVisible', req.user.id, req.user.role] }];

    // in case the votes are archived don't use these queries
    // this means they can be cleaned up from the main table for performance reason
    if (!req.project.config.archivedVotes) {
      if (req.query.includeVoteCount && ( (req.project && req.project.config && req.project.config.votes && req.project.config.votes.isViewable) || userhasModeratorRights(req.user) )) {
        req.scope.push('includeVoteCount');
      }

      if (req.query.includeUserVote && req.project && req.project.config && req.project.config.votes && req.project.config.votes.isViewable && req.user && req.user.id) {
        // ik denk dat je daar niet het hele object wilt?
        req.scope.push({ method: ['includeUserVote', req.user.id] });
      }
    }
    // because includeVoteCount is used in other locations but should only be active if isViewable
    if ( (req.project && req.project.config && req.project.config.votes && req.project.config.votes.isViewable) || userhasModeratorRights(req.user) ) {
      req.canIncludeVoteCount = true; // scope.push(undefined) would be easier but creates an error
    }

    /**
     * Old sort for backward compatibility
     */
    let sort = (req.query.sort || '').replace(/[^a-z_]+/i, '');
    if (sort) {
      if (sort == 'votes_desc' || sort == 'votes_asc') {
        if (req.canIncludeVoteCount) req.scope.push('includeVoteCount'); // het werkt niet als je dat in de sort scope functie doet...
      }
      req.scope.push({ method: ['sort', req.query.sort] });
    }

    if (req.query.mapMarkers) {
      req.scope.push('mapMarkers');
    }

    if (req.query.filters || req.query.exclude) {
      req.scope.push({ method: ['filter', req.query.filters, req.query.exclude] });
    }

    if (req.query.running) {
      req.scope.push('selectRunning');
    }

    if (req.query.includeArguments) {
      req.scope.push({ method: ['includeArguments', req.user.id] });
    }

    if (req.query.includeArgsCount) {
      req.scope.push('includeArgsCount');
    }

    if (req.query.includeTags) {
      req.scope.push('includeTags');
    }


    if (req.query.includePoll) {
      req.scope.push({ method: ['includePoll', req.user.id] });
    }

    if (req.query.tags) {
      let tags = req.query.tags;
      req.scope.push({ method: ['selectTags', tags] });
      req.scope.push('includeTags');
    }

    if (req.query.includeUser) {
      req.scope.push('includeUser');
    }

    // todo? volgens mij wordt dit niet meer gebruikt
    // if (req.query.highlighted) {
    //  	query = db.Idea.getHighlighted({ projectId: req.params.projectId })
    // }

    return next();

  });

router.route('/')

  // list ideas
  // ----------
  .get(auth.can('Idea', 'list'))
  .get(pagination.init)
  // add filters
  .get(function(req, res, next) {
    let { dbQuery } = req;

    dbQuery.where = {
      projectId: req.params.projectId,
      ...req.queryConditions,
      ...dbQuery.where,
    };

    if (dbQuery.hasOwnProperty('order')) {
      /**
       * Handle yes/no sorting
       */
      dbQuery.order = dbQuery.order.map(function(sortingQuery) {
        if (sortingQuery[0] === 'yes' || sortingQuery[0] === 'no') {
          return [Sequelize.literal(sortingQuery[0]), sortingQuery[1]];
        }

        return sortingQuery;
      });
    }

    db.Idea
      .scope(...req.scope)
      .findAndCountAll(dbQuery)
      .then(function(result) {
        result.rows.forEach((idea) => {
          idea.project = req.project;
          if (req.query.includePoll && idea.poll) idea.poll.countVotes(!req.query.withVotes);
        });
        const { rows } = result;
        req.results = rows;
        req.dbQuery.count = result.count;

        return next();
      })
      .catch(next);
  })
  .get(auth.useReqUser)
  .get(searchResults)
  .get(pagination.paginateResults)
  .get(function(req, res, next) {
    res.json(req.results);
  })

  // create idea
  // -----------
  .post(auth.can('Idea', 'create'))
  .post(publishConcept)
  .post(function(req, res, next) {
    if (!req.project) return next(createError(401, 'Project niet gevonden'));
    return next();
  })
  .post(function(req, res, next) {
    if (!(req.project.config && req.project.config.ideas && req.project.config.ideas.canAddNewIdeas)) return next(createError(401, 'Inzenden is gesloten'));
    return next();
  })
  .post(function(req, res, next) {

    try {
      req.body.location = req.body.location ? JSON.parse(req.body.location) : null;
    } catch (err) {
    }

    if (req.body.location && typeof req.body.location == 'object' && !Object.keys(req.body.location).length) {
      req.body.location = null;
    }

    let userId = req.user.id;
    if (req.user.role == 'admin' && req.body.userId) userId = req.body.userId;

    const data = {
      ...req.body,
      projectId: req.params.projectId,
      userId,
      startDate: new Date(),
    };

    let responseData;
    db.Idea
      .authorizeData(data, 'create', req.user, null, req.project)
      .create(data)
      .then(ideaInstance => {

        db.Idea
          .scope(...req.scope)
          .findByPk(ideaInstance.id)
          .then(result => {
            result.project = req.project;
            req.results = result;
            return next();
          });

      })
      .catch(function(error) {
        // todo: dit komt uit de oude routes; maak het generieker
        if (typeof error == 'object' && error instanceof Sequelize.ValidationError) {
          let errors = [];
          error.errors.forEach(function(error) {
            // notNull kent geen custom messages in deze versie van sequelize; zie https://github.com/sequelize/sequelize/issues/1500
            // TODO: we zitten op een nieuwe versie van seq; vermoedelijk kan dit nu wel
            errors.push(error.type === 'notNull Violation' && error.path === 'location' ? 'Kies een locatie op de kaart' : error.message);
          });
          //	res.status(422).json(errors);

          next(createError(422, errors.join(', ')));
        } else {
          next(error);
        }
      });

  })
  .post(async function(req, res, next) {

    // tags
    let tags = req.body.tags
    if (!tags) return next();

    const ideaInstance = req.results;
    const projectId = req.params.projectId;

    let tagIds = Array.from(await getOrCreateTagIds(projectId, tags, req.user));

    ideaInstance
      .setTags(tagIds)
      .then(tags => {
        // refetch. now with tags
        let scope = [...req.scope, 'includeTags'];
        if (req.canIncludeVoteCount) scope.push('includeVoteCount');
        return db.Idea
          .scope(...scope)
          .findOne({
            where: { id: ideaInstance.id, projectId: req.params.projectId },
          })
          .then(found => {
            if (!found) throw new Error('Idea not found');
            found.project = req.project;
            req.results = found;
            return next();
          })
          .catch(next);
      });
  })
  .post(function(req, res, next) {
    res.json(req.results);
    if (!req.query.nomail && req.body['publishDate']) {
      mail.sendThankYouMail(req.results, 'ideas', req.project, req.user); 
    } else if(!req.query.nomail && !req.body['publishDate']) {
      mail.sendConceptEmail(req.results, 'ideas', req.project, req.user);
    }
  });

// one idea
// --------
router.route('/:ideaId(\\d+)')
  .all(function(req, res, next) {
    var ideaId = parseInt(req.params.ideaId) || 1;

    let scope = [...req.scope];
    if (req.canIncludeVoteCount) scope.push('includeVoteCount');

    db.Idea
      .scope(...scope)
      .findOne({
        where: { id: ideaId, projectId: req.params.projectId },
      })
      .then(found => {
        if (!found) throw new Error('Idea not found');
        found.project = req.project;
        if (req.query.includePoll) { // TODO: naar poll hooks
          if (found.poll) found.poll.countVotes(!req.query.withVotes);
        }
        req.idea = found;
        req.results = req.idea;
        next();
      })
      .catch((err) => {
        console.log('err', err);
        next(err);
      });
  })

  // view idea
  // ---------
  .get(auth.can('Idea', 'view'))
  .get(auth.useReqUser)
  .get(function(req, res, next) {
    res.json(req.results);
  })

  // update idea
  // -----------
  .put(auth.useReqUser)
  .put(publishConcept)
  .put(function(req, res, next) {    
    if (!(req.project.config && req.project.config.ideas && req.project.config.ideas.canAddNewIdeas)) {
      if(!req.results.dataValues.publishDate) {
          return next(createError(401, 'Aanpassen en inzenden van concept plannen is gesloten'));
      }
    }
    return next();
  })
  .put(function(req, res, next) {
    req.tags = req.body.tags;
    next();
  })
  .put(function(req, res, next) {
    const currentIdea = req.results.dataValues;
    const wasConcept = currentIdea && !currentIdea.publishDate;
    const willNowBePublished = req.body['publishDate'];   
    req.changedToPublished = wasConcept && willNowBePublished;
    next();
  })
  .put(function(req, res, next) {
    var idea = req.results;

    if (!(idea && idea.can && idea.can('update'))) return next(new Error('You cannot update this Idea'));

    if (req.body.location) {
      try {
        req.body.location = JSON.parse(req.body.location || null);
      } catch (err) {
      }

      if (req.body.location && typeof req.body.location === 'object' && !Object.keys(req.body.location).length) {
        req.body.location = undefined;
      }
    } else {
      if (req.body.location === null) {
        req.body.location = JSON.parse(null);
      }
    }

    let data = {
      ...req.body,
    };

    if (userhasModeratorRights(req.user)) {
      if (data.modBreak) {
        data.modBreakUserId = req.body.modBreakUserId = req.user.id;
        data.modBreakDate = req.body.modBreakDate = new Date().toString();
      }
    }

    idea
      .authorizeData(data, 'update')
      .update(data)
      .then(result => {
        result.project = req.project;
        req.results = result;
        next();
      })
      .catch(next);
  })
  .put(async function(req, res, next) {

    // tags
    let tags = req.body.tags
    if (!tags) return next();

    const ideaInstance = req.results;
    const projectId = req.params.projectId;

    let tagIds = Array.from(await getOrCreateTagIds(projectId, tags, req.user));

    ideaInstance
      .setTags(tagIds)
      .then(result => {
        // refetch. now with tags
        let scope = [...req.scope, 'includeTags'];
        if (req.canIncludeVoteCount) scope.push('includeVoteCount');
        return db.Idea
          .scope(...scope)
          .findOne({
            where: { id: ideaInstance.id, projectId: req.params.projectId },
          })
          .then(found => {
            if (!found) throw new Error('Idea not found');

            if (req.query.includePoll) { // TODO: naar poll hooks
              if (found.poll) found.poll.countVotes(!req.query.withVotes);
            }
            found.project = req.project;
            req.results = found;
            next();
          })
          .catch(next);
      });
  })
  .put(function(req, res, next) {
    if(req.changedToPublished) {
      mail.sendConceptEmail(req.results, 'ideas', req.project, req.user);
    }
    next();
  })
  .put(function(req, res, next) {
    res.json(req.results);
  })

  // delete idea
  // ---------
  .delete(auth.useReqUser)
  .delete(function(req, res, next) {
    const idea = req.results;
    if (!(idea && idea.can && idea.can('delete'))) return next(new Error('You cannot delete this idea'));

    idea
      .destroy()
      .then(() => {
        res.json({ 'idea': 'deleted' });
      })
      .catch(next);
  });

// when adding or updating ideas parse the tags
async function getOrCreateTagIds(projectId, tags, user) {

  let result = [];
  let tagsOfProject = await db.Tag.findAll({where: { projectId }});

  for (let i = 0; i < tags.length; i++) {

    let tag = tags[i];
    
    // tags may be sent as [id1, id2] or [name1, name2] or [ { id: id1, name: name1 }, { id: id2, name: name2 } ]
    let tagId, tagName;
    if (typeof tag === 'object') {
      tagId = tag.id
      tagName = tag.name;
    } else if (tag == parseInt(tag)) {
      tagId = tag;
    } else {
      tagName = tag;
    }

    // find in project tags by id or name
    let found = tagsOfProject.find( tag => tag.id == tagId );
    if (!found) found = tagsOfProject.find( tag => tag.name == tagName );
    if (found) {
      result.push(found);
    } else {
      
      // or try to find this tag in another project
      if (tagId) {
        let tagOnOtherProject = await db.Tag.findOne({where: { id: tagId }});
        if (tagOnOtherProject) tagName = tagOnOtherProject.name; // use name to create a new tag
      }

      // create a new tag
      if (tagName && userhasModeratorRights(user)) { // else ignore
        let newTag = await db.Tag.create({
          projectId, 
          name: tagName, 
          extraData: {}
        });
        result.push(newTag);
      }

    }
    
  };

  return result;

}

module.exports = router;
