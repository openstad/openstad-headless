require('dotenv').config();

const URL = require('node:url');

// use environment variables to configure the api server, either as such or in an `.env` file
// extra possible env vars here are for backwards compatibility, as is the optional use of a local.js file

// these values, if they exist, are JSON strings
let AUTH = process.env.AUTH; try { AUTH = JSON.parse(AUTH); } catch(err) {}
let AUTH_JWTSECRET = process.env.AUTH_JWTSECRET; try { AUTH_JWTSECRET = JSON.parse(AUTH_JWTSECRET); } catch(err) {}
let AUTH_ADAPTER = process.env.AUTH_ADAPTER; try { AUTH_ADAPTER = JSON.parse(AUTH_ADAPTER); } catch(err) {}
let AUTH_ADAPTER_OPENSTAD = process.env.AUTH_ADAPTER_OPENSTAD; try { AUTH_ADAPTER_OPENSTAD = JSON.parse(AUTH_ADAPTER_OPENSTAD); } catch(err) {}
let AUTH_ADAPTER_OIDC = process.env.AUTH_ADAPTER_OIDC; try { AUTH_ADAPTER_OIDC = JSON.parse(AUTH_ADAPTER_OIDC); } catch(err) {}
let AUTH_PROVIDER = process.env.AUTH_PROVIDER; try { AUTH_PROVIDER = JSON.parse(AUTH_PROVIDER); } catch(err) {}
let AUTH_PROVIDER_DEFAULT = process.env.AUTH_PROVIDER_DEFAULT; try { AUTH_PROVIDER_DEFAULT = JSON.parse(AUTH_PROVIDER_DEFAULT); } catch(err) {}
let AUTH_PROVIDER_OPENSTAD = process.env.AUTH_PROVIDER_OPENSTAD; try { AUTH_PROVIDER_OPENSTAD = JSON.parse(AUTH_PROVIDER_OPENSTAD); } catch(err) {}
let AUTH_PROVIDER_ANONYMOUS = process.env.AUTH_PROVIDER_ANONYMOUS; try { AUTH_PROVIDER_ANONYMOUS = JSON.parse(AUTH_PROVIDER_ANONYMOUS); } catch(err) {}
let AUTH_FIXEDAUTHTOKENS = process.env.AUTH_FIXEDAUTHTOKENS  || process.env.API_AUTHORIZATION_FIXEDAUTHTOKENS; try { AUTH_FIXEDAUTHTOKENS = JSON.parse(AUTH_FIXEDAUTHTOKENS); } catch(err) {}
let RESOURCES_LOCATION = process.env.RESOURCES_LOCATION; try { RESOURCES_LOCATION = JSON.parse(RESOURCES_LOCATION); } catch(err) {}

// this value can be derived
if (!process.env.DOMAIN && !process.env.API_DOMAIN) {
  let url = URL.parse( process.env.URL || process.env.API_URL || '' );
  process.env.DOMAIN = url && url.hostname;
}

