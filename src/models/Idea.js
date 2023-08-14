const Sequelize = require('sequelize');
const { Op } = require("sequelize");

const getSequelizeConditionsForFilters = require('./../util/getSequelizeConditionsForFilters');
const co = require('co')
, config = require('config')
, moment = require('moment-timezone')
, pick = require('lodash/pick');

const sanitize = require('../util/sanitize');
const notifications = require('../notifications');

const merge = require('merge');

const argVoteThreshold = config.ideas && config.ideas.argumentVoteThreshold;
const userHasRole = require('../lib/sequelize-authorization/lib/hasRole');
const roles = require('../lib/sequelize-authorization/lib/roles');
const getExtraDataConfig = require('../lib/sequelize-authorization/lib/getExtraDataConfig');
const htmlToText = require('html-to-text');

function hideEmailsForNormalUsers(args) {
  return args.map((argument) => {
    delete argument.user.email;

    if (argument.reactions) {
      argument.reactions = argument.reactions.map((reaction) => {
        delete reaction.user.email;

        return reaction;
      })
    }

    return argument;
  });
}

module.exports = function (db, sequelize, DataTypes) {
  var Idea = sequelize.define('idea', {
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

    endDate: {
      type: DataTypes.VIRTUAL(DataTypes.DATE, ['startDate']),
      get: function () {
        var _config = merge.recursive(true, config, this.project.config);
        var duration =
          (_config &&
            _config.ideas &&
            _config.ideas.duration) ||
          90;
        if (
          this.project &&
          this.project.config &&
          this.project.config.ideas &&
          this.project.config.ideas.automaticallyUpdateStatus &&
          this.project.config.ideas.automaticallyUpdateStatus.isActive
        ) {
          duration =
            this.project.config.ideas.automaticallyUpdateStatus.afterXDays || 0;
        }
        var endDate = moment(this.getDataValue('startDate'))
          .add(duration, 'days')
          .toDate();

        return endDate
      },
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
          let config = project.config.ideas.types;
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
          let titleMinLength = (this.config && this.config.ideas && this.config.ideas.titleMinLength || 10)
          let titleMaxLength = (this.config && this.config.ideas && this.config.ideas.titleMaxLength || 50)
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
          let summaryMinLength = (this.config && this.config.ideas && this.config.ideas.summaryMinLength || 20)
          let summaryMaxLength = (this.config && this.config.ideas && this.config.ideas.summaryMaxLength || 140)
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
          let descriptionMinLength = (this.config && this.config.ideas && this.config.ideas.descriptionMinLength || 140)
          let descriptionMaxLength = (this.config && this.config.ideas && this.config.ideas.descriptionMaxLength || 5000)
          if (this.publishDate && (len < descriptionMinLength || len > descriptionMaxLength)) {
            throw new Error(`Beschrijving moet tussen ${descriptionMinLength} en ${descriptionMaxLength} tekens zijn`);
          }
        }
      },
      set: function (text) {
        this.setDataValue('description', sanitize.content(text.trim()));
      }
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

    extraData: getExtraDataConfig(DataTypes.JSON,  'ideas'),

    location: {
      type: DataTypes.GEOMETRY('POINT'),
      allowNull: !(config.ideas && config.ideas.location && config.ideas.location.isMandatory),
      set: function (location) {
        location = location ? location : null
        this.setDataValue('location', location);
      }
    },

    position: {
      type: DataTypes.VIRTUAL,
      get: function () {
        var location = this.get('location');
        var position;
        if (location && location.type && location.type == 'Point') {
          position = {
            lat: location.coordinates[0],
            lng: location.coordinates[1],
          };
        }
        return position
      }
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

    // Counts set in `summary`/`withVoteCount` scope.
    no: {
      type: DataTypes.VIRTUAL
    },

    yes: {
      type: DataTypes.VIRTUAL
    },

    progress: {
      type: DataTypes.VIRTUAL,
      get: function () {
        var minimumYesVotes = (this.project && this.project.config && this.project.config.ideas && this.project.config.ideas.minimumYesVotes) || config.get('ideas.minimumYesVotes');
        var yes = this.getDataValue('yes');
        return yes !== undefined ?
          Number((Math.min(1, (yes / minimumYesVotes)) * 100).toFixed(2)) :
          undefined;
      }
    },

    argCount: {
      type: DataTypes.VIRTUAL
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
          type: 'idea',
          action: 'create',
          projectId: instance.projectId,
          instanceId: instance.id
        });
      },

      afterUpdate: function (instance, options) {
        notifications.addToQueue({
          type: 'idea',
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

        let configExtraData = self.config && self.config.ideas && self.config.ideas.extraData;

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
                if (!( self.config && self.config.ideas && self.config.ideas.extraDataMustBeDefined === false )) {
                  errors.push(`${key} is niet gedefinieerd in project.config`)
                }
              }
            });

          } else {
            // extra data not defined in the config
            if (!(self.config && self.config.ideas && self.config.ideas.extraDataMustBeDefined === false)) {
              errors.push(`idea.extraData is not configured in project.config`)
            }
          }
        }

        checkValue(value, configExtraData);

        if (errors.length) {
          console.log('Idea validation error:', errors);
          throw Error(errors.join('\n'));
        }

        return next();

      }
    },

  });

  Idea.scopes = function scopes() {
    // Helper function used in `withVoteCount` scope.
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
					v.ideaId     = idea.id AND
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
					v.ideaId     = idea.id AND
					v.opinion    = "${opinion}")
			`), opinion];
      }
    }

    function argCount(fieldName) {
      return [sequelize.literal(`
				(SELECT
					COUNT(*)
				FROM
					arguments a
				WHERE
					a.deletedAt IS NULL AND
					a.ideaId = idea.id)
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

      mapMarkers: {
        attributes: [
          'id',
          'status',
          'location',
          'position'
        ]
        ,
        where: sequelize.or(
          {
            status: ['OPEN', 'ACCEPTED', 'BUSY']
          },
          sequelize.and(
            {status: 'CLOSED'},
            sequelize.literal(`DATEDIFF(NOW(), idea.updatedAt) <= 90`)
          )
        )
      },

      filter: function (filtersInclude, filtersExclude) {
        const filterKeys = [
          {
            'key': 'id'
          },
          {
            'key': 'title'
          },
          {
            'key': 'theme',
            'extraData': true
          },
          {
            'key': 'area',
            'extraData': true
          },
          {
            'key': 'vimeoId',
            'extraData': true
          },
        ];
        
        return getSequelizeConditionsForFilters(filterKeys, filtersInclude, sequelize, filtersExclude);
      },

      // vergelijk getRunning()
      selectRunning: {
        where: sequelize.or(
          {
            status: ['OPEN', 'CLOSED', 'ACCEPTED', 'BUSY']
          },
          sequelize.and(
            {status: 'DENIED'},
            sequelize.literal(`DATEDIFF(NOW(), idea.updatedAt) <= 7`)
          )
        )
      },

      includeArguments: function (userId) {
        return {
          include: [{
            model: db.Argument.scope(
              'defaultScope',
              {method: ['withVoteCount', 'argumentsAgainst']},
              {method: ['withUserVote', 'argumentsAgainst', userId]},
              'withReactions'
            ),
            as: 'argumentsAgainst',
            required: false,
            where: {
              sentiment: 'against',
              parentId: null
            }
          }, {
            model: db.Argument.scope(
              'defaultScope',
              {method: ['withVoteCount', 'argumentsFor']},
              {method: ['withUserVote', 'argumentsFor', userId]},
              'withReactions'
            ),
            as: 'argumentsFor',
            required: false,
            where: {
              sentiment: 'for',
              parentId: null
            }
          }],
          // HACK: Inelegant?
          order: [
            sequelize.literal(`GREATEST(0, \`argumentsAgainst.yes\` - ${argVoteThreshold}) DESC`),
            sequelize.literal(`GREATEST(0, \`argumentsFor.yes\` - ${argVoteThreshold}) DESC`),
            sequelize.literal('argumentsAgainst.parentId'),
            sequelize.literal('argumentsFor.parentId'),
            sequelize.literal('argumentsAgainst.createdAt'),
            sequelize.literal('argumentsFor.createdAt')
          ]
        };
      },

      includeTags: {
        include: [{model: db.Tag,
          attributes: ['id', 'name'],
          through: {attributes: []},
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
        // 				}).then((ideas) => {
        // 					// add ranking
        // 					let ranked = ideas.slice();
        // 					ranked.forEach(idea => {
        // 						idea.ranking = idea.status == 'DENIED' ? -10000 : idea.yes - idea.no;
        // 					});
        // 					ranked.sort( (a, b) => a.ranking < b.ranking );
        // 					let rank = 1;
        // 					ranked.forEach(idea => {
        // 						idea.ranking = rank;
        // 						rank++;
        // 					});
        // 					return sort == 'ranking' ? ranked : ideas;
        // 				});
      },

      includeProject: {
        include: [{
          model: db.Project,
        }]
      },

      includeVoteCount: {
        attributes: {
          include: [
            voteCount('yes'),
            voteCount('no')
          ]
        }
      },

      includeArgsCount: {
        attributes: {
          include: [
            argCount('argCount')
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
            model: db.Poll.scope([ 'defaultScope', 'withIdea', { method: ['withVotes', 'poll', userId]}, { method: ['withUserVote', 'poll', userId]} ]),
          as: 'poll',
          required: false,
        }]
        }
      },

      // vergelijk getRunning()
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
            break;
          case 'date_desc':
          default:
            order = sequelize.literal(`
							CASE status
								WHEN 'ACCEPTED' THEN 4
								WHEN 'OPEN'     THEN 3
								WHEN 'BUSY'     THEN 2
								WHEN 'DENIED'   THEN 0
								                ELSE 1
							END DESC,
							startDate DESC
						`);

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
            argCount('argCount')
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
      withArguments: function (userId) {
        return {
          include: [{
            model: db.Argument.scope(
              'defaultScope',
              {method: ['withVoteCount', 'argumentsAgainst']},
              {method: ['withUserVote', 'argumentsAgainst', userId]},
              'withReactions'
            ),
            as: 'argumentsAgainst',
            required: false,
            where: {
              sentiment: 'against',
              parentId: null,
            }
          }, {
            model: db.Argument.scope(
              'defaultScope',
              {method: ['withVoteCount', 'argumentsFor']},
              {method: ['withUserVote', 'argumentsFor', userId]},
              'withReactions'
            ),
            as: 'argumentsFor',
            required: false,
            where: {
              sentiment: 'for',
              parentId: null,
            }
          }],
          // HACK: Inelegant?
          order: [
            sequelize.literal(`GREATEST(0, \`argumentsAgainst.yes\` - ${argVoteThreshold}) DESC`),
            sequelize.literal(`GREATEST(0, \`argumentsFor.yes\` - ${argVoteThreshold}) DESC`),
            'argumentsAgainst.parentId',
            'argumentsFor.parentId',
            'argumentsAgainst.createdAt',
            'argumentsFor.createdAt'
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

  Idea.associate = function (models) {
    this.belongsTo(models.User, { onDelete: 'CASCADE' });
    this.belongsTo(models.Project, { onDelete: 'CASCADE' });
    this.hasMany(models.Vote, { onDelete: 'CASCADE' });
    this.hasMany(models.Argument, {as: 'argumentsAgainst', onDelete: 'CASCADE' });
    this.hasMany(models.Argument, {as: 'argumentsFor', onDelete: 'CASCADE'});
    this.hasOne(models.Poll, {as: 'poll', foreignKey: 'ideaId', onDelete: 'CASCADE' });
    this.hasOne(models.Vote, {as: 'userVote', foreignKey: 'ideaId', onDelete: 'CASCADE' });
    this.belongsToMany(models.Tag, {through: 'ideaTags', constraints: false, onDelete: 'CASCADE' });
  }

  Idea.getRunning = function (sort, extraScopes) {

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
      case 'createdate_asc':
        order = [['createdAt', 'ASC']];
        break;
      case 'createdate_desc':
        order = [['createdAt', 'DESC']];
        break;
      case 'date_asc':
        order = [['startDate', 'ASC']];
        break;
      case 'date_desc':
      default:
        order = sequelize.literal(`
							CASE status
								WHEN 'ACCEPTED' THEN 4
								WHEN 'OPEN'     THEN 3
								WHEN 'BUSY'     THEN 2
								WHEN 'DENIED'   THEN 0
								                ELSE 1
							END DESC,
							startDate DESC
						`);
    }

    // Get all running ideas.
    // TODO: Ideas with status CLOSED should automatically
    //       become DENIED at a certain point.
    let scopes = ['summary'];
    if (extraScopes) {
      scopes = scopes.concat(extraScopes);
    }

    let where = sequelize.or(
      {
        status: ['OPEN', 'CLOSED', 'ACCEPTED', 'BUSY', 'DONE']
      },
      sequelize.and(
        {status: 'DENIED'},
        sequelize.literal(`DATEDIFF(NOW(), idea.updatedAt) <= 7`)
      )
    );

    // todo: dit kan mooier
    if (config.projectId && typeof config.projectId == 'number') {
      where = {
        $and: [
          {projectId: config.projectId},
          ...where,
        ]
      }
    }

    return this.scope(...scopes).findAll({
      where,
      order: order,
    }).then((ideas) => {
      // add ranking
      let ranked = ideas.slice();
      ranked.forEach(idea => {
        idea.ranking = idea.status == 'DENIED' ? -10000 : idea.yes - idea.no;
      });
      ranked.sort((a, b) => b.ranking - a.ranking);
      let rank = 1;
      ranked.forEach(idea => {
        idea.ranking = rank;
        rank++;
      });
      return sort == 'ranking' ? ranked : (sort == 'rankinginverse' ? ranked.reverse() : ideas);
    }).then((ideas) => {
      if (sort != 'random') return ideas;
      let randomized = ideas.slice();
      randomized.forEach(idea => {
        idea.random = Math.random();
      });
      randomized.sort((a, b) => b.random - a.random);
      return randomized;
    })
  }

  Idea.getHistoric = function () {
    return this.scope('summary').findAll({
      where: {
        status: {[Sequelize.Op.not]: ['OPEN', 'CLOSED']}
      },
      order: 'updatedAt DESC'
    });
  }

  Idea.prototype.getUserVote = function (user) {
    return db.Vote.findOne({
      attributes: ['opinion'],
      where: {
        ideaId: this.id,
        userId: user.id
      }
    });
  }

  Idea.prototype.isOpen = function () {
    return this.status === 'OPEN';
  }

  Idea.prototype.isRunning = function () {
    return this.status === 'OPEN' ||
      this.status === 'CLOSED' ||
      this.status === 'ACCEPTED' ||
      this.status === 'BUSY'
  }

  // standaard stemvan
  Idea.prototype.addUserVote = function (user, opinion, ip, extended) {

    var data = {
      ideaId: this.id,
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
  Idea.prototype.setUserVote = function (user, opinion, ip) {
    let self = this;
    if (config.votes && config.votes.maxChoices) {

      return db.Vote.findAll({where: {userId: user.id}})
        .then(vote => {
          if (vote) {
            if (config.votes.switchOrError == 'error') throw new Error('Je hebt al gestemd'); // waarmee de default dus switch is
            return vote
              .update({ip, confirmIdeaId: self.id})
              .then(vote => true)
          } else {
            return db.Vote.create({
              ideaId: self.id,
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
      throw new Error('Idea.setUserVote: missing params');
    }

  }

  Idea.prototype.setModBreak = function (user, modBreak) {
    return this.update({
      modBreak: modBreak,
      modBreakUserId: user.id,
      modBreakDate: new Date()
    });
  }

  Idea.prototype.setStatus = function (status) {
    return this.update({status: status});
  }

  let canMutate = function(user, self) {
    if (userHasRole(user, 'editor', self.userId) || userHasRole(user, 'admin', self.userId) || userHasRole(user, 'moderator', self.userId)) {
      return true;
    }

    if( !self.isOpen() ) {
      return false;
    }

    if (userHasRole(user, 'owner', self.userId)) {
      return true;
    }

    // canEditAfterFirstLikeOrArg is handled in the validate hook

  }

	Idea.auth = Idea.prototype.auth = {
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
    toAuthorizedJSON: function(user, data, self) {

      if (!self.auth.canView(user, self)) {
        return {};
      }

	   /* if (idea.project.config.archivedVotes) {
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

      // if user is not allowed to edit idea then remove phone key, otherwise publically available
      // needs to move to definition per key
      if (!canMutate(user, self) && data.extraData && data.extraData.phone) {
		    delete data.extraData.phone;
	    }

      if (data.argumentsAgainst) {
        data.argumentsAgainst = hideEmailsForNormalUsers(data.argumentsAgainst);
      }

      if (data.argumentsFor) {
        data.argumentsFor = hideEmailsForNormalUsers(data.argumentsFor);
      }

      data.can = {};

      // if ( self.can('vote', user) ) data.can.vote = true;
      if ( self.can('update', user) ) data.can.edit = true;
      if ( self.can('delete', user) ) data.can.delete = true;

      return data;
    },
  }

  return Idea;

  async function beforeValidateHook(instance, options) {

    // add project config
    let projectConfig = config;
    if (instance.projectId) {
      let project = await db.Project.findByPk(instance.projectId);
      projectConfig = merge.recursive(true, config, project.config);
    }
    instance.config = projectConfig;

    // count args and votes
    let canEditAfterFirstLikeOrArg = projectConfig && projectConfig.canEditAfterFirstLikeOrArg || false
    if (!canEditAfterFirstLikeOrArg && !userHasRole(instance.auth && instance.auth.user, 'moderator')) {
      let firstLikeSubmitted = await db.Vote.count({ where: { ideaId: instance.id }});
      let firstArgSubmitted  = await db.Argument.count({ where: { ideaId: instance.id }});
      if (firstLikeSubmitted || firstArgSubmitted) {
        throw Error('You cannot edit an idea after the first like or argument has been added')
      }
    }

  }

};
