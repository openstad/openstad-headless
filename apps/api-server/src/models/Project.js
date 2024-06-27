const Sequelize = require('sequelize');
const merge = require('merge');
const moment = require('moment');
const configField = require('./lib/config-field');
const userHasRole = require('../lib/sequelize-authorization/lib/hasRole');
const authSettings = require('../util/auth-settings');
const {getSafeConfig} = require("./lib/safe-config");

module.exports = function (db, sequelize, DataTypes) {

  var Project = sequelize.define('project', {

    name: {
      type: DataTypes.STRING(255),
      allowNull: true,
      defaultValue: 'Nieuwe project',
    },

    title: {
      type: DataTypes.STRING(255),
      allowNull: true,
      defaultValue: 'Nieuwe project',
    },

    url: {
      type: DataTypes.STRING(255),
      allowNull: null,
      defaultValue: null,
    },

    config: {
      type: Sequelize.DataTypes.JSON,
      allowNull: false,
      defaultValue: {},
      get: function () {
        let value = this.getDataValue('config');
        return configField.parseConfig('projectConfig', value);
      },
      set: function (value) {
        var currentconfig = this.getDataValue('config');
        value = value || {};
        value = merge.recursive(true, currentconfig, value);
        this.setDataValue('config', configField.parseConfig('projectConfig', value));
      },
      auth: {
        viewableBy: 'editor',
        updateableBy: 'editor',
      },
    },
    
    safeConfig: {
      type: Sequelize.DataTypes.VIRTUAL,
      get() {
        return getSafeConfig(this.getDataValue('config'));
      },
      set (value) {
        throw new Error ('`safeConfig` is a virtual field and cannot be set')
      }
    },

    emailConfig: {
      type: Sequelize.DataTypes.JSON,
      allowNull: false,
      defaultValue: {},
      get: function () {
        let value = this.getDataValue('emailConfig');
        return configField.parseConfig('projectEmailConfig', value);
      },
      set: function (value) {
        var currentconfig = this.getDataValue('emailConfig');
        value = value || {};
        value = merge.recursive(true, currentconfig, value);
        this.setDataValue('emailConfig', configField.parseConfig('projectEmailConfig', value));
      },
      auth: {
        viewableBy: 'editor',
        updateableBy: 'editor',
      },
    },

    /*
      HostStatus is used for tracking domain status
      For instance, mostly managed by checkHostStatus service
      {
      "ip": true, // means the IP is set to this server
      "ingress": false // if on k8s cluster will try to make a ingress host file if IP address is set properly, k8s cert manager will then try get a let's encrypt cert
      } if
    */
    hostStatus: {
      type: DataTypes.JSON,
      allowNull: false,
      defaultValue: {},
      auth: {
        viewableBy: 'admin',
      },
    },

    areaId: {
      type: DataTypes.INTEGER,
      allowNull: true,
    }

  }, {

    defaultScope: {
      attributes: { exclude: ['emailConfig'] }
    },

    hooks: {

      beforeValidate: async function (instance, options) {

        try {
          // ik zou verwachten dat je dit met _previousDataValues kunt doen, maar die bevat al de nieuwe waarde
          let current = await db.Project.findOne({ where: { id: instance.id } });

          // on update of projectHasEnded also update isActive of all the parts
          if (current && typeof instance.config.project.projectHasEnded != 'undefined' && current.config.project.projectHasEnded !== instance.config.project.projectHasEnded) {
            let config = merge.recursive(true, instance.config);
            if (instance.config.project.projectHasEnded) {
              config.votes.isActive = false;
              config.resources.canAddNewResources = false;
              config.comments.canComment = false;
              config.polls.canAddPolls = false;
              config.users.canCreateNewUsers = false;
            } else {
              // commented: do not update these params on unsetting
              // config.votes.isActive = true;
              // config.resources.canAddNewResources = true;
              // config.comments.canComment = false;
              // config.polls.canAddPolls = true;
              // config.users.canCreateNewUsers = true;
            }
            instance.set('config', config);
          }
          
        } catch (err) {
          console.log(err);
          throw err;
        }



      },

      beforeCreate: function (instance, options) {
        return beforeUpdateOrCreate(instance, options);
      },

      beforeUpdate: function (instance, options) {
        return beforeUpdateOrCreate(instance, options);
      },

      beforeDestroy: async function (instance, options) {
        // project has ended
        if (!(instance && instance.config && instance.config.project.projectHasEnded)) throw Error('Cannot delete an active project - first set the project-has-ended parameter');
        // are all users anonymized
        let found = await db.User
            .findAll({
              where: {
                projectId: instance.id,
                role: 'member',
              }
            })

        if (found.length > 0) throw Error('Cannot delete an active project - first anonymize all users');
        return
      },

      afterCreate: async function (instance, options) {
        // create a default status
        let defaultStatus = await db.Status.create({
          projectId: instance.id,
          name: 'open',
          seqnr: 10,
          addToNewResources: true,
          canComment: true,
          editableByUser: true,
        });

        await db.Status.create({
          projectId: instance.id,
          name: 'closed',
          seqnr: 20,
          addToNewResources: false,
          canComment: true,
          editableByUser: true,
        });

        await db.Status.create({
          projectId: instance.id,
          name: 'accepted',
          seqnr: 30,
          addToNewResources: false,
          canComment: true,
          editableByUser: true,
        });
      },

    },

  });

  async function beforeUpdateOrCreate(instance, options) {
    // If a URL is provided, and no uniqueId is set, generate one
    if (instance && instance.url && (!instance.config || !instance.config.uniqueId)) {
      const uniqueId = Math.round(new Date().getTime() / 1000) + instance.url.replace(/\W/g, '').slice(0,40);
      instance.set('config', merge.recursive(true, instance.config, { uniqueId }));
    }
  }

  Project.scopes = function scopes() {
    return {

      excludeConfig: {
        attributes: {exclude: ['config']},
      },

      includeConfig: {
        attributes: {},
      },

      excludeEmailConfig: {
        attributes: {exclude: ['emailConfig']},
      },

      includeEmailConfig: {
        attributes: {include: ['emailConfig']},
      },

      includeAreas: {
        include: [{
          model: db.Area
        }]
      }
    };
  }

  Project.associate = function (models) {
    this.hasMany(models.User, { onDelete: 'CASCADE', hooks: true });
    this.hasMany(models.Resource, { onDelete: 'CASCADE', hooks: true });
    this.hasMany(models.Tag, { onDelete: 'CASCADE', hooks: true });
    this.hasMany(models.Status, { onDelete: 'CASCADE', hooks: true });
    this.hasMany(models.NotificationTemplate, { onDelete: 'CASCADE', hooks: true });
    this.belongsTo(models.Area, { onDelete: 'CASCADE' });
  }

  Project.prototype.willAnonymizeAllUsers = async function () {
    let self = this;
    let result = {};

    try {
      if (!self.id) throw Error('Project not found');
      if (!self.config.project.projectHasEnded) throw Error('Cannot anonymize users on an active project - first set the project-has-ended parameter');

      let users = await db.User.findAll({ where: { projectId: self.id, idpUser: { identifier: { [Sequelize.Op.ne]: null } } } });

      // do not anonymize admins
      result.admins = users.filter( user => userHasRole(user, 'admin') );
      result.users  = users.filter( user => !userHasRole(user, 'admin') );

      // extract externalUserIds
      result.externalUserIds = result.users.filter( user => user.idpUser && user.idpUser.identifier ).map( user => user.idpUser.identifier );
    } catch (err) {
      console.log(err);
      throw err;
    }

    return result;
  }

  Project.prototype.doAnonymizeAllUsers = async function (usersToAnonymize, externalUserIds, useAuth='default') {
    // anonymize all users for this project
    let self = this;
    const amountOfUsersPerSecond = 50;
    try {

      // Anonymize users
      let providers = {};
      for (const user of usersToAnonymize) {
        await new Promise((resolve, reject) => {
          setTimeout(async function() {
            providers[ user.idpUser?.identifier ] = user.idpUser?.provider
            user.project = self;
            let res = await user.doAnonymize();
            user.project = null;
          }, 1000 / amountOfUsersPerSecond)
        })
        .then(result => Promise.resolve() )
          .catch(function (err) {
            throw err;
          });
      }

      for (let externalUserId of externalUserIds) {
        let users = await db.User.findAll({ where: { idpUser: { identifier: externalUserId } } });
        if (users.length == 0) {
          // no api users left for this oauth user; let the oauth server know we dont need this user anymore
          let authConfig = await authSettings.config({ project: self, useAuth: providers[ externalUserId ] })
          let adapter = await authSettings.adapter({ authConfig });
          if (adapter && adapter.service && adapter.service.deleteUser) {
            // TODO: niet getest
            await adapter.service.deleteUser({ authConfig, userData: { id: externalUserId }})
          }

        }
      }
    } catch (err) {
      console.log(err);
      throw err;
    }
  }

  Project.prototype.isVoteActive = function () {
    let self = this;
    let voteIsActive = self.config.votes.isActive;
    if ( ( voteIsActive == null || typeof voteIsActive == 'undefined' ) && self.config.votes.isActiveFrom && self.config.votes.isActiveTo ) {
      voteIsActive = moment().isAfter(self.config.votes.isActiveFrom) && moment().isBefore(self.config.votes.isActiveTo)
    }
    return voteIsActive;
  }

  Project.auth = Project.prototype.auth = {
    listableBy: 'member',
    viewableBy: 'all',
    createableBy: 'admin',
    updateableBy: 'editor',
    deleteableBy: 'admin',
    canAnonymizeAllUsers : function(user, self) {
      self = self || this;
      if (!user) user = self.auth && self.auth.user;
      if (!user || !user.role) user = { role: 'all' };
      let isValid = userHasRole(user, 'admin', self.id);
      return isValid;
    }

  }

  return Project;

};
