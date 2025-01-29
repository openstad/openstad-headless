require('dotenv').config();
const fs = require('fs').promises;

async function create() {
  setupEnvVars()
  writeEnvFile()
}

async function setupEnvVars() {

  // herbruikbare waarden
  let BASE_PORT = process.env.BASE_PORT = parseInt(process.env.BASE_PORT) || 31400;

  let BASIC_AUTH_USER = process.env.BASIC_AUTH_USER = process.env.BASIC_AUTH_USER || 'openstad';
  let BASIC_AUTH_PASSWORD = process.env.BASIC_AUTH_PASSWORD = process.env.BASIC_AUTH_PASSWORD || 'openstad';

  process.env.FORCE_HTTP = process.env.FORCE_HTTP || '';
  let COOKIE_SECURE_OFF = process.env.FORCE_HTTP ? 'yes' : '';

  process.env.BASE_DOMAIN = process.env.BASE_DOMAIN || 'localhost'

  process.env.DB_HOST = process.env.DB_HOST || ''
  process.env.DB_USERNAME = process.env.DB_USERNAME || 'openstad';
  process.env.DB_PASSWORD = process.env.DB_PASSWORD || generateRandomToken({ length: 32 });
  process.env.DB_BASE_NAME = process.env.DB_BASE_NAME || ''
  process.env.DB_DIALECT = process.env.DB_DIALECT || 'mysql'
  process.env.DB_REQUIRE_SSL = process.env.DB_REQUIRE_SSL || false;
  process.env.DB_AUTH_METHOD = process.env.DB_AUTH_METHOD || '';

  process.env.MESSAGESTREAMING_REDIS_URL = process.env.MESSAGESTREAMING_REDIS_URL || '';

  let API_PORT = process.env.API_PORT = process.env.API_PORT || BASE_PORT + 10;
  let API_DOMAIN = process.env.API_DOMAIN = process.env.API_DOMAIN || ( process.env.BASE_DOMAIN == 'localhost' ? 'localhost:' + API_PORT : 'api.' + process.env.BASE_DOMAIN );
  let API_URL = process.env.API_URL = process.env.API_URL = process.env.API_URL || ( process.env.FORCE_HTTP ? 'http://' : 'https://' ) + API_DOMAIN;
  let API_FIXED_AUTH_KEY = process.env.API_FIXED_AUTH_KEY || process.env.AUTH_FIRST_LOGIN_CODE || generateRandomToken({ length: 2048 });
  let API_AUTH_FIXEDAUTHTOKENS = process.env.API_AUTH_FIXEDAUTHTOKENS = process.env.API_AUTH_FIXEDAUTHTOKENS || `[{"token":"${API_FIXED_AUTH_KEY}","userId":"1","authProvider":"openstad"}]`;

  let AUTH_PORT = process.env.AUTH_PORT = process.env.AUTH_PORT || BASE_PORT + 30;
  let AUTH_DOMAIN = process.env.AUTH_DOMAIN = process.env.AUTH_DOMAIN || ( process.env.BASE_DOMAIN == 'localhost' ? 'localhost:' + AUTH_PORT : 'auth.' + process.env.BASE_DOMAIN )
  let AUTH_URL = process.env.AUTH_URL = process.env.AUTH_URL || ( process.env.FORCE_HTTP ? 'http://' : 'https://' ) + AUTH_DOMAIN;
  let AUTH_JWT_SECRET = generateRandomToken({ length: 64 }); // TODO: wordt niet gebruikt
  let AUTH_ADMIN_CLIENT_ID = process.env.AUTH_ADMIN_CLIENT_ID = process.env.AUTH_ADMIN_CLIENT_ID || generateRandomToken({ length: 64 });
  let AUTH_ADMIN_CLIENT_SECRET = process.env.AUTH_ADMIN_CLIENT_SECRET = process.env.AUTH_ADMIN_CLIENT_SECRET || generateRandomToken({ length: 64 });
  let AUTH_FIRST_CLIENT_ID = process.env.AUTH_FIRST_CLIENT_ID = process.env.AUTH_FIRST_CLIENT_ID || generateRandomToken({ length: 64 });
  let AUTH_FIRST_CLIENT_SECRET = process.env.AUTH_FIRST_CLIENT_SECRET = process.env.AUTH_FIRST_CLIENT_SECRET || generateRandomToken({ length: 64 });

  let IMAGE_PORT_API = process.env.IMAGE_PORT_API = process.env.IMAGE_PORT_API || BASE_PORT + 50;
  let IMAGE_DOMAIN = process.env.IMAGE_DOMAIN = process.env.IMAGE_DOMAIN || ( process.env.BASE_DOMAIN == 'localhost' ? 'localhost:' + IMAGE_PORT_API : 'image.' + process.env.BASE_DOMAIN );
  let IMAGE_APP_URL = process.env.IMAGE_APP_URL = process.env.IMAGE_APP_URL || ( process.env.FORCE_HTTP ? 'http://' : 'https://' ) + IMAGE_DOMAIN;
  let IMAGE_PORT_IMAGE_SERVER = process.env.IMAGE_PORT_IMAGE_SERVER = process.env.IMAGE_PORT_IMAGE_SERVER || IMAGE_PORT_API + 1;
  let IMAGE_VERIFICATION_TOKEN = process.env.IMAGE_VERIFICATION_TOKEN = process.env.IMAGE_VERIFICATION_TOKEN || generateRandomToken({ length: 32 })

  let ADMIN_PORT = process.env.ADMIN_PORT = process.env.ADMIN_PORT || BASE_PORT + 70;
  let ADMIN_DOMAIN = process.env.ADMIN_DOMAIN = process.env.ADMIN_DOMAIN || ( process.env.BASE_DOMAIN == 'localhost' ? 'localhost:' + ADMIN_PORT : 'admin.' + process.env.BASE_DOMAIN );
  let ADMIN_URL = process.env.ADMIN_URL = process.env.ADMIN_URL || ( process.env.FORCE_HTTP ? 'http://' : 'https://' ) + ADMIN_DOMAIN;
  let ADMIN_COOKIE_SECRET = process.env.ADMIN_COOKIE_SECRET = process.env.ADMIN_COOKIE_SECRET || generateRandomToken({ length: 64 });

  let CMS_PORT = process.env.CMS_PORT = process.env.CMS_PORT || BASE_PORT + 90;
  let CMS_DOMAIN = process.env.CMS_DOMAIN = process.env.CMS_DOMAIN || ( process.env.BASE_DOMAIN == 'localhost' ? 'localhost:' + CMS_PORT : 'cms.' + process.env.BASE_DOMAIN );
  let CMS_URL = process.env.CMS_URL = process.env.CMS_URL || ( process.env.FORCE_HTTP ? 'http://' : 'https://' ) + CMS_DOMAIN;
  let CMS_OVERWRITE_URL = process.env.CMS_OVERWRITE_URL = process.env.CMS_OVERWRITE_URL || ( process.env.BASE_DOMAIN == 'localhost' ? 'http://localhost:' + CMS_PORT : '' );
  let CMS_MONGODB_URI = process.env.CMS_MONGODB_URI = process.env.CMS_MONGODB_URI || '';
  let CMS_DEFAULT_SETTINGS = process.env.CMS_DEFAULT_SETTINGS = process.env.CMS_DEFAULT_SETTINGS || '{}';

  // api server
  process.env.API_URL = API_URL;
  process.env.API_DOMAIN = API_DOMAIN;
  process.env.API_PORT = API_PORT;

  process.env.API_DB_HOST = process.env.API_DB_HOST || process.env.DB_HOST || '';
  process.env.API_DB_USERNAME = process.env.API_DB_USERNAME || process.env.DB_USERNAME;
  process.env.API_DB_PASSWORD = process.env.API_DB_PASSWORD || process.env.DB_PASSWORD;
  process.env.API_DB_NAME = process.env.API_DB_NAME || ( process.env.DB_BASE_NAME ? process.env.DB_BASE_NAME + '-api' :  'openstad-api' );
  process.env.API_DB_DIALECT = process.env.API_DB_DIALECT || process.env.DB_DIALECT || 'mysql';
  process.env.API_DB_REQUIRE_SSL = process.env.API_DB_REQUIRE_SSL || process.env.DB_REQUIRE_SSL || false;
  process.env.API_DB_AUTH_METHOD = process.env.API_DB_AUTH_METHOD || process.env.DB_AUTH_METHOD || '';

  process.env.API_FROM_EMAIL_ADDRESS = process.env.API_FROM_EMAIL_ADDRESS || process.env.FROM_EMAIL_ADDRESS || '';
  process.env.API_SMTP_SECURE = process.env.API_SMTP_SECURE || process.env.SMTP_SECURE || false;
  process.env.API_SMTP_PORT = process.env.API_SMTP_PORT || process.env.SMTP_PORT || '';
  process.env.API_SMTP_HOST = process.env.API_SMTP_HOST || process.env.SMTP_HOST || '';
  process.env.API_SMTP_USERNAME = process.env.API_SMTP_USERNAME || process.env.SMTP_USERNAME || '';
  process.env.API_SMTP_PASSWORD = process.env.API_SMTP_PASSWORD || process.env.SMTP_PASSWORD || '';

  process.env.FROM_EMAIL_ADDRESS = process.env.FROM_EMAIL_ADDRESS || process.env.API_FROM_EMAIL_ADDRESS;
  process.env.SMTP_SECURE = process.env.SMTP_SECURE || process.env.API_SMTP_SECURE || false;
  process.env.SMTP_PORT = process.env.SMTP_PORT || process.env.API_SMTP_PORT;
  process.env.SMTP_HOST = process.env.SMTP_HOST || process.env.API_SMTP_HOST;
  process.env.SMTP_USERNAME = process.env.SMTP_USERNAME || process.env.API_SMTP_USERNAME;
  process.env.SMTP_PASSWORD = process.env.SMTP_PASSWORD || process.env.API_SMTP_PASSWORD;

  process.env.API_COOKIE_SECRET = process.env.API_COOKIE_SECRET || generateRandomToken({ length: 32 });
  process.env.API_COOKIE_ONLY_SECURE = process.env.API_COOKIE_ONLY_SECURE || process.env.API_COOKIE_ONLY_SECURE != 'false' ? true : false;
  process.env.API_JWT_SECRET = process.env.API_JWT_SECRET || generateRandomToken({ length: 64 });

  process.env.API_FIXED_AUTH_KEY = API_FIXED_AUTH_KEY;
  process.env.API_AUTH_FIXEDAUTHTOKENS = API_AUTH_FIXEDAUTHTOKENS

  // auth server
  process.env.AUTH_APP_URL = process.env.AUTH_APP_URL || AUTH_URL || '';
  process.env.AUTH_PORT = AUTH_PORT || '';
  process.env.AUTH_DOMAIN = AUTH_DOMAIN || '';

  process.env.AUTH_DB_HOST = process.env.AUTH_DB_HOST || process.env.DB_HOST || '';
  process.env.AUTH_DB_USERNAME = process.env.AUTH_DB_USERNAME || process.env.DB_USERNAME || '';
  process.env.AUTH_DB_PASSWORD = process.env.AUTH_DB_PASSWORD || process.env.DB_PASSWORD || '';
  process.env.AUTH_DB_NAME = process.env.AUTH_DB_NAME || ( process.env.DB_BASE_NAME ? process.env.DB_BASE_NAME + '-auth' :  'openstad-auth' );
  process.env.AUTH_DB_DIALECT = process.env.AUTH_DB_DIALECT || process.env.DB_DIALECT || 'mysql';
  process.env.AUTH_DB_REQUIRE_SSL = process.env.AUTH_DB_REQUIRE_SSL || process.env.DB_REQUIRE_SSL || false;
  process.env.AUTH_DB_AUTH_METHOD = process.env.AUTH_DB_AUTH_METHOD || process.env.DB_AUTH_METHOD || '';

  process.env.AUTH_MAIL_SERVER_URL = process.env.AUTH_MAIL_SERVER_URL || process.env.SMTP_HOST;
  process.env.AUTH_MAIL_SERVER_PORT = process.env.AUTH_MAIL_SERVER_PORT || process.env.SMTP_PORT;
  process.env.AUTH_MAIL_SERVER_SECURE = true;
  process.env.AUTH_MAIL_SERVER_PASSWORD = process.env.AUTH_MAIL_SERVER_PASSWORD || process.env.SMTP_PASSWORD;
  process.env.AUTH_MAIL_SERVER_USER_NAME = process.env.AUTH_MAIL_SERVER_USER_NAME || process.env.SMTP_USERNAME;
  process.env.AUTH_FROM_NAME = process.env.AUTH_FROM_NAME || '';
  process.env.AUTH_FROM_EMAIL = process.env.AUTH_FROM_EMAIL || process.env.FROM_EMAIL_ADDRESS;
  process.env.AUTH_EMAIL_ASSETS_URL = process.env.AUTH_APP_URL || AUTH_URL;

  process.env.AUTH_SESSION_SECRET = process.env.AUTH_SESSION_SECRET || generateRandomToken({ length: 32 });
  // TODO: dev vs prod
  process.env.AUTH_COOKIE_SECURE_OFF = typeof process.env.AUTH_COOKIE_SECURE_OFF != 'undefined' ? process.env.AUTH_COOKIE_SECURE_OFF : process.env.COOKIE_SECURE_OFF || 'yes', // TODO: COOKIE_SECURE_OFF;

  process.env.AUTH_ADMIN_CLIENT_ID = AUTH_ADMIN_CLIENT_ID;
  process.env.AUTH_ADMIN_CLIENT_SECRET = AUTH_ADMIN_CLIENT_SECRET;
  process.env.AUTH_FIRST_CLIENT_ID = AUTH_FIRST_CLIENT_ID;
  process.env.AUTH_FIRST_CLIENT_SECRET = AUTH_FIRST_CLIENT_SECRET;
  process.env.AUTH_FIRST_LOGIN_CODE = process.env.AUTH_FIRST_LOGIN_CODE || generateRandomToken({ length: 32 });

  process.env.KPN_CLIENT_ID=process.env.KPN_CLIENT_ID || '';
  process.env.KPN_CLIENT_SECRET=process.env.KPN_CLIENT_SECRET || '';

  // image server
  process.env.IMAGE_DOMAIN = IMAGE_DOMAIN || '';
  process.env.IMAGE_APP_URL = IMAGE_APP_URL || '';
  process.env.IMAGE_PORT_API = IMAGE_PORT_API || '';
  process.env.IMAGE_PORT_IMAGE_SERVER = IMAGE_PORT_IMAGE_SERVER || '';
  process.env.IMAGE_VERIFICATION_TOKEN = IMAGE_VERIFICATION_TOKEN || generateRandomToken({ length: 32 });

  process.env.DOCUMENTS_DIR = process.env.DOCUMENTS_DIR || '';

  process.env.IMAGE_IMAGES_DIR = process.env.IMAGE_IMAGES_DIR || '';
  process.env.IMAGE_THROTTLE = process.env.IMAGE_THROTTLE || true;
  process.env.IMAGE_THROTTLE_CC_PROCESSORS = process.env.IMAGE_THROTTLE_CC_PROCESSORS || 4;
  process.env.IMAGE_THROTTLE_CC_PREFETCHER = process.env.IMAGE_THROTTLE_CC_PREFETCHER || 20;
  process.env.IMAGE_THROTTLE_CC_REQUESTS = process.env.IMAGE_THROTTLE_CC_REQUESTS || 100;

  // admin server
  process.env.ADMIN_URL = ADMIN_URL;
  process.env.ADMIN_COOKIE_SECRET = ADMIN_COOKIE_SECRET;
  process.env.ADMIN_DOMAIN = ADMIN_DOMAIN;
  process.env.ADMIN_PORT = ADMIN_PORT;

  // cms server
  process.env.CMS_URL=CMS_URL;
  process.env.CMS_PORT=CMS_PORT;
  process.env.CMS_OVERWRITE_URL=CMS_OVERWRITE_URL;
  process.env.CMS_MONGODB_URI=CMS_MONGODB_URI;
  process.env.CMS_DEFAULT_SETTINGS=CMS_DEFAULT_SETTINGS;

}

