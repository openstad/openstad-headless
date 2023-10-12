const Sequelize = require('sequelize');
const apiConfig = require('config');
const merge = require('merge');

module.exports = {

  type: Sequelize.DataTypes.JSON,
    allowNull: false,
    defaultValue: {},
    get: function () {
      let value = this.getDataValue('config');
      return parseConfig(value);
    },
    set: function (value) {
      var currentconfig = this.getDataValue('config');
      value = value || {};
      value = merge.recursive(true, currentconfig, value);
      this.setDataValue('config', parseConfig(value));
    },
    auth: {
      viewableBy: 'editor',
      updateableBy: 'editor',
    },

};

function configOptions() {
  // definition of possible config values
  // todo: formaat gelijktrekken met sequelize defs
  // todo: je zou ook opties kunnen hebben die wel een default hebbe maar niet editable zijn? apiUrl bijv. Of misschien is die afgeleid
  return {

    allowedDomains: {
      type: 'arrayOfStrings',
      default: [
        'openstad-api.amsterdam.nl'
      ]
    },

    project: {
      type: 'object',
      subset: {
        endDate: {
          type: 'string', // todo: add date type
          default: null,
        },
        endDateNotificationSent: {
          type: 'boolean',
          default: false,
        },
        projectHasEnded: {
          type: 'boolean',
          default: false,
        },
      },
    },

    anonymize: {
      type: 'object',
      subset: {
        anonymizeUsersXDaysAfterEndDate: {
          type: 'int',
          default: 60,
        },
        warnUsersAfterXDaysOfInactivity: {
          type: 'int',
          default: 770,
        },
        anonymizeUsersAfterXDaysOfInactivity: {
          type: 'int',
          default: 860,
        },
        inactiveWarningEmail: {
          type: 'object',
          subset: {
            subject: {
              type: 'string',
              default: 'We gaan je account verwijderen',
            },
            template: {
              type: 'string',
              default: `Beste {{DISPLAYNAME}},<br/>\
<br/>\
Je bent al een tijd niet actief geweest op de website <a href="{{URL}}">{{URL}}</a>. We willen niet onnodig je gegevens blijven bewaren, en gaan die daarom verwijderen.<br/>\
<br/>\
Dat betekent dat een eventuele bijdrage die je hebt geleverd op de website, bijvoorbeeld inzendingen en/of reacties, geanonimiseerd worden.<br/>\
<br/>\
Wil je dit liever niet? Dan hoef je alleen een keer in te loggen op de website om je account actief te houden. Doe dit wel voor {{ANONYMIZEDATE}}, want anders gaan we op die dag je gegevens verwijderen.<br/>\
<br/>\
<br/>\
<em>Dit is een geautomatiseerde email.</em>`,
            },
          },
        },
      },
    },

    basicAuth: {
      type: 'object',
      subset: {
        active: {
          type: 'boolean',
          default: false,
        },
        user: {
          type: 'string',
          default: 'openstad',
        },
        password: {
          type: 'string',
          default: 'LqKNcKC7',
        },
      }
    },

    cms: {
      type: 'object',
      subset: {
        url: {
          type: 'string',
          default: 'https://openstad-api.amsterdam.nl',
        },
        hostname: {
          type: 'string',
          default: 'openstad-api.amsterdam.nl',
        },
        'after-login-redirect-uri': {
          type: 'string',
          default: '/oauth/login?jwt=[[jwt]]',
        },
        "redirectURI": {
          type: 'string',
          default: undefined,
        },
        "widgetDisplaySettings": {
          "type": "object",
          "subset": {
            "beta": {
              "type": "boolean",
              "default": false
            },
            "deprecated": {
              "type": "boolean",
              "default": false
            },
            "visibleWidgets": {
              "type": "arrayOfStrings",
              "default": []
            }
          }
        }
      }
    },

    notifications: {
      type: 'object',
      subset: {
        fromAddress: {
          type: 'string', // todo: add type email/list of emails
          default: 'EMAIL@NOT.DEFINED',
        },
        projectmanagerAddress: {
          type: 'string', // todo: add type email/list of emails
          default: 'EMAIL@NOT.DEFINED',
        },
        projectadminAddress: {
          type: 'string', // todo: add type email/list of emails
          default: apiConfig.notifications.admin.toEmailAddress,
        },
      },
    },

    email: {
      type: 'object',
      subset: {
        projectaddress: {
          type: 'string', // todo: add type email/list of emails
          default: 'EMAIL@NOT.DEFINED',
        },
        thankyoumail: {
          type: 'object',
          subset: {
            from: {
              type: 'string', // todo: add type email/list of emails
              default: 'EMAIL@NOT.DEFINED',
            },
          }
        }
      }
    },
    'oauth': {
      // to be removed
    },

    'auth': {
      type: 'object',
      subset: {
        default: {
          type: 'string', // todo: add type email/list of emails
          default: 'openstad',
        },
        provider: {
          type: 'objectsInObject',
          //            subset: {
          //              "auth-server-url": {
          //                type: 'string',
          //              },
          //              "auth-client-id": {
          //                type: 'string',
          //              },
          //              "auth-client-secret": {
          //                type: 'string',
          //              },
          //              "auth-server-login-path": {
          //                type: 'string',
          //              },
          //              "auth-server-exchange-code-path": {
          //                type: 'string',
          //              },
          //              "auth-server-get-user-path": {
          //                type: 'string',
          //              },
          //              "auth-server-logout-path": {
          //                type: 'string',
          //              },
          //              "after-login-redirect-uri": {
          //                type: 'string',
          //              }
          //            }
        }
      },
    },
    ideas: {
      type: 'object',
      subset: {
        canAddNewIdeas: {
          type: 'boolean',
          default: true,
        },
        titleMinLength: {
          type: 'int',
          default: 10,
        },
        titleMaxLength: {
          type: 'int',
          default: 50,
        },
        summaryMinLength: {
          type: 'int',
          default: 20,
        },
        summaryMaxLength: {
          type: 'int',
          default: 140,
        },
        descriptionMinLength: {
          type: 'int',
          default: 140,
        },
        descriptionMaxLength: {
          type: 'int',
          default: 5000,
        },
        minimumYesVotes: {
          type: 'int',
          default: 100,
        },
        showVoteButtons: {
          // momenteel alleen voor de kaart-app
          type: 'boolean',
          default: true,
        },
        canEditAfterFirstLikeOrComment: {
          type: 'boolean',
          default: false,
        },
        feedbackEmail: {
          from: {
            type: 'string', // todo: add type email/list of emails
            default: 'EMAIL@NOT.DEFINED',
          },
          subject: {
            type: 'string',
            default: undefined,
          },
          inzendingPath: {
            type: 'string',
            default: "/PATH/TO/PLAN/[[ideaId]]",
          },
          template: {
            type: 'string',
            default: undefined,
          },
        },
        conceptEmail: {
          from: {
            type: 'string', // todo: add type email/list of emails
            default: 'EMAIL@NOT.DEFINED',
          },
          subject: {
            type: 'string',
            default: undefined,
          },
          inzendingPath: {
            type: 'string',
            default: "/PATH/TO/PLAN/[[ideaId]]",
          },
          template: {
            type: 'string',
            default: undefined,
          },
        },
        conceptToPublishedEmail: {
          from: {
            type: 'string', // todo: add type email/list of emails
            default: 'EMAIL@NOT.DEFINED',
          },
          subject: {
            type: 'string',
            default: undefined,
          },
          inzendingPath: {
            type: 'string',
            default: "/PATH/TO/PLAN/[[ideaId]]",
          },
          template: {
            type: 'string',
            default: undefined,
          },
        },
        extraDataMustBeDefined: {
          type: 'boolean',
          default: false,
        },
        extraData: {
          type: 'object',
        },
        types: {
          type: 'arrayOfObjects',
          default: [],
          subset: {
            name: {
              type: 'string',
              default: 'noName',
            },
            label: {
              type: 'label',
              default: 'Dit is niets',
            },
            auth: {
              type: 'object', // TODO: werk dit uit
            },
            mapIcon: {
              type: 'string',
              default: '',
            },
            listIcon: {
              type: 'string',
              default: '',
            },
            buttonIcon: {
              type: 'string',
              default: '',
            },
            buttonLabel: {
              type: 'string',
              default: '',
            },
            backgroundColor: {
              type: 'string',
              default: '#164995',
            },
            textColor: {
              type: 'string',
              default: 'white',
            },
            // TODO: deze komen uit cms thema; werk dat verder uit
            "flag": {type: 'string', default: ''},
            "mapUploadedFlag": {type: 'string', default: ''},
            "mapFlagWidth": {type: 'string', default: ''},
            "mapFlagHeight": {type: 'string', default: ''},
            "Initialavailablebudget": {type: 'int', default: 0},
            "minimalBudgetSpent": {type: 'int', default: 0},
          }
        },
        automaticallyUpdateStatus: {
          isActive: {
            type: 'boolean',
            default: false,
          },
          afterXDays: {
            type: 'int',
            default: 90,
          },
        },
      }
    },
    comments: {
      type: 'object',
      subset: {
        new: {
          type: 'object',
          subset: {
            anonymous: {
              type: 'object',
              subset: {
                redirect: {
                  type: 'string',
                  default: null,
                },
                notAllowedMessage: {
                  type: 'string',
                  default: null,
                }
              }
            },
            showFields: {
              type: 'arrayOfStrings', // eh...
              default: ['zipCode', 'displayName'],
            }
          }
        },

        isClosed: {
          type: 'boolean',
          default: false,
        },

        closedText: {
          type: 'string',
          default: 'De reactiemogelijkheid is gesloten, u kunt niet meer reageren',
        },

      }
    },
    users: {
      type: 'object',
      subset: {
        extraDataMustBeDefined: {
          type: 'boolean',
          default: false,
        },
        extraData: {
          type: 'object',
        },
        canCreateNewUsers: {
          type: 'boolean',
          default: true,
        },
        allowUseOfNicknames: {
          type: 'boolean',
          default: false,
        },
      },
    },
    votes: {
      type: 'object',
      subset: {

        isViewable: {
          type: 'boolean',
          default: false,
        },

        isActive: {
          type: 'boolean',
          default: null,
        },

        isActiveFrom: {
          type: 'string',
          default: undefined,
        },

        isActiveTo: {
          type: 'string',
          default: undefined,
        },

        requiredUserRole: {
          type: 'string',
          default: 'member',
        },

        mustConfirm: {
          type: 'boolean',
          default: false,
        },

        withExisting: {
          type: 'enum',
          values: ['error', 'replace', 'merge'],
          default: 'error',
        },

        voteType: {
          type: 'enum',
          values: ['likes', 'count', 'budgeting', 'count-per-theme', 'budgeting-per-theme'],
          default: 'likes',
        },

        voteValues: {
          type: 'arrayOfObjects',
          default: [
            {
              label: 'voor',
              value: 'yes'
            },
            {
              label: 'tegen',
              value: 'no'
            },
          ],
        },

        maxIdeas: {
          type: 'int',
          default: 100,
        },

        minIdeas: {
          type: 'int',
          default: 1,
        },

        minBudget: {
          type: 'int',
          default: undefined,
        },

        maxBudget: {
          type: 'int',
          default: undefined,
        },

        themes: {
          type: 'objectList',
          elementSubset: {
            minBudget: {
              type: 'int',
              default: undefined,
            },
            maxBudget: {
              type: 'int',
              default: undefined,
            },
          }
        },

      },
    },

    articles: {
      type: 'object',
      subset: {
        canAddNewArticles: {
          type: 'boolean',
          default: true,
        },
        titleMinLength: {
          type: 'int',
          default: 10,
        },
        titleMaxLength: {
          type: 'int',
          default: 50,
        },
        summaryMinLength: {
          type: 'int',
          default: 20,
        },
        summaryMaxLength: {
          type: 'int',
          default: 140,
        },
        descriptionMinLength: {
          type: 'int',
          default: 140,
        },
        descriptionMaxLength: {
          type: 'int',
          default: 5000,
        },
        minimumYesVotes: {
          type: 'int',
          default: 100,
        },
        canEditAfterFirstLikeOrComment: {
          type: 'boolean',
          default: false,
        },
        feedbackEmail: {
          from: {
            type: 'string', // todo: add type email/list of emails
            default: 'EMAIL@NOT.DEFINED',
          },
          subject: {
            type: 'string',
            default: 'Bedankt voor je artikel',
          },
          inzendingPath: {
            type: 'string',
            default: "/PATH/TO/ARTICLE/[[articleId]]",
          },
          template: {
            type: 'string',
            default: undefined,
          },
        },
        extraDataMustBeDefined: {
          type: 'boolean',
          default: false,
        },
        extraData: {
          type: 'object',
        }
      }
    },

    polls: {
      type: 'object',
      subset: {
        canAddPolls: {
          type: 'boolean',
          default: false,
        },
        requiredUserRole: {
          type: 'string',
          default: 'anonymous',
        },
      },
    },

    newslettersignup: {
      type: 'object',
      subset: {
        isActive: {
          type: 'boolean',
          default: false,
        },
        autoConfirm: {
          type: 'boolean',
          default: false,
        },
        "confirmationEmail": {
          type: 'object',
          subset: {
            from: {
              type: 'string', // todo: add type email/list of emails
              default: 'EMAIL@NOT.DEFINED',
            },
            subject: {
              type: 'string',
              default: undefined,
            },
            url: {
              type: 'string',
              default: "/PATH/TO/CONFIRMATION/[[token]]",
            },
            template: {
              type: 'string',
              default: undefined,
            },
          },
        },
      },
    },

    host: {
      status: null,
    },

    "ignoreBruteForceIPs": {
      type: 'arrayOfStrings',
      default: []
    },

  }
}

