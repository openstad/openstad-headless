var sanitize = require('../util/sanitize');
var config = require('config');
const merge = require('merge');

const userHasRole = require('../lib/sequelize-authorization/lib/hasRole');

module.exports = function (db, sequelize, DataTypes) {
  var Poll = sequelize.define(
    'poll',
    {
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

      status: {
        type: DataTypes.ENUM('OPEN', 'CLOSED'),
        auth: {
          updateableBy: 'editor',
        },
        defaultValue: 'OPEN',
        allowNull: false,
      },

      question: {
        type: DataTypes.STRING,
        allowNull: false,
        set: function (text) {
          this.setDataValue('question', sanitize.title(text.trim()));
        },
      },

      choices: {
        type: DataTypes.TEXT,
        allowNull: true,
        defaultValue: '{}',
        get: function () {
          let value = this.getDataValue('choices');
          try {
            if (typeof value == 'string') {
              value = JSON.parse(value);
            }
          } catch (err) {}
          return value;
        },
        set: function (value) {
          try {
            if (typeof value == 'string') value = JSON.parse(value);
          } catch (err) {}
          if (typeof value != 'object') value = {};
          let sanatized = {};
          Object.keys(value).forEach((key) => {
            let skey = sanitize.title(key);
            sanatized[skey] = {};
            let sanatizedTitle = sanitize.title(value[key].title || '');
            sanatized[skey].title = sanatizedTitle;
            let sanatizedDescription = sanitize.title(
              value[key].description || ''
            );
            sanatized[skey].description = sanatizedDescription;
          });
          this.setDataValue('choices', JSON.stringify(sanatized));
        },
        auth: {
          authorizeData: function (data, action, user, self, project) {
            // todo
            data = data || self.choices;
            return data;
          },
        },
      },

      userVote: {
        type: DataTypes.VIRTUAL,
      },

      voteCount: {
        type: DataTypes.VIRTUAL,
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

  Poll.scopes = function scopes() {
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
            ],
          },
        ],
      },

      forProjectId: function (projectId) {
        return {
          where: {
            resourceId: [
              sequelize.literal(
                `select id FROM resources WHERE projectId = ${projectId}`
              ),
            ],
          },
        };
      },

      includeResource: function () {
        return {
          include: [
            {
              model: db.Resource,
              attributes: ['id', 'title', 'status'],
            },
          ],
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

      includeUserVote: function (tableName, userId) {
        userId = Number(userId);
        if (!userId) return {};

        return {
          attributes: Object.keys(this.rawAttributes).concat([
            [
              sequelize.literal(`
							(SELECT
								choice
							FROM
								poll_votes pv
							WHERE
								pv.deletedAt IS NULL AND
								pv.pollId = ${tableName}.id AND
								pv.userId     = ${userId})
						`),
              'userVote',
            ],
          ]),
        };
      },

      includeVotes: function () {
        return {
          include: [
            {
              model: db.PollVote,
              as: 'votes',
              attributes: ['id', 'choice'],
            },
          ],
        };
      },
    };
  };

  Poll.associate = function (models) {
    this.belongsTo(models.Resource, { onDelete: 'CASCADE' });
    this.belongsTo(models.User, { onDelete: 'CASCADE' });
    this.hasMany(models.PollVote, {
      as: 'votes',
      onDelete: 'CASCADE',
      hooks: true,
    });
  };

  Poll.auth = Poll.prototype.auth = {
    listableBy: 'all',
    viewableBy: 'all',
    createableBy: 'member',
    updateableBy: ['editor', 'owner'],
    deleteableBy: ['editor', 'owner'],
    canUpdate: function (user, self) {
      let votes = self.getDataValue('votes');
      return (
        userHasRole(user, 'editor') ||
        (userHasRole(user, 'owner', self.userId) && !(votes && votes.length))
      );
    },
    canDelete: function (user, self) {
      let votes = self.getDataValue('votes');
      return (
        userHasRole(user, 'editor') ||
        (userHasRole(user, 'owner', self.userId) && !(votes && votes.length))
      );
    },
    canVote: function (user, self) {
      if (!self.resource) return false;
      if (
        self.resource.auth.canVoteOnPoll() &&
        userHasRole(user, 'member') &&
        self.id &&
        self.status == 'OPEN'
      ) {
        return true;
      } else {
        return false;
      }
    },
    toAuthorizedJSON(user, result, self) {
      result.can = {};
      if (self.can('vote', user)) result.can.vote = true;
      if (self.can('update', user)) result.can.edit = true;
      if (self.can('delete', user)) result.can.delete = true;
      return result;
    },
  };

  Poll.prototype.countVotes = function (deleteVotes) {
    if (!this.votes || !this.votes.length) return;
    this.voteCount = { total: 0 };
    this.votes.forEach((vote) => {
      if (!this.voteCount[vote.choice]) this.voteCount[vote.choice] = 0;
      this.voteCount[vote.choice]++;
      this.voteCount.total++;
    });
    if (deleteVotes) delete this.votes;
  };

  return Poll;
};