async function writeEnvFile() {
  try {
    let configfile = `
#base values
BASE_DOMAIN=${process.env.BASE_DOMAIN}
BASE_PORT=${process.env.BASE_PORT}

DB_HOST=${process.env.DB_HOST}
DB_USERNAME=${process.env.DB_USERNAME}
DB_PASSWORD=${process.env.DB_PASSWORD}
DB_BASE_NAME=${process.env.DB_BASE_NAME}
DB_DIALECT=${process.env.DB_DIALECT}
DB_REQUIRE_SSL=${process.env.DB_REQUIRE_SSL}
DB_AUTH_METHOD=${process.env.DB_AUTH_METHOD}

MESSAGESTREAMING_REDIS_URL=${process.env.MESSAGESTREAMING_REDIS_URL || 'openstad-redis'}
MESSAGESTREAMING_POSTFIX=${process.env.MESSAGESTREAMING_POSTFIX || ''}

BASIC_AUTH_USER=${process.env.BASIC_AUTH_USER}
BASIC_AUTH_PASSWORD=${process.env.BASIC_AUTH_PASSWORD}

FROM_EMAIL_ADDRESS=${process.env.FROM_EMAIL_ADDRESS}
SMTP_PORT=${process.env.SMTP_PORT}
SMTP_HOST=${process.env.SMTP_HOST}
SMTP_SECURE=${process.env.SMTP_SECURE || ''}
SMTP_USERNAME=${process.env.SMTP_USERNAME}
SMTP_PASSWORD=${process.env.SMTP_PASSWORD}

MONGO_HOST=localhost

BASIC_AUTH_USER=openstad
BASIC_AUTH_PASSWORD=openstad

FORCE_HTTP=${process.env.FORCE_HTTP}

MYSQL_USER=${process.env.DB_USERNAME}
MYSQL_PASSWORD=${process.env.DB_PASSWORD}
MYSQL_ROOT_PASSWORD=${process.env.DB_PASSWORD}

#api server
API_URL=${process.env.API_URL}
API_DOMAIN=${process.env.API_DOMAIN}
API_PORT=${process.env.API_PORT}
API_HOSTNAME=${process.env.API_DOMAIN}

API_DATABASE_HOST=${process.env.API_DB_HOST || 'openstad-mysql'}
API_DATABASE_USER=${process.env.API_DB_USERNAME}
API_DATABASE_PASSWORD=${process.env.API_DB_PASSWORD}
API_DB_NAME=${process.env.API_DB_NAME}
API_DATABASE_DATABASE=${process.env.API_DB_NAME}
API_DB_DIALECT=${process.env.API_DB_DIALECT}
API_DB_REQUIRE_SSL=${process.env.API_DB_REQUIRE_SSL}
API_DB_AUTH_METHOD=${process.env.API_DB_AUTH_METHOD}

API_FROM_EMAIL_ADDRESS=${process.env.API_FROM_EMAIL_ADDRESS}
API_SMTP_SECURE=${process.env.API_SMTP_SECURE}
API_SMTP_PORT=${process.env.API_SMTP_PORT}
API_SMTP_HOST=${process.env.API_SMTP_HOST}
API_SMTP_USERNAME=${process.env.API_SMTP_USERNAME}
API_SMTP_PASSWORD=${process.env.API_SMTP_PASSWORD}

API_COOKIE_SECRET=${process.env.API_COOKIE_SECRET}
API_COOKIE_ONLY_SECURE=${process.env.API_COOKIE_ONLY_SECURE}
API_AUTH_JWTSECRET=${process.env.API_JWT_SECRET}

API_FIXED_AUTH_KEY=${process.env.API_FIXED_AUTH_KEY}
API_AUTH_FIXEDAUTHTOKENS=${process.env.API_AUTH_FIXEDAUTHTOKENS}

#auth server
AUTH_APP_URL=${process.env.AUTH_APP_URL}
AUTH_PORT=${process.env.AUTH_PORT}
AUTH_DOMAIN=${process.env.AUTH_DOMAIN}

AUTH_DB_HOST=${process.env.AUTH_DB_HOST || 'openstad-mysql'}
AUTH_DB_USER=${process.env.AUTH_DB_USERNAME}
AUTH_DB_PASSWORD=${process.env.AUTH_DB_PASSWORD}
AUTH_DB_NAME=${process.env.AUTH_DB_NAME}
AUTH_DB_DIALECT=${process.env.AUTH_DB_DIALECT}
AUTH_DB_REQUIRE_SSL=${process.env.AUTH_DB_REQUIRE_SSL}
AUTH_DB_AUTH_METHOD=${process.env.AUTH_DB_AUTH_METHOD}

AUTH_MAIL_SERVER_URL=${process.env.AUTH_MAIL_SERVER_URL}
AUTH_MAIL_SERVER_PORT=${process.env.AUTH_MAIL_SERVER_PORT}
AUTH_MAIL_SERVER_SECURE=${process.env.AUTH_MAIL_SERVER_SECURE}
AUTH_MAIL_SERVER_PASSWORD=${process.env.AUTH_MAIL_SERVER_PASSWORD}
AUTH_MAIL_SERVER_USER_NAME=${process.env.AUTH_MAIL_SERVER_USER_NAME}
AUTH_FROM_NAME=${process.env.AUTH_FROM_NAME}
AUTH_FROM_EMAIL=${process.env.AUTH_FROM_EMAIL}
AUTH_EMAIL_ASSETS_URL=${process.env.AUTH_EMAIL_ASSETS_URL}

AUTH_SESSION_SECRET=${process.env.AUTH_SESSION_SECRET}
AUTH_COOKIE_SECURE_OFF=${process.env.AUTH_COOKIE_SECURE_OFF}

AUTH_ADMIN_CLIENT_ID=${process.env.AUTH_ADMIN_CLIENT_ID}
AUTH_ADMIN_CLIENT_SECRET=${process.env.AUTH_ADMIN_CLIENT_SECRET}
AUTH_FIRST_CLIENT_ID=${process.env.AUTH_FIRST_CLIENT_ID}
AUTH_FIRST_CLIENT_SECRET=${process.env.AUTH_FIRST_CLIENT_SECRET}
AUTH_FIRST_LOGIN_CODE=${process.env.AUTH_FIRST_LOGIN_CODE}

#KPN_CLIENT_ID=${process.env.KPN_CLIENT_ID}
#KPN_CLIENT_SECRET=${process.env.KPN_CLIENT_SECRET}

#image server
IMAGE_DOMAIN=${process.env.IMAGE_DOMAIN}
IMAGE_APP_URL=${process.env.IMAGE_APP_URL}
IMAGE_PORT_API=${process.env.IMAGE_PORT_API}
IMAGE_PORT_IMAGE_SERVER=${process.env.IMAGE_PORT_IMAGE_SERVER}
IMAGE_VERIFICATION_TOKEN=${process.env.IMAGE_VERIFICATION_TOKEN}

IMAGE_IMAGES_DIR=${process.env.DOCUMENTS_DIR}

IMAGE_IMAGES_DIR=${process.env.IMAGE_IMAGES_DIR}
IMAGE_THROTTLE=${process.env.IMAGE_THROTTLE}
IMAGE_THROTTLE_CC_PROCESSORS=${process.env.IMAGE_THROTTLE_CC_PROCESSORS}
IMAGE_THROTTLE_CC_PREFETCHER=${process.env.IMAGE_THROTTLE_CC_PREFETCHER}
IMAGE_THROTTLE_CC_REQUESTS=${process.env.IMAGE_THROTTLE_CC_REQUESTS}

#admin server
ADMIN_URL=${process.env.ADMIN_URL}
ADMIN_DOMAIN=${process.env.ADMIN_DOMAIN}
ADMIN_PORT=${process.env.ADMIN_PORT}
ADMIN_COOKIE_SECRET=${process.env.ADMIN_COOKIE_SECRET}

#cms server
CMS_URL=${process.env.CMS_URL}
CMS_PORT=${process.env.CMS_PORT}
CMS_OVERWRITE_URL=${process.env.CMS_OVERWRITE_URL}
CMS_MONGODB_URI=${process.env.CMS_MONGODB_URI}
CMS_DEFAULT_SETTINGS=${process.env.CMS_DEFAULT_SETTINGS}
`;
    await fs.writeFile('./.env', configfile);
  } catch (err) {
    console.log(err);
  }
}

function generateRandomToken(params) {

  var token = '';

  params.chars = params.chars || 'abcdefghijklmnopqrstuvwxyzABCDEFGHIJKLMNOPQRSTUVWXYZ0123456789';
  params.length = params.length || 25;

  for (let i = 0; i < params.length; i++) {
    const rnd = Math.floor(params.chars.length * Math.random());
    const chr = params.chars.substring(rnd, rnd + 1);
    token = token + chr;
  }

  return token;

}

module.exports = {
  create,
  setupEnvVars,
  writeEnvFile,
}
