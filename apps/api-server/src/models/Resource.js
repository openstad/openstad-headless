const Sequelize = require('sequelize');
const { Op } = require("sequelize");

const co = require('co')
, config = require('config')
, moment = require('moment-timezone')
, pick = require('lodash/pick');

const sanitize = require('../util/sanitize');
const notifications = require('../notifications');

const merge = require('merge');

const commentVoteThreshold = config.resources && config.resources.commentVoteThreshold;
const userHasRole = require('../lib/sequelize-authorization/lib/hasRole');
const roles = require('../lib/sequelize-authorization/lib/roles');
const getExtraDataConfig = require('../lib/sequelize-authorization/lib/getExtraDataConfig');
const htmlToText = require('html-to-text');

function hideEmailsForNormalUsers(comments) {
  return comments.map((comment) => {
    delete comment.user.email;

    if (comment.replies) {
      comment.replies = comment.replies.map((reply) => {
        delete reply.user.email;

        return reply;
      })
    }

    return comment;
  });
}

module.exports = function (db, sequelize, DataTypes) {

  var Resource = sequelize.define('resource', {

    projectId: {
      type: DataTypes.INTEGER,
      auth:  {
        updateableBy: 'editor',
      },
      defaultValue: config.projectId && typeof config.projectId == 'number' ? config.projectId : 0,
    },

    userId: {
      type: DataTypes.INTEGER,
      auth:  {
        updateableBy: 'moderator',
      },
      allowNull: false,
      defaultValue: 0,
    },

    startDate: {
      auth:  {
        updateableBy: 'moderator',
      },
      type: DataTypes.DATE,
      allowNull: false
    },

    startDateHumanized: {
      type: DataTypes.VIRTUAL,
      get: function () {
        var date = this.getDataValue('startDate');
        try {
          if (!date)
            return 'Onbekende datum';
          return moment(date).format('LLL');
        } catch (error) {
          return (error.message || 'dateFilter error').toString()
        }
      }
    },

    sort: {
      type: DataTypes.INTEGER,
      auth:  {
        updateableBy: 'editor',
      },
      allowNull: false,
      defaultValue: 1
    },

    typeId: {
      type: DataTypes.STRING(255),
      allowNull: true,
      auth:  {
        updateableBy: 'moderator',
        authorizeData: function(data, action, user, self, project) {
          if (!self) return;
          project = project || self.project;
          if (!project) return; // todo: die kun je ophalen als eea. async is
          let value = data || self.typeId;
          let config = project.config.resources.types;
          if (!config || !Array.isArray(config) || !config[0] || !config[0].id) return null; // no config; this field is not used
          let defaultValue = config[0].id;

          let valueConfig = config.find( type => type.id == value );
          if (!valueConfig) return self.typeId || defaultValue; // non-existing value; fallback to the current value
          let requiredRole = self.rawAttributes.typeId.auth[action+'ableBy'] || 'all';
          if (!valueConfig.auth) return userHasRole(user, requiredRole) ? value : ( self.typeId || defaultValue ); // no auth defined for this value; use field.auth
          requiredRole = valueConfig.auth[action+'ableBy'] || requiredRole;
          if ( userHasRole(user, requiredRole) ) return value; // user has requiredRole; value accepted
          return self.typeId || defaultValue;
        },
      },
    },

    status: {
      type: DataTypes.ENUM('OPEN', 'CLOSED', 'ACCEPTED', 'DENIED', 'BUSY', 'DONE'),
      auth:  {
        updateableBy: 'moderator',
      },
      defaultValue: 'OPEN',
      allowNull: false
    },

    viewableByRole: {
      type: DataTypes.ENUM('admin', 'editor', 'moderator', 'member', 'anonymous', 'all'),
      defaultValue: 'all',
      auth:  {
        updateableBy: ['editor', 'owner'],
      },
      allowNull: true,
    },

    title: {
      type: DataTypes.STRING(255),
      allowNull: false,
      validate: {
        textLength(value) {
          let len = sanitize.title(value.trim()).length;
          let titleMinLength = (this.config && this.config.resources && this.config.resources.titleMinLength || 10)
          let titleMaxLength = (this.config && this.config.resources && this.config.resources.titleMaxLength || 50)
          if (len < titleMinLength || len > titleMaxLength)
            throw new Error(`Titel moet tussen ${titleMinLength} en ${titleMaxLength} tekens zijn`);
        }
      },
      set: function (text) {
        this.setDataValue('title', sanitize.title(text.trim()));
      }
    },

    summary: {
      type: DataTypes.TEXT,
      allowNull: !this.publishDate,
      validate: {
        textLength(value) {
          // We need to undo the sanitization before we can check the length
          let len = htmlToText.fromString(value).length
          let summaryMinLength = (this.config && this.config.resources && this.config.resources.summaryMinLength || 20)
          let summaryMaxLength = (this.config && this.config.resources && this.config.resources.summaryMaxLength || 140)
          if (this.publishDate && (len < summaryMinLength || len > summaryMaxLength))
            throw new Error(`Samenvatting moet tussen ${summaryMinLength} en ${summaryMaxLength} tekens zijn`);
        }
      },
      set: function (text) {
        this.setDataValue('summary', sanitize.summary(text.trim()));
      }
    },

    description: {
      type: DataTypes.TEXT,
      allowNull: !this.publishDate,
      validate: {
        textLength(value) {
          let len = sanitize.summary(value.trim()).length;
          let descriptionMinLength = (this.config && this.config.resources && this.config.resources.descriptionMinLength || 140)
          let descriptionMaxLength = (this.config && this.config.resources && this.config.resources.descriptionMaxLength || 5000)
          if (this.publishDate && (len < descriptionMinLength || len > descriptionMaxLength)) {
            throw new Error(`Beschrijving moet tussen ${descriptionMinLength} en ${descriptionMaxLength} tekens zijn`);
          }
        }
      },
      set: function (text) {
        this.setDataValue('description', sanitize.content(text.trim()));
      }
    },

    images: {
      type: DataTypes.JSON,
      allowNull: null,
      defaultValue: [],
    },
    
    budget: {
      type: DataTypes.INTEGER,
      auth:  {
        updateableBy: 'moderator',
      },
      allowNull: true,
      set: function (budget) {
        budget = budget ? budget : null
        this.setDataValue('budget', parseInt(budget, 10) || null);
      }
    },

    extraData: getExtraDataConfig(DataTypes.JSON,  'resources'),

    location: {
      type: DataTypes.JSON,
      allowNull: !(config.resources && config.resources.location && config.resources.location.isMandatory),
    },

    modBreak: {
      type: DataTypes.TEXT,
      auth:  {
        createableBy: 'moderator',
        updateableBy: 'moderator',
      },
      allowNull: true,
      set: function (text) {
        text = text ? sanitize.content(text.trim()) : null;
        this.setDataValue('modBreak', text);
      }
    },

    modBreakUserId: {
      type: DataTypes.INTEGER,
      auth:  {
        createableBy: 'moderator',
        updateableBy: 'moderator',
      },
      allowNull: true
    },

    modBreakDate: {
      type: DataTypes.DATE,
      auth:  {
        createableBy: 'moderator',
        updateableBy: 'moderator',
      },
      allowNull: true
    },

    modBreakDateHumanized: {
      type: DataTypes.VIRTUAL,
      get: function () {
        var date = this.getDataValue('modBreakDate');
        try {
          if (!date)
            return undefined;
          return moment(date).format('LLL');
        } catch (error) {
          return (error.message || 'dateFilter error').toString()
        }
      }
    },

    progress: {
      type: DataTypes.VIRTUAL,
      get: function () {
        var minimumYesVotes = (this.project && this.project.config && this.project.config.resources && this.project.config.resources.minimumYesVotes) || config.get('resources.minimumYesVotes');
        var yes = this.getDataValue('yes');
        return yes !== undefined ?
          Number((Math.min(1, (yes / minimumYesVotes)) * 100).toFixed(2)) :
          undefined;
      }
    },

    createDateHumanized: {
      type: DataTypes.VIRTUAL,
      get: function () {
        var date = this.getDataValue('createdAt');
        try {
          if (!date)
            return 'Onbekende datum';
          return moment(date).format('LLL');
        } catch (error) {
          return (error.message || 'dateFilter error').toString()
        }
      }
    },
    publishDate: {
      type: DataTypes.DATE,
      allowNull: true
    },
    publishDateHumanized: {
      type: DataTypes.VIRTUAL,
      get: function () {
        const date = this.getDataValue('publishDate');
        try {
          if (!date)
            return 'Onbekende datum';
          return moment(date).format('LLL');
        } catch (error) {
          return (error.message || 'dateFilter error').toString()
        }
      }
    },
  }, {

    hooks: {

      // onderstaand is een workaround: bij een delete wordt wel de validatehook aangeroepen, maar niet de beforeValidate hook. Dat lijkt een bug.
      beforeValidate: beforeValidateHook,
      beforeDestroy: beforeValidateHook,

      afterCreate: function (instance, options) {
        notifications.addToQueue({
          type: 'resource',
          action: 'create',
          projectId: instance.projectId,
          instanceId: instance.id
        });
      },

      afterUpdate: function (instance, options) {
        notifications.addToQueue({
          type: 'resource',
          action: 'update',
          projectId: instance.projectId,
          instanceId: instance.id
        });
      },

    },

    individualHooks: true,

    validate: {
      validModBreak: function () {
        return true;
        /*
        skip validation for now, should be moved to own rest object.

        if (this.modBreak && (!this.modBreakUserId || !this.modBreakDate)) {
          throw Error('Incomplete mod break');
        }*/
      },
      validExtraData: function (next) {

        let self = this;
        let errors = [];
        let value = self.extraData || {}
        let validated = {};

        let configExtraData = self.config && self.config.resources && self.config.resources.extraData;

        function checkValue(value, config) {

          if (config) {

            let key;
            Object.keys(config).forEach((key) => {

              let error = false;

              // recursion on sub objects
              if (typeof value[key] == 'object' && config[key].type == 'object') {
                if (config[key].subset) {
                  checkValue(value[key], config[key].subset);
                } else {
                  errors.push(`Configuration for ${key} is incomplete`);
                }
              }

              // allowNull
              if (config[key].allowNull === false && (typeof value[key] === 'undefined' || value[key] === '')) {
                error = `${key} is niet ingevuld`;
              }

              // checks op type
              if (value[key]) {
                switch (config[key].type) {

                  case 'boolean':
                    if (typeof value[key] != 'boolean') {
                      error = `De waarde van ${key} is geen boolean`;
                    }
                    break;

                  case 'int':
                    if (parseInt(value[key]) !== value[key]) {
                      error = `De waarde van ${key} is geen int`;
                    }
                    break;

                  case 'string':
                    if (typeof value[key] != 'string') {
                      error = `De waarde van ${key} is geen string`;
                    }
                    break;

                  case 'object':
                    if (typeof value[key] != 'object') {
                      error = `De waarde van ${key} is geen object`;
                    }
                    break;

                  case 'arrayOfStrings':
                    if (typeof value[key] !== 'object' || !Array.isArray(value[key]) || value[key].find(val => typeof val !== 'string')) {
                      error = `Ongeldige waarde voor ${key}`;
                    }
                    break;

                  case 'enum':
                    if (config[key].values.indexOf(value[key]) == -1) {
                      error = `Ongeldige waarde voor ${key}`;
                    }
                    break;

                  default:
                }
              }

              if (error) {
                validated[key] = false;
                errors.push(error)
              } else {
                validated[key] = true;
              }

            });

            Object.keys(value).forEach((key) => {
              if (typeof validated[key] == 'undefined') {
                if (!( self.config && self.config.resources && self.config.resources.extraDataMustBeDefined === false )) {
                  errors.push(`${key} is niet gedefinieerd in project.config`)
                }
              }
            });

          } else {
            // extra data not defined in the config
            if (!(self.config && self.config.resources && self.config.resources.extraDataMustBeDefined === false)) {
              errors.push(`resource.extraData is not configured in project.config`)
            }
          }
        }

        checkValue(value, configExtraData);

        if (errors.length) {
          console.log('Resource validation error:', errors);
          throw Error(errors.join('\n'));
        }

        return next();

      }
    },

  });

  Resource.scopes = function scopes() {

    function voteCount(opinion) {
      if (config.votes && config.votes.confirmationRequired) {
        return [sequelize.literal(`
				(SELECT
					COUNT(*)
				FROM
					votes v
				WHERE
          v.confirmed = 1 AND
					v.deletedAt IS NULL AND (
						v.checked IS NULL OR
						v.checked  = 1
					) AND
					v.resourceId     = resource.id AND
					v.opinion    = "${opinion}")
			`), opinion];
      } else {
        return [sequelize.literal(`
				(SELECT
					COUNT(*)
				FROM
					votes v
				WHERE
					v.deletedAt IS NULL AND (
						v.checked IS NULL OR
						v.checked  = 1
					) AND
					v.resourceId     = resource.id AND
					v.opinion    = "${opinion}")
			`), opinion];
      }
    }

    function commentCount(fieldName) {
      return [sequelize.literal(`
				(SELECT
					COUNT(*)
				FROM
					comments a
				WHERE
					a.deletedAt IS NULL AND
					a.resourceId = resource.id)
			`), fieldName];
    }

    return {

      // nieuwe scopes voor de api
      // -------------------------
      onlyVisible: function (userId, userRole) {
        if (userId) {

          if(userRole === 'admin' || userRole === 'moderator' || userRole === 'editor') {
            return {};
          }

          return {
            where: {
              [Op.or]: [
                {
                  [Op.or]: [
                    {userId},
                    {viewableByRole: 'all'},
                    {viewableByRole: null},
                    {viewableByRole: roles[userRole] || ''}
                  ],
                  publishDate: {[Op.ne]: null}
                },
                {
                  userId,
                  publishDate: null
                }
              ]
            }
          };
        } else {
          return {
            where: {
              [Op.or]: [{viewableByRole: 'all'}, {viewableByRole: null}, {viewableByRole: roles[userRole] || ''}],
              [Op.not]: [{publishDate: null}],
            }
          };
        }
      },

      // defaults
      default: {
      },

      api: {},

      includeComments: function (userId) {
        return {
          include: [{
            model: db.Comment.scope(
              'defaultScope',
              {method: ['includeVoteCount', 'commentsAgainst']},
              {method: ['includeUserVote', 'commentsAgainst', userId]},
              'includeRepliesOnComments'
            ),
            as: 'commentsAgainst',
            required: false,
            where: {
              sentiment: 'against',
              parentId: null
            }
          }, {
            model: db.Comment.scope(
              'defaultScope',
              {method: ['includeVoteCount', 'commentsFor']},
              {method: ['includeUserVote', 'commentsFor', userId]},
              'includeRepliesOnComments'
            ),
            as: 'commentsFor',
            required: false,
            where: {
              sentiment: 'for',
              parentId: null
            }
          }],
          // HACK: Inelegant?
          order: [
            sequelize.literal(`GREATEST(0, \`commentsAgainst.yes\` - ${commentVoteThreshold}) DESC`),
            sequelize.literal(`GREATEST(0, \`commentsFor.yes\` - ${commentVoteThreshold}) DESC`),
            sequelize.literal('commentsAgainst.parentId'),
            sequelize.literal('commentsFor.parentId'),
            sequelize.literal('commentsAgainst.createdAt'),
            sequelize.literal('commentsFor.createdAt')
          ]
        };
      },

      includeTags: {
        include: [{
          model: db.Tag,
          attributes: ['id', 'type', 'name'],
          through: {attributes: []},
        }]
      },

      includeStatus: {
        include: [{
          model: db.Tag,
          attributes: ['id', 'type', 'name'],
          through: {attributes: []},
          where: {type: 'status'},
          required: false,
        }]
      },

      selectTags: function (tags) {
        return {
          include: [{
            model: db.Tag,
            attributes: ['id', 'name'],
            through: {attributes: []},
            where: {
              id: tags
            }
          }],
        }
      },

      includeRanking: {
        // 				}).then((resources) => {
        // 					// add ranking
        // 					let ranked = resources.slice();
        // 					ranked.forEach(resource => {
        // 						resource.ranking = resource.status == 'DENIED' ? -10000 : resource.yes - resource.no;
        // 					});
        // 					ranked.sort( (a, b) => a.ranking < b.ranking );
        // 					let rank = 1;
        // 					ranked.forEach(resource => {
        // 						resource.ranking = rank;
        // 						rank++;
        // 					});
        // 					return sort == 'ranking' ? ranked : resources;
        // 				});
      },

      includeProject: {
        include: [{
          model: db.Project,
        }]
      },

      includeVoteCount: function(votesConfig) {
        return {
          attributes: {
            include: votesConfig ? votesConfig.voteValues.map( voteValue => voteCount(voteValue.value) ) : []
          }
        }
      },

      includeCommentsCount: {
        attributes: {
          include: [
            commentCount('commentCount')
          ]
        }
      },

      includeUser: {
        include: [{
          model: db.User,
          attributes: ['id','role', 'displayName', 'nickName', 'name', 'email', 'extraData']
        }]
      },

      includeUserVote: function (userId) {
        //this.hasOne(db.Vote, {as: 'userVote' });
        let result = {
          include: [{
            model: db.Vote,
            as: 'userVote',
            required: false,
            where: {
              userId: userId
            }
          }]
        };
        return result;
      },

      includePoll:  function (userId) {
        return {
          include: [{
            model: db.Poll.scope([ 'defaultScope', 'withResource', { method: ['withVotes', 'poll', userId]}, { method: ['withUserVote', 'poll', userId]} ]),
          as: 'poll',
          required: false,
        }]
        }
      },

      sort: function (sort) {

        let result = {};

        var order;
        switch (sort) {
          case 'votes_desc':
            // TODO: zou dat niet op diff moeten, of eigenlijk configureerbaar
            order = sequelize.literal('yes DESC');
            break;
          case 'votes_asc':
            // TODO: zou dat niet op diff moeten, of eigenlijk configureerbaar
            order = sequelize.literal('yes ASC');
            break;
          case 'random':
            // TODO: zou dat niet op diff moeten, of eigenlijk configureerbaar
            order = sequelize.random();
            break;
          case 'createdate_asc':
            order = [['createdAt', 'ASC']];
            break;
          case 'createdate_desc':
            order = [['createdAt', 'DESC']];
            break;
          case 'budget_asc':
            order = [['createdAt', 'ASC']];
            break;
          case 'budget_desc':
            order = [['createdAt', 'DESC']];
            break;
          case 'date_asc':
            order = [['startDate', 'ASC']];
          case 'date_desc':
          default:
            order = [['startDate', 'DESC']];

        }

        result.order = order;

        return result;

      },

      // oude scopes
      // -----------


      summary: {
        attributes: {
          include: [
            voteCount('yes'),
            voteCount('no'),
            commentCount('commentCount')
          ],
          exclude: ['modBreak']
        }
      },
      withUser: {
        include: [{
          model: db.User,
          attributes: ['role', 'displayName', 'nickName', 'name', 'email']
        }]
      },
      withVoteCount: {
        attributes: Object.keys(this.rawAttributes).concat([
          voteCount('yes'),
          voteCount('no')
        ])
      },
      withVotes: {
        include: [{
          model: db.Vote,
          include: [{
            model: db.User,
            attributes: ['id', 'zipCode', 'email']
          }]
        }],
        order: 'createdAt'
      },
      withComments: function (userId) {
        return {
          include: [{
            model: db.Comment.scope(
              'defaultScope',
              {method: ['includeVoteCount', 'commentsAgainst']},
              {method: ['includeUserVote', 'commentsAgainst', userId]},
              'includeRepliesOnComments'
            ),
            as: 'commentsAgainst',
            required: false,
            where: {
              sentiment: 'against',
              parentId: null,
            }
          }, {
            model: db.Comment.scope(
              'defaultScope',
              {method: ['includeVoteCount', 'commentsFor']},
              {method: ['includeUserVote', 'commentsFor', userId]},
              'includeRepliesOnComments'
            ),
            as: 'commentsFor',
            required: false,
            where: {
              sentiment: 'for',
              parentId: null,
            }
          }],
          // HACK: Inelegant?
          order: [
            sequelize.literal(`GREATEST(0, \`commentsAgainst.yes\` - ${commentVoteThreshold}) DESC`),
            sequelize.literal(`GREATEST(0, \`commentsFor.yes\` - ${commentVoteThreshold}) DESC`),
            'commentsAgainst.parentId',
            'commentsFor.parentId',
            'commentsAgainst.createdAt',
            'commentsFor.createdAt'
          ]
        };
      },
      withAgenda: {
        include: [{
          model: db.AgendaItem,
          as: 'agenda',
          required: false,
          separate: true,
          order: [
            ['startDate', 'ASC']
          ]
        }]
      }
    }
  }

  Resource.associate = function (models) {
    this.belongsTo(models.User, { onDelete: 'CASCADE' });
    this.belongsTo(models.Project, { onDelete: 'CASCADE' });
    this.hasMany(models.Vote, { onDelete: 'CASCADE' });
    this.hasMany(models.Comment, {as: 'commentsAgainst', onDelete: 'CASCADE' });
    this.hasMany(models.Comment, {as: 'commentsFor', onDelete: 'CASCADE'});
    this.hasOne(models.Poll, {as: 'poll', foreignKey: 'resourceId', onDelete: 'CASCADE' });
    this.hasOne(models.Vote, {as: 'userVote', foreignKey: 'resourceId', onDelete: 'CASCADE' });
    this.belongsToMany(models.Tag, {through: 'resource_tags', constraints: false, onDelete: 'CASCADE' });
  }

  Resource.prototype.getUserVote = function (user) {
    return db.Vote.findOne({
      attributes: ['opinion'],
      where: {
        resourceId: this.id,
        userId: user.id
      }
    });
  }

  // standaard stemvan
  Resource.prototype.addUserVote = function (user, opinion, ip, extended) {

    var data = {
      resourceId: this.id,
      userId: user.id,
      opinion: opinion,
      ip: ip
    };

    var found;

    return db.Vote.findOne({where: data})
      .then(function (vote) {
        if (vote) {
          found = true;
        }
        if (vote && vote.opinion === opinion) {
          return vote.destroy();
        } else {
          // HACK: `upsert` on paranoid deleted row doesn't unset
          //        `deletedAt`.
          // TODO: Pull request?
          data.deletedAt = null;
          data.opinion = opinion;
          return db.Vote.upsert(data);
        }
      })
      .then(function (result) {
        if (extended) {
          // nieuwe versie, gebruikt door de api server
          if (found) {
            if (result && !!result.deletedAt) {
              return 'cancelled';
            } else {
              return 'replaced';
            }
          } else {
            return 'new';
          }
        } else {
          // oude versie
          // When the user double-voted with the same opinion, the vote
          // is removed: return `true`. Otherwise return `false`.
          //
          // `vote.destroy` returns model when `paranoid` is `true`.
          return result && !!result.deletedAt;
        }
      });
  }

  // stemtool stijl, voor eberhard3 - TODO: werkt nu alleen voor maxChoices = 1;
  Resource.prototype.setUserVote = function (user, opinion, ip) {
    let self = this;
    if (config.votes && config.votes.maxChoices) {

      return db.Vote.findAll({where: {userId: user.id}})
        .then(vote => {
          if (vote) {
            if (config.votes.switchOrError == 'error') throw new Error('Je hebt al gestemd'); // waarmee de default dus switch is
            return vote
              .update({ip, confirmResourceId: self.id})
              .then(vote => true)
          } else {
            return db.Vote.create({
              resourceId: self.id,
              userId: user.id,
              opinion: opinion,
              ip: ip
            })
              .then(vote => {
                return false
              })
          }
        })
        .catch(err => {
          throw err
        })

    } else {
      throw new Error('Resource.setUserVote: missing params');
    }

  }

  Resource.prototype.setModBreak = function (user, modBreak) {
    return this.update({
      modBreak: modBreak,
      modBreakUserId: user.id,
      modBreakDate: new Date()
    });
  }

  Resource.prototype.setStatus = function (status) {
    return this.update({status: status});
  }

  let canMutate = function(user, self) {
    if (userHasRole(user, 'editor', self.userId) || userHasRole(user, 'admin', self.userId) || userHasRole(user, 'moderator', self.userId)) {
      return true;
    }

    let status = self.tags.find( type => 'status' ); // was: status == 'OPEN' - is this what we want?
    if (typeof status?.extraFunctionality?.editableByUser != 'boolean' || status.extraFunctionality.editableByUser) {
      return true;
    }

    if (userHasRole(user, 'owner', self.userId)) {
      return true;
    }

    // canEditAfterFirstLikeOrComment is handled in the validate hook

  }

	Resource.auth = Resource.prototype.auth = {
    listableBy: 'all',
    viewableBy: 'all',
    createableBy: 'member',
    updateableBy: ['admin','editor','owner', 'moderator'],
    deleteableBy: ['admin','editor','owner', 'moderator'],
    canView: function(user, self) {
      if (self && self.viewableByRole && self.viewableByRole != 'all' ) {
        return userHasRole(user, [ self.viewableByRole, 'owner' ], self.userId)
      } else {
        return true
      }
    },
    canVote: function(user, self) {
      // TODO: dit wordt niet gebruikt omdat de logica helemaal in de route zit. Maar hier zou dus netter zijn.
      return false
    },
    canUpdate: canMutate,
    canDelete: canMutate,
    canAddPoll: canMutate,
    canComment: function canComment(self) {
      if (!self) return false;
      // project config: comments is closed
      if (typeof self?.project?.config?.comments?.isClosed != 'boolean' || self.project.config.comments.isClosed) return false;
      // published
      if (!self.publishDate) return false;
      // status
      let status = self.tags.find( type => 'status' );
      if (typeof status?.extraFunctionality?.noComment == 'boolean' && status.extraFunctionality.noComment) return false;
      return true;
    },
    toAuthorizedJSON: function(user, data, self) {

      if (!self.auth.canView(user, self)) {
        return {};
      }

	   /* if (resource.project.config.archivedVotes) {
		    if (req.query.includeVoteCount && req.project && req.project.config && req.project.config.votes && req.project.config.votes.isViewable) {
			      result.yes = result.extraData.archivedYes;
			      result.no = result.extraData.archivedNo;
		     }
	    }*/

      delete data.project;
      delete data.config;
      // dit zou nu dus gedefinieerd moeten worden op project.config, maar wegens backward compatible voor nu nog even hier:
      //

      // wordt dit nog gebruikt en zo ja mag het er uit
      if (!data.user) data.user = {};

    //  data.user.isAdmin = !!userHasRole(user, 'editor');

      // er is ook al een createDateHumanized veld; waarom is dit er dan ook nog?
	    data.createdAtText = moment(data.createdAt).format('LLL');

      // if user is not allowed to edit resource then remove phone key, otherwise publically available
      // needs to move to definition per key
      if (!canMutate(user, self) && data.extraData && data.extraData.phone) {
		    delete data.extraData.phone;
	    }

      if (data.commentsAgainst) {
        data.commentsAgainst = hideEmailsForNormalUsers(data.commentsAgainst);
      }

      if (data.commentsFor) {
        data.commentsFor = hideEmailsForNormalUsers(data.commentsFor);
      }

      data.can = {};

      // if ( self.can('vote', user) ) data.can.vote = true;
      if ( self.can('update', user) ) data.can.edit = true;
      if ( self.can('delete', user) ) data.can.delete = true;

      return data;
    },
  }

  return Resource;

  async function beforeValidateHook(instance, options) {

    // add project config
    let projectConfig = config;
    if (instance.projectId) {
      let project = await db.Project.findByPk(instance.projectId);
      projectConfig = merge.recursive(true, config, project.config);
    }
    instance.config = projectConfig;

    // count comments and votes
    let canEditAfterFirstLikeOrComment = projectConfig && projectConfig.canEditAfterFirstLikeOrComment || false
    if (!canEditAfterFirstLikeOrComment && !userHasRole(instance.auth && instance.auth.user, 'moderator')) {
      let firstLikeSubmitted = await db.Vote.count({ where: { resourceId: instance.id }});
      let firstCommentSubmitted  = await db.Comment.count({ where: { resourceId: instance.id }});
      if (firstLikeSubmitted || firstCommentSubmitted) {
        throw Error('You cannot edit an resource after the first like or comment has been added')
      }
    }

  }

};
