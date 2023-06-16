var config = require('config')
, log = require('debug')('app:user')
, pick = require('lodash/pick');

const merge = require('merge');

const Password = require('../lib/password');
const sanitize = require('../util/sanitize');
const userHasRole = require('../lib/sequelize-authorization/lib/hasRole');
const defaultCan = require('../lib/sequelize-authorization/mixins/can');
const getExtraDataConfig = require('../lib/sequelize-authorization/lib/getExtraDataConfig');
const roles = require('../lib/sequelize-authorization/lib/roles');

// For detecting throwaway accounts in the email address validation.
var emailBlackList = require('../../config/mail_blacklist')

module.exports = function (db, sequelize, DataTypes) {
  var User = sequelize.define('user', {
    siteId: {
      type: DataTypes.INTEGER,
      defaultValue: config.siteId && typeof config.siteId == 'number' ? config.siteId : 0,
    },

    idpUser: {
      type: DataTypes.JSON,
      auth: {
        listableBy: 'admin',
        viewableBy: 'admin',
        createableBy: 'moderator',
        updateableBy: 'admin',
      },
      allowNull: false,
      defaultValue: {},
    },

    role: {
      type: DataTypes.STRING(32),
      allowNull: false,
      defaultValue: 'anonymous',
      validate: {
        isIn: {
          args: [['unknown', 'anonymous', 'member', 'admin', 'su', 'editor', 'moderator', 'superAdmin']],
          msg: 'Unknown user role'
        }
      },
			auth:  {
        viewableBy: ['moderator', 'owner'],
				/**
				 * In case of setting the role
				 * Admin are allowed to set all roles, but moderators only are allowed
				 * to set members.
				 *
				 * @param actionUserRole
				 * @param action (c)
				 * @param user ()
				 * @param self (user model)
				 * @param site (site on which model is queried)
				 */
				authorizeData: function(actionUserRole, action, user, self, site) {
					if (!self) return;

					const updateAllRoles = ['admin'];
					const updateMemberRoles = ['moderator'];
					const fallBackRole = 'anonymous';
					const memberRole = 'member';

					// this is the role for User on which action is performed, not of the user doing the update
          actionUserRole = actionUserRole || self.role;

					// by default return anonymous role if none of the conditions are met
					let roleToReturn;

					// only for create and update check if allowed, the other option, view and list
					// for now its ok if a the public sees the role
					// for fields no DELETE action exists
					if (action === 'create' || action === 'update') {
						// if user is allowed to update all status
						if (userHasRole(user, updateAllRoles)) {
							roleToReturn = actionUserRole;
						  // check if active user is allowed to set user's role to member
						} else if (userHasRole(user, updateMemberRoles) && actionUserRole === memberRole) {
							roleToReturn = actionUserRole;
						} else {
							roleToReturn = fallBackRole;
						}

					} else {
						roleToReturn = actionUserRole;
					}

					return roleToReturn;
				},
			},
    },
    // For unknown/anon: Always `false`.
    // For members: `true` when the user profile is complete. This is set
    //              to `false` by default, and should be set to `true`
    //              after the user has completed the registration. Until
    //              then, the 'complete registration' form should be displayed
    //              instead of any other content.

    complete: {
      type: DataTypes.BOOLEAN,
      allowNull: false,
      defaultValue: false
    },

    extraData: getExtraDataConfig(DataTypes.JSON, 'users'),

    email: {
      type: DataTypes.STRING(255),
      auth: {
        listableBy: ['moderator', 'owner'],
        viewableBy: ['moderator', 'owner'],
        createableBy: ['moderator', 'owner'],
        updateableBy: ['editor'],
      },
      allowNull: true,
      validate: {
        isEmail: {
          msg: 'Geen geldig emailadres'
        },
        notBlackListed: function (email) {
          var match = email && email.match(/^.+@(.+)$/);
          if (match) {
            let domainName = match[1];
            if (domainName in emailBlackList) {
              throw Error('Graag je eigen emailadres gebruiken; geen tijdelijk account');
            }
          }
        }
      }
    },

    nickName: {
      type: DataTypes.STRING(64),
      allowNull: true,
      auth: {
        listableBy: ['moderator', 'owner'],
        viewableBy: ['moderator', 'owner'],
        createableBy: ['moderator', 'owner'],
        updateableBy: ['moderator', 'owner'],
      },
      set: function (value) {
        if (this.site && this.site.config && this.site.config.users && this.site.config.users.allowUseOfNicknames) {
          this.setDataValue('nickName', sanitize.noTags(value));
        } else {
          value = this.getDataValue('nickName');
          this.setDataValue('nickName', value);
        }
      }
    },

    firstName: {
      type: DataTypes.STRING(64),
      auth: {
        listableBy: ['moderator', 'owner'],
        viewableBy: ['moderator', 'owner'],
        createableBy: ['moderator', 'owner'],
        updateableBy: ['moderator', 'owner'],
      },
      allowNull: true,
      set: function (value) {
        this.setDataValue('firstName', sanitize.noTags(value));
      }
    },

    lastName: {
      type: DataTypes.STRING(64),
      auth: {
        listableBy: ['moderator', 'owner'],
        viewableBy: ['moderator', 'owner'],
        createableBy: ['moderator', 'owner'],
        updateableBy: ['moderator', 'owner'],
      },
      allowNull: true,
      set: function (value) {
        this.setDataValue('lastName', sanitize.noTags(value));
      }
    },

    listableByRole: {
      type: DataTypes.ENUM('admin', 'editor', 'moderator', 'member', 'anonymous', 'all'),
      defaultValue: null,
      auth: {
        viewableBy: ['moderator', 'owner'],
        updateableBy: ['moderator', 'owner'],
      },
      allowNull: true,
    },

    detailsViewableByRole: {
      type: DataTypes.ENUM('admin', 'editor', 'moderator', 'member', 'anonymous', 'all'),
      defaultValue: null,
      auth: {
        viewableBy: ['moderator', 'owner'],
        updateableBy: ['moderator', 'owner'],
      },
      allowNull: true,
    },

    phoneNumber: {
      type: DataTypes.STRING(64),
      auth: {
        listableBy: ['moderator', 'owner'],
        viewableBy: ['moderator', 'owner'],
        createableBy: ['moderator', 'owner'],
        updateableBy: ['editor', 'owner'],
      },
      allowNull: true,
      set: function (value) {
        this.setDataValue('phoneNumber', sanitize.noTags(value));
      }
    },

    streetName: {
      type: DataTypes.STRING(64),
      auth: {
        listableBy: ['moderator', 'owner'],
        viewableBy: ['moderator', 'owner'],
        createableBy: ['moderator', 'owner'],
        updateableBy: ['moderator', 'owner'],
      },
      allowNull: true,
      set: function (value) {
        this.setDataValue('streetName', sanitize.noTags(value));
      }
    },

    houseNumber: {
      type: DataTypes.STRING(64),
      auth: {
        listableBy: ['moderator', 'owner'],
        viewableBy: ['moderator', 'owner'],
        createableBy: ['moderator', 'owner'],
        updateableBy: ['moderator', 'owner'],
      },
      allowNull: true,
      set: function (value) {
        this.setDataValue('houseNumber', sanitize.noTags(value));
      }
    },

    postcode: {
      type: DataTypes.STRING(64),
      auth: {
        listableBy: ['moderator', 'owner'],
        viewableBy: ['moderator', 'owner'],
        createableBy: ['moderator', 'owner'],
        updateableBy: ['moderator', 'owner'],
      },
      allowNull: true,
      set: function (value) {
        this.setDataValue('postcode', sanitize.noTags(value));
      }
    },

    city: {
      type: DataTypes.STRING(64),
      auth: {
        listableBy: ['moderator', 'owner'],
        viewableBy: ['moderator', 'owner'],
        createableBy: ['moderator', 'owner'],
        updateableBy: ['moderator', 'owner'],
      },
      allowNull: true,
      set: function (value) {
        this.setDataValue('city', sanitize.noTags(value));
      }
    },

    suffix: {
      type: DataTypes.STRING(64),
      auth: {
        listableBy: ['moderator', 'owner'],
        viewableBy: ['moderator', 'owner'],
        createableBy: ['moderator', 'owner'],
        updateableBy: ['moderator', 'owner'],
      },
      allowNull: true,
      set: function (value) {
        this.setDataValue('suffix', sanitize.noTags(value));
      }
    },

    fullName: {
      type: DataTypes.VIRTUAL,
      auth: {
        listableBy: ['moderator', 'owner'],
        viewableBy: ['moderator', 'owner'],
      },
      allowNull: true,
      get: function () {
        var firstName = this.getDataValue('firstName') || '';
        var lastName = this.getDataValue('lastName') || '';
        var space = firstName && lastName ? ' ' : '';
        return firstName || lastName ? (firstName + space + lastName) : undefined;
      }
    },

    initials: {
      type: DataTypes.VIRTUAL,
      auth: {
        listableBy: ['moderator', 'owner'],
        viewableBy: ['moderator', 'owner'],
      },
      allowNull: true,
      get: function () {
        var firstName = this.getDataValue('firstName') || '';
        var lastName = this.getDataValue('lastName') || '';
        var initials = (firstName ? firstName.substr(0, 1) : '') +
            (lastName ? lastName.substr(0, 1) : '');
        return initials.toUpperCase();
      }
    },

    displayName: {
      type: DataTypes.VIRTUAL,
      allowNull: true,
      get: function () {
        // this should use site.config.allowUseOfNicknames but that implies loading the site for every time a user is shown which would be too slow
        // therefore createing nicknames is dependendt on site.config.allowUseOfNicknames; once you have created a nickName it will be shown here no matter what
        var nickName = this.getDataValue('nickName');
        var fullName = this.fullName;
        return nickName || fullName || undefined;
      }
    },

    gender: {
      auth: {
        listableBy: ['moderator', 'owner'],
        viewableBy: ['moderator', 'owner'],
      },
      type: DataTypes.ENUM('male', 'female'),
      allowNull: true,
      defaultValue: null,
    },

    zipCode: {
      type: DataTypes.STRING(10),
      auth: {
        listableBy: ['moderator', 'owner'],
        viewableBy: ['moderator', 'owner'],
        createableBy: ['moderator', 'owner'],
        updateableBy: ['moderator', 'owner'],
      },
      allowNull: true,
      validate: {
        is: {
          args: [/^\d{4} ?[a-zA-Z]{2}$/],
          msg: 'Ongeldige postcode'
        }
      },
      set: function (zipCode) {
        zipCode = zipCode ? String(zipCode).trim() : null;
        this.setDataValue('zipCode', zipCode);
      },
    },

    postcode: {
      type: DataTypes.STRING(10),
      auth: {
        listableBy: ['moderator', 'owner'],
        viewableBy: ['moderator', 'owner'],
        createableBy: ['moderator', 'owner'],
        updateableBy: ['moderator', 'owner'],
      },
      allowNull: true,
      validate: {
        is: {
          args: [/^\d{4} ?[a-zA-Z]{2}$/],
          msg: 'Ongeldige postcode'
        }
      },
      set: function (zipCode) {
        zipCode = zipCode != null ?
          String(zipCode).trim() :
          null;
        this.setDataValue('zipCode', zipCode);
      },
    },

    lastLogin: {
      type: DataTypes.DATE,
      auth: {
        listableBy: ['moderator', 'owner'],
        viewableBy: ['moderator', 'owner'],
      },
      allowNull: false,
      defaultValue: sequelize.NOW,
    },

    isNotifiedAboutAnonymization: {
      type: DataTypes.DATE,
      auth: {
        listableBy: ['moderator', 'owner'],
        viewableBy: ['moderator', 'owner'],
      },
      allowNull: true,
      defaultValue: null,
    },

    // signedUpForNewsletter: {
    //  	type         : DataTypes.BOOLEAN,
    //  	allowNull    : false,
    //  	defaultValue : false
    // },

  }, {
    charset: 'utf8',

    /*	indexes: [{
        fields: ['email'],
        unique: true
        }],*/

    hooks: {

      // onderstaand is een workaround: bij een delete wordt wel de validatehook aangeroepen, maar niet de beforeValidate hook. Dat lijkt een bug.
      beforeValidate: beforeValidateHook,
      beforeDestroy: beforeValidateHook,

    },

    individualHooks: true,

    validate: {
      hasValidUserRole: function () {
        if (this.id !== 1 && this.role === 'unknown') {
          throw new Error('User role \'unknown\' is not allowed');
        }
      },
      // isValidAnon: function() {
      // 	if( this.role === 'unknown' || this.role === 'anonymous' ) {
      // 		if( this.complete || this.email ) {
      // 			throw new Error('Anonymous users cannot be complete profiles or have a mail address');
      // 		}
      // 	}
      // },
      isValidMember: function () {
        // dit is niet langer relevant; mijnopenstad bepaald wat je default rol is
        // if( this.role !== 'unknown' && this.role !== 'anonymous' ) {
        //  	if( !this.email ) {
        //  		throw new Error('Onjuist email adres');
        //  	} else if( this.complete && (!this.firstName || !this.lastName) ) {
        //  		throw new Error('Voor- en achternaam zijn verplichte velden');
        //  	}
        // }
      },
      onlyMembersCanLogin: function () {
        if (this.role === 'unknown' || this.role === 'anonymous') {
          if (this.passwordHash) {
            throw new Error('Anonymous profiles cannot have login credentials');
          }
        }
      }
    },

  });

  User.scopes = function scopes() {

    return {
      includeSite: {
        include: [{
          model: db.Site,
        }]
      },

      onlyListable: function (userId, userRole = 'all') {

        // todo: hij kan alleen tegen een enkelvoudige listableBy
        // todo: owner wordt nu altijd toegevoegd, dat moet alleen als die in listableBy staat, maar zie vorige regel
        // todo: gelijkttrekken met Idea.onlyVisible: die is nu exclusive en deze inclusive

        let requiredRole = this.auth && this.auth.listableBy || 'all';

        // if requiredRole == all then listableByRole is not relevant and neither is userRole
        if (requiredRole === 'all') return;

        // if requiredRole != all then listableByRole is allowing

        // null should be seen as requiredRole
        let requiredRoleEscaped = sequelize.escape(requiredRole);
        let rolesEscaped = sequelize.escape(roles[userRole])
        let nullCondition = `${requiredRoleEscaped} IN (${rolesEscaped})`;

        let where;
        if (userId) {
          where = sequelize.or(
            {id: userId}, // owner
            {listableByRole: roles[userRole] || 'none'}, // allow when userRole is good enough
            sequelize.and( // or null and userRole is at least requiredRole
              {listableByRole: null},
              sequelize.literal(nullCondition)
            ),
          )
        } else {
          where = sequelize.or(
            {listableByRole: roles[userRole] || 'none'}, // allow when userRole is good enough
            sequelize.and( // or null and userRole is at least requiredRole
              {listableByRole: null},
              sequelize.literal(nullCondition)
            ),
          )
        }

        return {where};

      },

      includeVote: {
        include: [{
          model: db.Vote,
        }]
      },


      onlyVisible: function (userId, userRole) {
        if (userId) {
          return {
            where: sequelize.or(
              {id: userId},
              {viewableByRole: 'all'},
              {viewableByRole: roles[userRole] || 'all'},
            )
          };
        } else {
          return {
            where: sequelize.or(
              {viewableByRole: 'all'},
              {viewableByRole: roles[userRole] || 'all'},
            )
          };
        }
      },

    }

  }

  User.associate = function (models) {
    this.hasMany(models.Article);
    this.hasMany(models.Idea);
    this.hasMany(models.Vote);
    this.hasMany(models.Argument);
    this.belongsTo(models.Site);
  }

  User.prototype.authenticate = function (password) {
    var method = config.get('security.passwordHashing.currentMethod');
    if (!this.passwordHash) {
      log('user %d has no passwordHash', this.id);
      return false;
    } else {
      var hash = JSON.parse(this.passwordHash);
      var result = Password[method].compare(password, hash);
      log('authentication for user %d %s', this.id, result ? 'succeeded' : 'failed');
      return result;
    }
  }

  User.prototype.hasCompletedRegistration = function () {
    return this.email && this.complete // && this.isMember();
  }

  User.prototype.isUnknown = function () {
    return this.role === 'unknown';
  }

  User.prototype.isAnonymous = function () {
    return this.role === 'anonymous';
  }

  User.prototype.isMember = function () {
    return this.role !== 'unknown' && this.role !== 'anonymous';
  }

  User.prototype.isAdmin = function () {
    return this.role === 'admin' || this.role === 'su';
  }

  User.prototype.isLoggedIn = function () {
    return this.id && this.id !== 1 && this.isMember();
  }

  User.prototype.getUserVoteIdeaId = function () {
    let self = this;
    return db.Vote
      .findOne({where: {userId: self.id}})
      .then(vote => {
        return vote ? vote.ideaId : undefined;
      })
  }

  User.prototype.hasVoted = function () {
    let self = this;
    return db.Vote
      .findOne({where: {userId: self.id}})
      .then(vote => {
        return vote ? true : false;
      })
  }

  User.prototype.hasConfirmed = function () {
    let self = this;
    return db.Vote
      .findOne({where: {userId: self.id, confirmed: 1, confirmIdeaId: null}})
      .then(vote => {
        return vote ? true : false;
      })
  }


  User.prototype.willAnonymize = async function() {

    // dit is een stuk overzichtelijker met async await, al is dat niet consistent met de rest van de code; sorry daarvoor
    let self = this;
    let result = { user: self };
    
    try {

      if (self.siteId) {
        self.site = await db.Site.findByPk(self.siteId);
      }

      if (self.site) {

        // wat gaat er allemaal gewijzigd worden
        result.site = self.site;
        result.ideas = await self.getIdeas();
        result.articles = await self.getArticles();
        result.arguments = await self.getArguments();

        // TODO: for now the check is on active vote but this is wrong; a new 'vote had ended' param should be created
        let voteIsActive = self.site.isVoteActive();
        if (voteIsActive) {
          result.votes = await self.getVotes();
        } else {
          result.votes = [];
        }

      }

    } catch (err) {
      console.log(err);
      throw err;
    }

    return result;

  }

  User.prototype.doAnonymize = async function() {

    let self = this;
    let result = await self.willAnonymize();

    try {

      // anonymize

      let extraData = {};
      if (!self.site) throw Error('Site not found');
      if (self.site.config.users && self.site.config.users.extraData) {
        Object.keys(self.site.config.users.extraData).map( key => extraData[key] = null );
      }
      
      await self.update({
        idpUser: null,
        role: 'anonymous',
        passwordHash: null,
        listableByRole: 'editor',
        detailsViewableByRole: 'editor',
        viewableByRole: 'admin',
        email: null,
        nickName: null, 
        firstName: ( config.users && config.users.anonymize && config.users.anonymize.firstName ) || 'Gebruiker',
        lastName: ( config.users && config.users.anonymize && config.users.anonymize.lastName ) || 'verwijderd',
        gender: null,
        zipCode: null,
        postcode: null,
        suffix: null,
        houseNumber: null,
        city: null,
        streetName: null,
        phoneNumber: null,
        extraData,
        signedUpForNewsletter: 0,
        lastLogin: '1970-01-01T00:00:00.000Z',
        isNotifiedAboutAnonymization: null,
      })

      // remove existing votes
      if (result.votes && result.votes.length) {
        for (const vote of result.votes) {
          await vote.destroy();
        };
      }
      
    } catch (err) {
      console.log(err);
      throw err;
    }

    return result;

  }

  User.auth = User.prototype.auth = {
    listableBy: 'moderator',
    viewableBy: 'all',
    createableBy: 'moderator',
    updateableBy: ['moderator', 'owner'],
    deleteableBy: ['moderator', 'owner'],

    canCreate: function(user, self) {

      // copy the base functionality
      self = self || this;

      if (!user) user = self.auth && self.auth.user;
      if (!user || !user.role) user = { role: 'all' };

      let valid = userHasRole(user, self.auth && self.auth.updateableBy, self.id);

      // extra: geen acties op users met meer rechten dan je zelf hebt
      valid = valid && (!self.role || userHasRole(user, self.role));

      return valid;

    },

    canUpdate: function(user, self) {

      // copy the base functionality
      self = self || this;

      if (!user) user = self.auth && self.auth.user;
      if (!user || !user.role) user = { role: 'all' };

      let valid = userHasRole(user, self.auth && self.auth.updateableBy, self.id);

      // extra: isOwner through user on different site
      valid = valid || ( self.idpUser.identifier && self.idpUser.identifier == user.idpUser.identifier );

      // extra: geen acties op users met meer rechten dan je zelf hebt
      valid = valid && userHasRole(user, self.role);

      return valid;

    },

    canDelete: function(user, self) {

      // copy the base functionality
      self = self || this;

      if (!user) user = self.auth && self.auth.user;
      if (!user || !user.role) user = { role: 'all' };

      let valid = userHasRole(user, self.auth && self.auth.updateableBy, self.id);

      // extra: geen acties op users met meer rechten dan je zelf hebt
      valid = valid && userHasRole(user, self.role);

      return valid;

    },

  }

  return User;

  function beforeValidateHook(instance, options) {

    return new Promise((resolve, reject) => {

      if (instance.siteId && !instance.config) {
        db.Site.findByPk(instance.siteId)
          .then(site => {
            instance.config = merge.recursive(true, config, site.config);
            return site;
          })
          .then(site => {
            return resolve();
          }).catch(err => {
            throw err;
          })
      } else {
        instance.config = config;
        return resolve();
      }

    });

  }

};