let defaultConfig = {

	projectName: process.env.NAME || process.env.API_NAME || 'OpenStad API',

	url: process.env.URL || process.env.API_URL || 'https://openstad.org',
	domain: process.env.DOMAIN || process.env.API_DOMAIN || 'openstad.org',

  database   : {
    host: process.env.DB_HOST || process.env.API_DB_HOST || process.env.API_DATABASE_HOST || 'localhost',
    user: process.env.DB_USERNAME || process.env.API_DB_USERNAME || process.env.API_DATABASE_USER || 'no-user',
    password: process.env.DB_PASSWORD || process.env.API_DB_PASSWORD || process.env.API_DATABASE_PASSWORD || 'no-password',
    database: process.env.DB_NAME || process.env.API_DB_NAME || process.env.API_DATABASE_DATABASE || 'openstad-api',
    dialect: process.env.DB_DIALECT || process.env.API_DB_DIALECT || process.env.API_DATABASE_DIALECT || 'mysql',
    port: parseInt(process.env.DB_PORT || process.env.API_DB_PORT || process.env.API_DATABASE_PORT) || 3306,
    maxPoolSize: parseInt(process.env.DB_MAX_POOL_SIZE || process.env.API_DB_MAX_POOL_SIZE || process.env.MAX_POOL_SIZE) || 5,
    mysqlSTGeoMode: process.env.DB_MYSQL_CA_CERT || process.env.API_DB_MYSQL_CA_CERTMYSQL_CA_CERT || process.env.MYSQL_ST_GEO_MODE,
    mysqlCaCert: process.env.DB_MYSQL_CA_CERT || process.env.API_DB_MYSQL_CA_CERT || process.env.MYSQL_CA_CERT,
    multipleStatements: true,
    requireSsl: process.env.DB_REQUIRE_SSL || false,
    authMethod: process.env.DB_AUTH_METHOD,
  },

	express: {
		port: process.env.PORT || process.env.API_PORT || process.env.API_EXPRESS_PORT || 8082,
		rendering: {
			"templateDirs": ["html/appName"],
			"globals" : {}
		},
		"middleware": [
			"./middleware/log",
			{ "route": "/api", "router": "./routes/api" },
			{ "route": "/auth", "router": "./routes/auth" },
			{ "route": "/notification", "router": "./routes/notification" },
      { "route": "/stats", "router": "./routes/stats" },
      { "route": "/widget", "router": "./routes/widget" },
		]
	},

	mail: {
	  from: process.env.FROM_EMAIL_ADDRESS || process.env.API_EMAILADDRESS || 'email@not.set',
		method: 'smtp',
		transport: {
			smtp: {
				pool: false,
				direct: false,
        host: process.env.SMTP_HOST || process.env.API_MAIL_TRANSPORT_SMTP_HOST || null,
        port: process.env.SMTP_PORT || process.env.API_MAIL_TRANSPORT_SMTP_PORT || null,
        secure: JSON.parse(process.env.SMTP_SECURE || process.env.API_MAIL_TRANSPORT_SMTP_SECURE || null),
				auth: {
          user: process.env.SMTP_USERNAME || process.env.API_MAIL_TRANSPORT_SMTP_AUTH_USER || null,
          pass: process.env.SMTP_PASSWORD || process.env.API_MAIL_TRANSPORT_SMTP_AUTH_PASS || null,
				}
			}
		}
	},

	notifications: {
		admin: {
			toEmailAddress: process.env.NOTIFICATIONS_ADMIN_TO_EMAILADDRESS || process.env.API_NOTIFICATIONS_ADMIN_TO_EMAILADDRESS || process.env.API_NOTIFICATIONS_ADMIN_EMAILADDRESS || null,
		},
    sendEndDateNotifications: {
      XDaysBefore: process.env.NOTIFICATIONS_SENDENDDATENOTIFICATIONS_XDAYSBEFORE || process.env.API_NOTIFICATIONS_SENDENDDATENOTIFICATIONSXDAYSBEFORE || 7,
      subject:  process.env.NOTIFICATIONS_SENDENDDATENOTIFICATIONS_SUBJECT ||'Sluitingsdatum project nadert',
      template:  process.env.NOTIFICATIONS_SENDENDDATENOTIFICATIONS_TEMPLATE || `De website <a href="{{URL}}">{{URL}}</a> nadert de ingestelde sluitingsdatum. De sluitingsdatum is ingesteld op <strong>{{ENDDATE}}</strong>.<br/>\
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

  messageStreaming: {
    redis: {
      url: process.env.MESSAGESTREAMING_REDIS_URL,
    }
  },

  auth: AUTH || {
    jwtSecret: AUTH_JWTSECRET || 'REPLACE THIS VALUE!!',
    adapter: AUTH_ADAPTER || {
      openstad: AUTH_ADAPTER_OPENSTAD || {
        modulePath: process.env.AUTH_ADAPTER_OPENSTAD_MODULEPATH || './src/adapter/openstad',
        serverUrl: process.env.AUTH_ADAPTER_OPENSTAD_SERVERURL ||  process.env.AUTH_APP_URL ||  process.env.AUTH_API_URL || null,
        serverUrlInternal: process.env.AUTH_ADAPTER_OPENSTAD_SERVERURL_INTERNAL ||  process.env.AUTH_ADAPTER_OPENSTAD_SERVERURL ||  process.env.AUTH_API_URL || null,
        userMapping: process.env.AUTH_ADAPTER_OPENSTAD_USERMAPPING || JSON.stringify({
          identifier: process.env.AUTH_ADAPTER_OPENSTAD_USERMAPPING_IDENTIFIER || 'user => user.user_id || user.id',
          name: process.env.AUTH_ADAPTER_OPENSTAD_USERMAPPING_NAME || "user => `${user.name || ''}`.trim() || null",
          email: process.env.AUTH_ADAPTER_OPENSTAD_USERMAPPING_EMAIL || "user => user.email == '' ? null : user.email",
          address: process.env.AUTH_ADAPTER_OPENSTAD_USERMAPPING_ADDRESS || "user => `${user.streetName || ''} ${user.houseNumber || ''} ${user.suffix || ''}`.trim() || null",
          role: process.env.AUTH_ADAPTER_OPENSTAD_USERMAPPING_ROLE || "user => user.role || ( user.roles && user.roles[0] && user.roles[0] && user.roles[0].role && user.roles[0].role.name ) || ((user.email || user.phoneNumber || user.hashedPhoneNumber) ? 'member' : 'anonymous')",
        }),
      },
      oidc: AUTH_ADAPTER_OIDC || {
        modulePath: process.env.AUTH_ADAPTER_OIDC_MODULEPATH || './src/adapter/oidc',
      }
    },
    provider: AUTH_PROVIDER || {
      default: AUTH_PROVIDER_DEFAULT || {
        adapter: process.env.AUTH_PROVIDER_DEFAULT_ADAPTER || 'openstad',
      },
      openstad: AUTH_PROVIDER_OPENSTAD || {
        adapter: process.env.AUTH_PROVIDER_OPENSTAD_ADAPTER || 'openstad',
      },
      anonymous: AUTH_PROVIDER_ANONYMOUS || {
        adapter: process.env.AUTH_PROVIDER_ANONYMOUS_ADAPTER || 'openstad',
      },
    },
    fixedAuthTokens: AUTH_FIXEDAUTHTOKENS || [],
  },

	debug: process.env.DEBUG || process.env.API_DEBUG || false,
	locale: process.env.LOCALE || process.env.API_LOCALE || 'nl',
	logging: process.env.LOGGING || process.env.API_LOGGING || 'app:*,-app:db:query',
	timeZone : process.env.TIMEZONE ||process.env.API_TIMEZONE || 'Europe/Amsterdam',
  templateSource: process.env.TEMPLATE_SOURCE || 'https://cdn.jsdelivr.net/gh/Amsterdam/openstad-ecosystem-templates/site/index.json',
  ignoreBruteForceIPs: process.env.IGNORE_BRUTE_FORCE_IPS || ( process.env.IGNORE_BRUTE_FORCE_IP ? [process.env.IGNORE_BRUTE_FORCE_IP] : [] ),
  
	resources: {
		descriptionMinLength: process.env.RESOURCES_DESCRIPTION_MIN_LENGTH || 140,
		descriptionMaxength: process.env.RESOURCES_DESCRIPTION_MAXENGTH || 5000,
		addNewResources: process.env.RESOURCES_ADD_NEW_RESOURCES || "open",
		duration: process.env.RESOURCES_DURATION || 90,
		minimumYesVotes: process.env.RESOURCES_MINIMUM_YES_VOTES || 100,
		anonymizeThreshold: process.env.RESOURCES_ANONYMIZE_THRESHOLD || 180,
		commentVoteThreshold: process.env.RESOURCES_COMMENT_VOTE_THRESHOLD || 0,
    location: RESOURCES_LOCATION || {
      isMandatory: process.env.RESOURCES_LOCATION_IS_MANDATORY || false,
    },
	},

  admin: {
    projectId: process.env.ADMIN_PROJECTID || 1,
	  domain: process.env.ADMIN_DOMAIN,
  },

  dev: {
    'Header-Access-Control-Allow-Origin': '*'
  }

}

module.exports = defaultConfig;
