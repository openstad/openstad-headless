var sanitize = require('../util/sanitize');
var moment = require('moment-timezone');
var config = require('config');
const merge = require('merge');
const { Op } = require('sequelize');

// For detecting throwaway accounts in the email address validation.
var emailBlackList = require('../../config/mail_blacklist'),
  emailDomain = /^.+@(.+)$/;

const userHasRole = require('../lib/sequelize-authorization/lib/hasRole');

module.exports = function (db, sequelize, DataTypes) {
  var Comment = sequelize.define(
    'comment',
    {
      parentId: {
        type: DataTypes.INTEGER,
        auth: {
          updateableBy: 'editor',
        },
        allowNull: true,
      },

      resourceId: {
        type: DataTypes.INTEGER,
        auth: {
          updateableBy: 'editor',
        },
        allowNull: false,
      },

      userId: {
        type: DataTypes.INTEGER,
        auth: {
          updateableBy: 'editor',
        },
        allowNull: false,
        defaultValue: 0,
      },

      sentiment: {
        type: DataTypes.ENUM('against', 'for', 'no sentiment'),
        defaultValue: 'for',
        allowNull: false,
      },

      description: {
        type: DataTypes.TEXT,
        allowNull: false,
        validate: {
          // len: {
          //  	args : [30,500],
          //  	msg  : 'Bericht moet tussen 30 en 500 tekens zijn'
          // }
          textLength(value) {
            let len = sanitize.summary(value.trim()).length;
            let descriptionMinLength =
              (this.config &&
                this.config.comments &&
                this.config.comments.descriptionMinLength) ||
              30;
            let descriptionMaxLength =
              (this.config &&
                this.config.comments &&
                this.config.comments.descriptionMaxLength) ||
              500;
            if (len < descriptionMinLength || len > descriptionMaxLength)
              throw new Error(
                `Beschrijving moet tussen ${descriptionMinLength} en ${descriptionMaxLength} tekens zijn`
              );
          },
        },
        set: function (text) {
          this.setDataValue('description', sanitize.argument(text));
        },
      },

      label: {
        type: DataTypes.STRING,
        allowNull: true,
      },

      location: {
        type: DataTypes.JSON,
        allowNull: true,
      },

      yes: {
        type: DataTypes.VIRTUAL,
      },

      hasUserLiked: {
        type: DataTypes.VIRTUAL,
      },

      hasUserDisliked: {
        type: DataTypes.VIRTUAL,
      },

      confirmationSent: {
        type: DataTypes.VIRTUAL,
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

      score: {
        type: DataTypes.DECIMAL(12, 11),
        auth: {
          updateableBy: 'editor',
        },
        allowNull: false,
        defaultValue: '0.00000000000',
      },

      // Field that calculates net votes based on yes and no votes
      netVotes: {
        type: DataTypes.VIRTUAL,
        get: function () {
          const yes = this.getDataValue('yes') || 0;
          const no = this.getDataValue('no') || 0;
          return yes - no;
        },
      },
    },
    {
      hooks: {
        beforeValidate: function (instance, options) {
          return new Promise((resolve, reject) => {
            if (instance.resourceId) {
              db.Resource.scope('includeProject')
                .findByPk(instance.resourceId)
                .then((resource) => {
                  if (!resource) throw Error('Resource niet gevonden');
                  instance.config = merge.recursive(
                    true,
                    config,
                    resource.project.config
                  );
                  return resource;
                })
                .then((resource) => {
                  return resolve();
                })
                .catch((err) => {
                  throw err;
                });
            } else {
              instance.config = config;
              return resolve();
            }
          });
        },
      },

      individualHooks: true,
    }
  );

  Comment.scopes = function scopes() {
    // Helper function used in `includeVoteCount` scope.
    function voteCount(tableName, opinion) {
      if (typeof opinion == 'undefined' || opinion === 'yes') {
        return [
          sequelize.literal(`
          (SELECT
            COUNT(*)
          FROM
            comment_votes av
          WHERE
            av.deletedAt IS NULL AND (
              av.checked IS NULL OR
              av.checked  = 1
            ) AND
            av.commentId = ${tableName}.id
            AND (av.opinion = 'yes' OR av.opinion IS NULL)
          )
        `),
          'yes',
        ];
      } else {
        return [
          sequelize.literal(`
          (SELECT
            COUNT(*)
          FROM
            comment_votes av
          WHERE
            av.deletedAt IS NULL AND (
              av.checked IS NULL OR
              av.checked  = 1
            ) AND
            av.commentId = ${tableName}.id
            AND av.opinion = ${sequelize.escape(opinion)}
          )
          
        `),
          opinion,
        ];
      }
    }

    return {
      defaultScope: {
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
              'phonenumber',
              'address',
              'city',
              'postcode',
            ],
          },
        ],
      },

      forProjectId: function (projectId) {
        return {
          where: {
            resourceId: [
              sequelize.literal(
                `select id FROM resources WHERE projectId = :projectId`
              ),
            ],
          },
          replacements: { projectId: projectId },
        };
      },

      includeRepliesOnComments: function (userId) {
        let commentVoteThreshold = 5; // todo: configureerbaar
        return {
          include: [
            {
              model: db.Comment.scope(
                'defaultScope',
                { method: ['includeVoteCount', 'replies'] },
                { method: ['includeUserVote', 'replies', userId] }
              ),
              as: 'replies',
              required: false,
              // force attribs because the automatic list is incomplete
              attributes: [
                'id',
                'parentId',
                'resourceId',
                'userId',
                'sentiment',
                'description',
                'label',
                'createdAt',
                'updatedAt',
                'createDateHumanized',
                'hasUserLiked',
                'hasUserDisliked',
                'confirmationSent',
                'yes',
              ],
            },
          ],
          where: {
            parentId: null,
          },
          // HACK: Inelegant?
          order: [
            //						sequelize.literal(`GREATEST(0, \`yes\` - ${commentVoteThreshold}) DESC`),
            sequelize.literal('parentId'),
            sequelize.literal('createdAt'),
          ],
        };
      },

      includeAllComments: function () {
        return {
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
                'phonenumber',
                'address',
                'city',
                'postcode',
              ],
            },
          ],
          order: [['createdAt', 'ASC']],
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

      includeResource: function () {
        return {
          include: [
            {
              model: db.Resource,
              attributes: [
                'id',
                'projectId',
                'title',
                'publishDate',
                'viewableByRole',
              ],
              include: {
                model: db.Project,
                attributes: ['id', 'config'],
              },
            },
          ],
        };
      },

      includeVoteCount: function (tableName) {
        return {
          attributes: Object.keys(this.rawAttributes).concat([
            voteCount(tableName, 'yes'),
            voteCount(tableName, 'no'),
          ]),
        };
      },

      includeUserVote: function (tableName, userId) {
        userId = Number(userId);
        if (!userId) return {};

        return {
          attributes: Object.keys(this.rawAttributes).concat([
            [
              sequelize.literal(`
							(SELECT
								COUNT(*)
							FROM
								comment_votes av
							WHERE
								av.deletedAt IS NULL AND (
									av.checked IS NULL OR
									av.checked  = 1
								) AND
								av.commentId = ${tableName}.id AND
								av.userId     = ${userId} AND
								(av.opinion = 'yes' OR av.opinion IS NULL)
              )
						`),
              'hasUserLiked',
            ],
            [
              sequelize.literal(`
							(SELECT
								COUNT(*)
							FROM
								comment_votes av
							WHERE
								av.deletedAt IS NULL AND (
									av.checked IS NULL OR
									av.checked  = 1
								) AND
								av.commentId = ${tableName}.id AND
								av.userId     = ${userId} AND
								av.opinion = 'no'
              )
						`),
              'hasUserDisliked',
            ],
          ]),
        };
      },

      includeUser: {
        include: [
          {
            model: db.User,
            as: 'user',
            required: false,
          },
        ],
      },

      filterByTags: function (onlyIncludeTagIds) {
        let where = {};
        if (onlyIncludeTagIds) {
          where.id = { [Op.in]: onlyIncludeTagIds.split(',') };
        }
        return {
          include: [
            {
              model: db.Tag,
              as: 'tags',
              through: { attributes: [] },
              required: !!onlyIncludeTagIds,
              where: where,
            },
          ],
        };
      },
    };
  };

  Comment.associate = function (models) {
    this.belongsTo(models.Resource, { onDelete: 'CASCADE' }); // TODO: defined in the DB as NOT NULL, which is incorrect when parentId is used
    this.belongsTo(models.User, { onDelete: 'CASCADE' });
    this.hasMany(models.CommentVote, {
      as: 'votes',
      onDelete: 'CASCADE',
      hooks: true,
    });
    this.hasMany(models.Comment, {
      // TODO: cascade does not work here
      foreignKey: 'parentId',
      as: 'replies',
      onDelete: 'CASCADE',
      hooks: true,
    });
    this.belongsToMany(models.Tag, {
      through: 'comment_tags',
      as: 'tags',
      foreignKey: 'commentId',
      otherKey: 'tagId',
      constraints: false,
    });
  };

  Comment.prototype.addUserVote = function (user, ip, opinion) {
    const data = {
      commentId: this.id,
      userId: user.id,
      ip: ip,
    };

    // See `Resource.addUserVote` for an explanation of the logic below.
    return db.CommentVote.findOne({ where: data, paranoid: false })
      .then(function (vote) {
        if (vote) {
          if (vote.opinion != opinion) {
            // User is changing their vote
            vote.setDataValue('opinion', opinion);
            vote.setDataValue('deletedAt', null);
            return vote.save();
          } else {
            if (!vote.deletedAt) {
              return vote.destroy();
            } else {
              // vote.restore() doesn't seem to trigger hooks
              vote.setDataValue('deletedAt', null);
              vote.setDataValue('opinion', opinion);
              return vote.save();
            }
          }
        } else {
          // HACK: See `Resource.addUserVote`.
          data.deletedAt = null;
          data.opinion = opinion;
          return db.CommentVote.create(data);
        }
      })
      .then(function (result) {
        return result && !!result.deletedAt;
      });
  };

  Comment.auth = Comment.prototype.auth = {
    listableBy: 'all',
    viewableBy: 'all',
    createableBy: 'member',
    updateableBy: ['editor', 'owner'],
    deleteableBy: ['editor', 'owner'],
    canVote: function (user, self) {
      // TODO: ik denk dat je alleen moet kunnen voten bij resource.isOpen, maar dat doet hij nu ook niet. Sterker: hij checkt nu alleen maar op parentId.
      if (userHasRole(user, 'member') && self.id) {
        return true;
      }
      return false;
    },
    canReply: function (user, self) {
      if (user.role == 'admin') return true;
      if (!self.resource) return false;
      if (self.resource.project?.config?.comments?.canReply === false)
        return false;
      if (
        self.resource.auth.canComment(self.resource) &&
        userHasRole(user, 'member') &&
        self.id &&
        !self.parentId
      ) {
        return true;
      }
      return false;
    },
    toAuthorizedJSON(user, result, self) {
      // TODO: ik denk dat ik doit overal wil. Misschien met een scope of andere param.
      result.can = {};
      if (self.can('reply', user)) result.can.reply = true;
      if (self.can('update', user)) result.can.edit = true;
      if (self.can('delete', user)) result.can.delete = true;
      return result;
    },
  };

  const wilsonScore = require('../lib/wilson-score');

  Comment.calculateAndSaveScore = Comment.prototype.calculateAndSaveScore =
    async function () {
      const comment = this;
      const votes = await db.CommentVote.findAll({
        where: {
          commentId: comment.id,
          deletedAt: null,
          [Op.or]: [{ checked: null }, { checked: true }],
        },
        attributes: [
          'opinion',
          [sequelize.fn('COUNT', sequelize.col('id')), 'count'],
        ],
        group: ['opinion'],
      });

      let yesVotes = 0;
      let noVotes = 0;

      votes.forEach((vote) => {
        if (vote.opinion === 'yes') {
          yesVotes = parseInt(vote.get('count'), 10);
        } else if (vote.opinion === 'no') {
          noVotes = parseInt(vote.get('count'), 10);
        }
      });

      // Calculate & save the score to the resource
      comment.setDataValue('score', wilsonScore(yesVotes, noVotes));
      await comment.save({ validate: false, hooks: false });
    };

  return Comment;
};
