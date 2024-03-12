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
        default: apiConfig.mail.from,
      },
      projectmanagerAddress: {
        type: 'string', // todo: add type email/list of emails
        default: 'EMAIL@NOT.DEFINED',
      },
      projectadminAddress: {
        type: 'string', // todo: add type email/list of emails
        default: apiConfig.notifications.admin.emailAddress,
      },
      sendEndDateNotifications: {
        type: 'object',
        subset: {
          XDaysBefore: {
            type: 'int',
            default: 7,
          },
          subject: {
            type: 'string',
            default: 'Sluitingsdatum project nadert',
          },
          template:  {
            type: 'string',
            default: `De website <a href="{{URL}}">{{URL}}</a> nadert de ingestelde sluitingsdatum. De sluitingsdatum is ingesteld op <strong>{{ENDDATE}}</strong>.<br/>\
<br/>\
<strong>Klopt dit nog? Het is belangrijk dat de sluitingsdatum goed is ingesteld.</strong> Daarmee wordt gezorgd dat gebruikers vanaf dat moment hun account kunnen verwijderen, zonder dat stemmen of likes ongeldig gemaakt worden. De sluitingsdatum wordt ook als referentie gebruikt om op een later moment alle gebruikersgegevens te anonimiseren.<br/>\
<br/>\
De webmaster zorgt ervoor dat de website gesloten wordt, handmatig of automatisch. Neem contact op om af te spreken wanneer dit precies moet gebeuren, als je dat nog niet gedaan hebt: <a href="mailto:{{WEBMASTER_EMAIL}}">{{WEBMASTER_EMAIL}}</a>.<br/>\
<br/>\
Als de webmaster de website gesloten heeft is deze in principe nog wel te bezoeken, maar afhankelijk van het project kunnen er geen nieuwe plannen ingediend worden, geen reacties meer worden geplaatst, geen nieuwe stemmen of likes uitgebracht worden, en kunnen er geen nieuwe gebruikers zich aanmelden.<br/>\
<br/>\
<br/>\
<br/>\
<em>Dit is een geautomatiseerde email.</em><br/>\
`
          },
        },
      },
    },
  },

  resources: {
    type: 'object',
    subset: {
      feedbackEmail: {
        from: {
          type: 'string', // todo: add type email/list of emails
          default: 'EMAIL@NOT.DEFINED',
        },
        subject: {
          type: 'string',
          default: 'Bedankt voor je inzending',
        },
        inzendingPath: {
          type: 'string',
          default: "/PATH/TO/PLAN/[[resourceId]]",
        },
        template: {
          type: 'string',
          default: `NO TEMPLATE DEFINED`,
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
          default: "/PATH/TO/PLAN/[[resourceId]]",
        },
        template: {
          type: 'string',
          default: `NO TEMPLATE DEFINED`,
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
          default: "/PATH/TO/PLAN/[[resourceId]]",
        },
        template: {
          type: 'string',
          default: `NO TEMPLATE DEFINED`,
        },
        attachments: {
          type: 'arrayOfStrings',
          default: []
        },
      },
    },
  },

  styling: { // used by emails
    type: 'object',
    subset: {
      logo: {
        type: 'string',
        default: '',
      },
    },
  }

}
