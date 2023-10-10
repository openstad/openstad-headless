const apiConfig = require('config');

module.exports = {

  anonymize: {
    type: 'object',
    subset: {
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
          attachments: {
            type: 'arrayOfStrings',
            default: []
          },
        },
      },
    },
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
        // default: apiConfig.notifications.admin.emailAddress,
      },
    },
  },

  ideas: {
    type: 'object',
    subset: {
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
        attachments: {
          type: 'arrayOfStrings',
          default: []
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
        attachments: {
          type: 'arrayOfStrings',
          default: []
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
        attachments: {
          type: 'arrayOfStrings',
          default: []
        },
      },
    },
  },
  
  articles: {
    type: 'object',
    subset: {
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
        attachments: {
          type: 'arrayOfStrings',
          default: []
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

  newslettersignup: {
    type: 'object',
    subset: {
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
          attachments: {
            type: 'arrayOfStrings',
            default: []
          },
        },
      },
    },
  },

}