function parseConfig(config) {


  try {
    if (typeof config == 'string') {
      config = JSON.parse(config);
    }
  } catch (err) {
    config = {};
  }

  let options = configOptions();

  config = checkValues(config, options)
  
  return config;

  function checkValues(value, options) {

    let newValue = {};
    Object.keys(options).forEach(key => {

      // backwards compatibility op oauth settings, voordat er een onderscheid in types was
      if (key == 'oauth' && value[key] && !value[key].default && (value[key]['auth-server-url'] || value[key]['auth-client-id'] || value[key]['auth-client-secret'] || value[key]['auth-server-login-path'] || value[key]['auth-server-exchange-code-path'] || value[key]['auth-server-get-user-path'] || value[key]['auth-server-logout-path'] || value[key]['after-login-redirect-uri'])) {
        // dit is een oude
        value[key] = {default: value[key]};
      }

      // backwards compatibility op auth settings: dat heette oauth en zag er anders uit
      if (key == 'auth' && !value[key]) {
        value.auth = {
          provider: { ...value.oauth },
        };
        if (value.auth.provider.default) {
          value.auth.provider.openstad = value.auth.provider.default;
          delete value.auth.provider.default;
        }
      }

      // backwards compatibility op notifications settings
      if (key == 'notifications' && value[key]) {
        if (value[key].from && ( !(value[key].fromAddress) || value[key].fromAddress == options[key].subset.fromAddress.default )) {
          value[key].fromAddress = value[key].from;
          value[key].from = undefined;
        }
        if (value[key].to) {
          if ( !value[key].projectmanagerAddress || value[key].projectmanagerAddress == options[key].subset.projectmanagerAddress.default ) {
            value[key].projectmanagerAddress = value[key].to || apiConfig.notifications.admin.toEmailAddress || options[key].subset.projectmanagerAddress.default;
          }
          if ( !value[key].projectadminAddress || value[key].projectadminAddress == options[key].subset.default ) {
            value[key].projectadminAddress = apiConfig.notifications.admin.toEmailAddress || value[key].projectmanagerAddress;
          }
          value[key].to = undefined;
        }
      }

      // backwards compatibility projectHasEnded
      if (key == 'project') {
        value[key] = value[key] || {};
        if (typeof value[key].projectHasEnded == 'undefined' && typeof value.projectHasEnded != 'undefined') {
          // dit is een oude
          value[key].projectHasEnded = value.projectHasEnded;
          delete value.projectHasEnded
        }
      }

      // TODO: 'arrayOfObjects' met een subset

      // objects in objects
      if (options[key].type == 'object' && options[key].subset) {
        let temp = checkValues(value[key] || {}, options[key].subset); // recusion
        return newValue[key] = Object.keys(temp) ? temp : undefined;
      }

      // objects in objects
      if (options[key].type == 'objectsInObject' && options[key].subset && value[key]) {
        newValue[key] = {};
        let elementkeys = Object.keys(value[key]);
        for (let i = 0; i < elementkeys.length; i++) {
          let elementkey = elementkeys[i];
          if (value[key][elementkey] == null) {
          } else {
            let temp = checkValues(value[key][elementkey] || {}, options[key].subset); // recusion
            newValue[key][elementkey] = Object.keys(temp) ? temp : undefined;
          }
        }
        return newValue[key];
      }

      // TODO: in progress
      if (typeof value[key] != 'undefined' && value[key] != null) {
        if (options[key].type && options[key].type === 'int' && parseInt(value[key]) !== value[key]) {
          throw new Error(`project.config: ${key} must be an int`);
        }
        if (options[key].type && options[key].type === 'string' && typeof value[key] !== 'string') {
          throw new Error(`project.config: ${key} must be an string`);
        }
        if (options[key].type && options[key].type === 'boolean' && typeof value[key] !== 'boolean') {
          throw new Error(`project.config: ${key} must be an boolean ${value[key]}, ${options}, ${typeof value[key]}`);
        }
        if (options[key].type && options[key].type === 'object' && typeof value[key] !== 'object') {
          throw new Error(`project.config: ${key} must be an object`);
        }
        if (options[key].type && options[key].type === 'arrayOfStrings' && !(typeof value[key] === 'object' && Array.isArray(value[key]) && !value[key].find(val => typeof val !== 'string'))) {
          throw new Error(`project.config: ${key} must be an array of strings`);
        }
        if (options[key].type && options[key].type === 'arrayOfObjects' && !(typeof value[key] === 'object' && Array.isArray(value[key]) && !value[key].find(val => typeof val !== 'object'))) {
          throw new Error(`project.config: ${key} must be an array of objects`);
        }
        if (options[key].type && options[key].type === 'enum' && options[key].values && options[key].values.indexOf(value[key]) == -1) {
          throw new Error(`project.config: ${key} has an invalid value`);
        }
        return newValue[key] = value[key];
      }

      // default?
      if (typeof options[key].default != 'undefined') {
        return newValue[key] = options[key].default
      }

      // set to null
      if (value[key] == null) {
        newValue[key] = value[key] = undefined;
      }

      // allowNull?
      if (!newValue[key] && options[key].allowNull === false) {
        throw new Error(`project.config: $key must be defined`);
      }

      return newValue[key];

    });

    // voor nu mag je er in stoppen wat je wilt; uiteindelijk moet dat zo gaan werken dat je alleen bestaande opties mag gebruiken
    // dit blok kan dan weg
    Object.keys(value).forEach(key => {
      if (typeof newValue[key] == 'undefined') {
        newValue[key] = value[key];
      }
    });

    return newValue;

  }

}
