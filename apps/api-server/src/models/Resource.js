const Sequelize = require('sequelize');
const { Op } = require('sequelize');

const co = require('co'),
  config = require('config'),
  moment = require('moment-timezone'),
  pick = require('lodash/pick');

const sanitize = require('../util/sanitize');

const merge = require('merge');

const commentVoteThreshold =
  config.resources && config.resources.commentVoteThreshold;
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
      });
    }

    return comment;
  });
}

module.exports = function (db, sequelize, DataTypes) {
  var Resource = sequelize.define(
    'resource',
    {
      projectId: {
        type: DataTypes.INTEGER,
        auth: {
          updateableBy: 'editor',
        },
        defaultValue:
          config.projectId && typeof config.projectId == 'number'
            ? config.projectId
            : 0,
      },

      widgetId: {
        type: DataTypes.INTEGER,
        allowNull: true,
      },

      userId: {
        type: DataTypes.INTEGER,
        auth: {
          updateableBy: 'moderator',
        },
        allowNull: false,
        defaultValue: 0,
      },

      startDate: {
        auth: {
          updateableBy: 'moderator',
        },
        type: DataTypes.DATE,
        allowNull: false,
      },

      startDateHumanized: {
        type: DataTypes.VIRTUAL,
        get: function () {
          var date = this.getDataValue('startDate');
          try {
            if (!date) return 'Onbekende datum';
            return moment(date).format('LLL');
          } catch (error) {
            return (error.message || 'dateFilter error').toString();
          }
        },
      },

      sort: {
        type: DataTypes.INTEGER,
        auth: {
          updateableBy: 'editor',
        },
        allowNull: false,
        defaultValue: 1,
      },

      viewableByRole: {
        type: DataTypes.ENUM(
          'superuser',
          'admin',
          'editor',
          'moderator',
          'member',
          'anonymous',
          'all'
        ),
        defaultValue: 'all',
        auth: {
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
            let titleMinLength =
              (this.config &&
                this.config.resources &&
                this.config.resources.titleMinLength) ||
              10;
            let titleMaxLength =
              (this.config &&
                this.config.resources &&
                this.config.resources.titleMaxLength) ||
              50;
            if (len < titleMinLength || len > titleMaxLength)
              throw new Error(
                `Titel moet tussen ${titleMinLength} en ${titleMaxLength} tekens zijn`
              );
          },
        },
        set: function (text) {
          this.setDataValue('title', sanitize.title(text.trim()));
        },
      },

      summary: {
        type: DataTypes.TEXT,
        allowNull: !this.publishDate,
        validate: {
          textLength(value) {
            // We need to undo the sanitization before we can check the length
            let len = htmlToText.fromString(value).length;
            let summaryMinLength =
              (this.config &&
                this.config.resources &&
                this.config.resources.summaryMinLength) ||
              20;
            let summaryMaxLength =
              (this.config &&
                this.config.resources &&
                this.config.resources.summaryMaxLength) ||
              140;
            if (
              this.publishDate &&
              (len < summaryMinLength || len > summaryMaxLength)
            )
              throw new Error(
                `Samenvatting moet tussen ${summaryMinLength} en ${summaryMaxLength} tekens zijn`
              );
          },
        },
        set: function (text) {
          this.setDataValue('summary', sanitize.summary(text.trim()));
        },
      },

      description: {
        type: DataTypes.TEXT,
        allowNull: !this.publishDate,
        validate: {
          textLength(value) {
            let len = sanitize.summary(value.trim()).length;
            let descriptionMinLength =
              (this.config &&
                this.config.resources &&
                this.config.resources.descriptionMinLength) ||
              140;
            let descriptionMaxLength =
              (this.config &&
                this.config.resources &&
                this.config.resources.descriptionMaxLength) ||
              5000;
            if (
              this.publishDate &&
              (len < descriptionMinLength || len > descriptionMaxLength)
            ) {
              throw new Error(
                `Beschrijving moet tussen ${descriptionMinLength} en ${descriptionMaxLength} tekens zijn`
              );
            }
          },
        },
        set: function (text) {
          this.setDataValue('description', sanitize.content(text.trim()));
        },
      },

      images: {
        type: DataTypes.JSON,
        allowNull: null,
        defaultValue: [],
      },

      documents: {
        type: DataTypes.JSON,
        allowNull: null,
        defaultValue: [],
      },

      budget: {
        type: DataTypes.INTEGER,
        auth: {
          updateableBy: 'moderator',
        },
        allowNull: true,
        set: function (budget) {
          budget = budget ? budget : null;
          this.setDataValue('budget', parseInt(budget, 10) || null);
        },
      },

      extraData: getExtraDataConfig(DataTypes.JSON, 'resources'),

      location: {
        type: DataTypes.JSON,
        allowNull: !(
          config.resources &&
          config.resources.location &&
          config.resources.location.isMandatory
        ),
      },

      modBreak: {
        type: DataTypes.TEXT,
        auth: {
          createableBy: 'moderator',
          updateableBy: 'moderator',
        },
        allowNull: true,
        set: function (text) {
          text = text ? sanitize.content(text.trim()) : null;
          this.setDataValue('modBreak', text);
        },
      },

      modBreakUserId: {
        type: DataTypes.INTEGER,
        auth: {
          createableBy: 'moderator',
          updateableBy: 'moderator',
        },
        allowNull: true,
      },

      modBreakDate: {
        type: DataTypes.DATE,
        auth: {
          createableBy: 'moderator',
          updateableBy: 'moderator',
        },
        allowNull: true,
      },

      modBreakDateHumanized: {
        type: DataTypes.VIRTUAL,
        get: function () {
          var date = this.getDataValue('modBreakDate');
          try {
            if (!date) return undefined;
            return moment(date).format('LLL');
          } catch (error) {
            return (error.message || 'dateFilter error').toString();
          }
        },
      },

      progress: {
        type: DataTypes.VIRTUAL,
        get: function () {
          var minimumYesVotes =
            (this.project &&
              this.project.config &&
              this.project.config.resources &&
              this.project.config.resources.minimumYesVotes) ||
            config.get('resources.minimumYesVotes');
          var yes = this.getDataValue('yes');
          return yes !== undefined
            ? Number((Math.min(1, yes / minimumYesVotes) * 100).toFixed(2))
            : undefined;
        },
      },

      createDateHumanized: {
        type: DataTypes.VIRTUAL,
        get: function () {
          var date = this.getDataValue('createdAt');
          try {
            if (!date) return 'Onbekende datum';
            return moment(date).format('LLL');
          } catch (error) {
            return (error.message || 'dateFilter error').toString();
          }
        },
      },

      publishDate: {
        type: DataTypes.DATE,
        allowNull: true,
      },

      publishDateHumanized: {
        type: DataTypes.VIRTUAL,
        get: function () {
          const date = this.getDataValue('publishDate');
          try {
            if (!date) return 'Onbekende datum';
            return moment(date).format('LLL');
          } catch (error) {
            return (error.message || 'dateFilter error').toString();
          }
        },
      },

    },
    {
      hooks: {
        // onderstaand is een workaround: bij een delete wordt wel de validatehook aangeroepen, maar niet de beforeValidate hook. Dat lijkt een bug.
        beforeValidate: beforeValidateHook,
        beforeDestroy: beforeValidateHook,

        afterCreate: function (instance, options) {
        },

        afterUpdate: function (instance, options) {
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
          let value = self.extraData || {};
          let validated = {};

          let configExtraData =
            self.config &&
            self.config.resources &&
            self.config.resources.extraData;

          function checkValue(value, config) {
            if (config) {
              let key;
              Object.keys(config).forEach((key) => {
                let error = false;

                // recursion on sub objects
                if (
                  typeof value[key] == 'object' &&
                  config[key].type == 'object'
                ) {
                  if (config[key].subset) {
                    checkValue(value[key], config[key].subset);
                  } else {
                    errors.push(`Configuration for ${key} is incomplete`);
                  }
                }

                // allowNull
                if (
                  config[key].allowNull === false &&
                  (typeof value[key] === 'undefined' || value[key] === '')
                ) {
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
                      if (
                        typeof value[key] !== 'object' ||
                        !Array.isArray(value[key]) ||
                        value[key].find((val) => typeof val !== 'string')
                      ) {
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
                  errors.push(error);
                } else {
                  validated[key] = true;
                }
              });
            }
          }

          checkValue(value, configExtraData);

          if (errors.length) {
            console.log('Resource validation error:', errors);
            throw Error(errors.join('\n'));
          }

          return next();
        },
      },
    }
  );

  Resource.scopes = function scopes() {
    function voteCount(opinion) {
      if (config.votes && config.votes.confirmationRequired) {
        return [
          sequelize.literal(`
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
			`),
          opinion,
        ];
      } else {
        return [
          sequelize.literal(`
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
			`),
          opinion,
        ];
      }
    }

    function commentCount(fieldName) {
      return [
        sequelize.literal(`
				(SELECT
					COUNT(*)
				FROM
					comments a
				WHERE
					a.deletedAt IS NULL AND
					a.resourceId = resource.id)
			`),
        fieldName,
      ];
    }

    return {
      defaultScope: {
        include: [
          {
            model: db.Status,
            as: 'statuses',
            attributes: ['id', 'name', 'label', 'extraFunctionality', 'color', 'backgroundColor'],
            through: { attributes: [] },
            required: false,
          },
        ],
      },

      // nieuwe scopes voor de api
      // -------------------------
      onlyVisible: function (userId, userRole) {
        if (userId) {
          if (
            userRole === 'admin' ||
            userRole === 'moderator' ||
            userRole === 'editor'
          ) {
            return {};
          }

          return {
            where: {
              [Op.or]: [
                {
                  [Op.or]: [
                    { userId },
                    { viewableByRole: 'all' },
                    { viewableByRole: null },
                    { viewableByRole: roles[userRole] || '' },
                  ],
                  publishDate: { [Op.ne]: null },
                },
                {
                  userId,
                  publishDate: null,
                },
              ],
            },
          };
        } else {
          return {
            where: {
              [Op.or]: [
                { viewableByRole: 'all' },
                { viewableByRole: null },
                { viewableByRole: roles[userRole] || '' },
              ],
              [Op.not]: [{ publishDate: null }],
            },
          };
        }
      },

      api: {},

      includeComments: function (userId) {
        return {
          include: [
            {
              model: db.Comment.scope(
                'defaultScope',
                { method: ['includeVoteCount', 'commentsAgainst'] },
                { method: ['filterByTags', ''] },
                { method: ['includeUserVote', 'commentsAgainst', userId] },
                'includeRepliesOnComments'
              ),
              as: 'commentsAgainst',
              required: false,
              where: {
                sentiment: 'against',
                parentId: null,
              },
            },
            {
              model: db.Comment.scope(
                'defaultScope',
                { method: ['includeVoteCount', 'commentsFor'] },
                { method: ['filterByTags', ''] },
                { method: ['includeUserVote', 'commentsFor', userId] },
                'includeRepliesOnComments'
              ),
              as: 'commentsFor',
              required: false,
              where: {
                sentiment: 'for',
                parentId: null,
              },
            },
            {
              model: db.Comment.scope(
                'defaultScope',
                { method: ['includeVoteCount', 'commentsNoSentiment'] },
                { method: ['filterByTags', ''] },
                { method: ['includeUserVote', 'commentsNoSentiment', userId] },
                'includeRepliesOnComments'
              ),
              as: 'commentsNoSentiment',
              required: false,
              where: {
                sentiment: 'no sentiment',
                parentId: null,
              },
            },
          ],
          // HACK: Inelegant?
          order: [
            sequelize.literal(
              `GREATEST(0, \`commentsAgainst.yes\` - ${commentVoteThreshold}) DESC`
            ),
            sequelize.literal(
              `GREATEST(0, \`commentsFor.yes\` - ${commentVoteThreshold}) DESC`
            ),
            sequelize.literal(
              `GREATEST(0, \`commentsNoSentiment.yes\` - ${commentVoteThreshold}) DESC`
            ),
            sequelize.literal('commentsAgainst.parentId'),
            sequelize.literal('commentsFor.parentId'),
            sequelize.literal('commentsNoSentiment.parentId'),
            sequelize.literal('commentsAgainst.createdAt'),
            sequelize.literal('commentsFor.createdAt'),
            sequelize.literal('commentsNoSentiment.createdAt'),
          ],
        };
      },

      includeTags: {
        include: [
          {
            model: db.Tag,
            attributes: ['id', 'type', 'name', 'label', 'defaultResourceImage'],
            through: { attributes: [] },
            required: false,
          },
        ],
      },

      includeStatuses: {
        include: [
          {
            model: db.Status,
            as: 'statuses',
            attributes: ['id', 'name', 'label', 'extraFunctionality', 'color', 'backgroundColor'],
            through: { attributes: [] },
            required: false,
          },
        ],
      },

      selectTags: function (tags) {
        return {
          include: [
            {
              model: db.Tag,
              attributes: ['id', 'name'],
              through: { attributes: [] },
              where: {
                id: {
                  [db.Sequelize.Op.in]: tags,
                },
              },
            },
          ],
        };
      },

      selectStatuses: function (statuses) {
        return {
          include: [
            {
              model: db.Status,
              as: 'statuses',
              attributes: ['id', 'name'],
              through: { attributes: [] },
              where: {
                id: {
                  [db.Sequelize.Op.in]: statuses,
                },
              },
            },
          ],
        };
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
        include: [
          {
            model: db.Project,
          },
        ],
      },

      includeVoteCount: function (votesConfig) {
        return {
          attributes: {
            include: votesConfig
              ? votesConfig.voteValues.map((voteValue) =>
                  voteCount(voteValue.value)
                )
              : [],
          },
        };
      },

      includeCommentsCount: {
        attributes: {
          include: [commentCount('commentCount')],
        },
      },

      includeUser: {
        include: [
          {
            model: db.User,
            attributes: [
              'id',
              'role',
              'displayName',
              'nickName',
              'name',
              'email',
              'extraData',
            ],
          },
        ],
      },

      includeUserVote: function (userId) {
        //this.hasOne(db.Vote, {as: 'userVote' });
        let result = {
          include: [
            {
              model: db.Vote,
              as: 'userVote',
              required: false,
              where: {
                userId: userId,
              },
            },
          ],
        };
        return result;
      },

      includePoll: function (userId) {
        return {
          include: [
            {
              model: db.Poll.scope([
                'defaultScope',
                'includeResource',
                { method: ['includeVotes', 'poll', userId] },
                { method: ['includeUserVote', 'poll', userId] },
              ]),
              as: 'poll',
              required: false,
            },
          ],
        };
      },

      includeVotes: {
        include: [
          {
            model: db.Vote,
            include: [
              {
                model: db.User,
                attributes: ['id', 'postcode', 'email'],
              },
            ],
          },
        ],
        order: 'createdAt',
      },

      summary: {
        attributes: {
          include: [
            voteCount('yes'),
            voteCount('no'),
            commentCount('commentCount'),
          ],
          exclude: ['modBreak'],
        },
      },

    };
  };

  Resource.associate = function (models) {
    this.belongsTo(models.User, { onDelete: 'CASCADE' });
    this.belongsTo(models.Project, { onDelete: 'CASCADE' });
    this.hasMany(models.Vote, { onDelete: 'CASCADE' });
    this.hasMany(models.Comment, {
      as: 'commentsAgainst',
      onDelete: 'CASCADE',
    });
    this.hasMany(models.Comment, { as: 'commentsFor', onDelete: 'CASCADE' });
    this.hasMany(models.Comment, { as: 'commentsNoSentiment', onDelete: 'CASCADE' });
    this.hasOne(models.Poll, {
      as: 'poll',
      foreignKey: 'resourceId',
      onDelete: 'CASCADE',
    });
    this.hasOne(models.Vote, {
      as: 'userVote',
      foreignKey: 'resourceId',
      onDelete: 'CASCADE',
    });
    this.belongsToMany(models.Tag, {
      through: 'resource_tags',
      constraints: false,
      onDelete: 'CASCADE',
    });
    this.belongsToMany(models.Status, {
      through: 'resource_statuses',
      constraints: false,
      onDelete: 'CASCADE',
    });
  };

  Resource.prototype.setModBreak = function (user, modBreak) {
    return this.update({
      modBreak: modBreak,
      modBreakUserId: user.id,
      modBreakDate: new Date(),
    });
  };

  let canMutate = function (user, self) {

    if (
      userHasRole(user, 'editor', self.userId) ||
      userHasRole(user, 'admin', self.userId) ||
      userHasRole(user, 'moderator', self.userId)
    ) {
      return true;
    }

    let editableByUser = true;
    let statuses = self.statuses || [];
    for (let status of statuses) {
      if ( status.extraFunctionality?.editableByUser === false ) {
        editableByUser = false;
      }
    }
    if (userHasRole(user, 'owner', self.userId)) {
      return editableByUser;
    }

    // canEditAfterFirstLikeOrComment is handled in the validate hook

  };

  Resource.auth = Resource.prototype.auth = {
    listableBy: 'all',
    viewableBy: 'all',
    createableBy: 'member',
    updateableBy: ['admin', 'editor', 'owner', 'moderator'],
    deleteableBy: ['admin', 'editor', 'owner', 'moderator'],
    canView: function (user, self) {
      if (self && self.viewableByRole && self.viewableByRole != 'all') {
        return userHasRole(user, [self.viewableByRole, 'owner'], self.userId);
      } else {
        return true;
      }
    },
    canVote: function (user, self) {
      // TODO: dit wordt niet gebruikt omdat de logica helemaal in de route zit. Maar hier zou dus netter zijn.
      return false;
    },
    canUpdate: canMutate,
    canDelete: canMutate,
    canAddPoll: canMutate,
    canVoteOnPoll: function canVoteOnPoll(self) {
      // was isRunning, maar voor poll votes is dat niet logisch; ik heb deze functie laten staan voor als er alsnog een afvanging nofig blijkt
      return true;
    },
    canComment: function canComment(self) {
      if (!self) return false;
      if ( self.project?.config?.comments?.canComment === false ) {
        // project config: comments is closed
        return false;
      }
      // published
      if (!self.publishDate) return false;
      // status
      let statuses = self.statuses || [];
      for (let status of statuses) {
        if ( status.extraFunctionality?.canComment === false ) {
          return false;
        }
      }
      return true;
    },
    canMutateStatus: function canMutateStatus (user, self) {
      if (!user || !self) return false;
      if (!self.auth.canUpdate(user, self)) return false;
      return userHasRole(user, 'moderator');
    },
    toAuthorizedJSON: function (user, data, self) {
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

      if (data.commentsNoSentiment) {
        data.commentsNoSentiment = hideEmailsForNormalUsers(data.commentsNoSentiment);
      }

      data.can = {};

      // if ( self.can('vote', user) ) data.can.vote = true;
      if (self.can('update', user)) data.can.edit = true;
      if (self.can('delete', user)) data.can.delete = true;

      return data;
    },
  };

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
    let canEditAfterFirstLikeOrComment =
      (projectConfig && projectConfig.canEditAfterFirstLikeOrComment) || false;
    if (
      !canEditAfterFirstLikeOrComment &&
      !userHasRole(instance.auth && instance.auth.user, 'moderator')
    ) {
      let firstLikeSubmitted = await db.Vote.count({
        where: { resourceId: instance.id },
      });
      let firstCommentSubmitted = await db.Comment.count({
        where: { resourceId: instance.id },
      });
      if (firstLikeSubmitted || firstCommentSubmitted) {
        throw Error(
          'You cannot edit an resource after the first like or comment has been added'
        );
      }
    }
  }
};
