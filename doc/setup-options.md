## Setup options

The setup scripts (see the [setup doc](./setup.md)) create configurations for the different servers based on a very simple set of environment variables. Create an .env file with the following contents:
```
AUTH_FIRST_LOGIN_CODE=CREATEACODE

BASE_DOMAIN=openstad.local

DB_HOST=localhost
DB_USERNAME=USERNAME
DB_PASSWORD=PASSWORD
DB_BASE_NAME=openstad

BASIC_AUTH_USER=openstad
BASIC_AUTH_PASSWORD=openstad

FROM_EMAIL_ADDRESS=user@example.xx
SMTP_PORT=465
SMTP_HOST=smtp.example.xx
SMTP_USERNAME=USERNAME
SMTP_PASSWORD=PASSWORD

FORCE_HTTP=true
SERVER_IP=IPNUMBER
```

If you need a more specific setup the following vars will be recognized as well. With defaults:

```
BASE_PORT = 31400

BASIC_AUTH_USER = openstad
BASIC_AUTH_PASSWORD = openstad

COOKIE_SECURE_OFF = process.env.FORCE_HTTP ? 'yes' : ''

DB_REQUIRE_SSL = false
DB_AUTH_METHOD = ''

// api server
API_DOMAIN = 'api.' + process.env.BASE_DOMAIN
API_URL = 'http://' + API_DOMAIN
API_PORT = BASE_PORT + 10

API_DB_HOST = process.env.DB_HOST
API_DB_USERNAME = process.env.DB_USERNAME
API_DB_PASSWORD = process.env.DB_PASSWORD
API_DB_NAME = process.env.DB_BASE_NAME ? process.env.DB_BASE_NAME + '-api' :  'api'
API_DB_DIALECT = process.env.DB_DIALECT || 'mysql'
API_DB_REQUIRE_SSL = process.env.DB_REQUIRE_SSL || false
API_DB_AUTH_METHOD = process.env.DB_AUTH_METHOD || ''

API_FROM_EMAIL_ADDRESS = process.env.FROM_EMAIL_ADDRESS
API_SMTP_PORT = process.env.SMTP_PORT
API_SMTP_HOST = process.env.SMTP_HOST
API_SMTP_USERNAME = process.env.SMTP_USERNAME
API_SMTP_PASSWORD = process.env.SMTP_PASSWORD

API_COOKIE_SECRET = generateRandomToken({ length: 32 })
API_COOKIE_ONLY_SECURE = process.env.API_COOKIE_ONLY_SECURE != 'false' ? true : false
API_JWT_SECRET = generateRandomToken(64)

API_FIXED_AUTH_KEY = generateRandomToken({ length: 2048 })

// auth server
AUTH_DOMAIN = 'auth.' + process.env.BASE_DOMAIN
AUTH_URL = 'http://' + AUTH_DOMAIN
AUTH_PORT = BASE_PORT + 30

AUTH_DB_HOST = process.env.DB_HOST
AUTH_DB_USERNAME = process.env.DB_USERNAME
AUTH_DB_PASSWORD = process.env.DB_PASSWORD
AUTH_DB_NAME = ( process.env.DB_BASE_NAME ? process.env.DB_BASE_NAME + '-auth-server' :  'auth-server' )
AUTH_DB_DIALECT = process.env.DB_DIALECT || 'mysql'
AUTH_DB_REQUIRE_SSL = process.env.DB_REQUIRE_SSL || false
AUTH_DB_AUTH_METHOD = process.env.DB_AUTH_METHOD || ''

AUTH_MAIL_SERVER_URL = process.env.SMTP_HOST
AUTH_MAIL_SERVER_PORT = process.env.SMTP_PORT
AUTH_MAIL_SERVER_SECURE = true
AUTH_MAIL_SERVER_PASSWORD = process.env.SMTP_PASSWORD
AUTH_MAIL_SERVER_USER_NAME = process.env.SMTP_USERNAME
AUTH_FROM_NAME = ''
AUTH_FROM_EMAIL = process.env.FROM_EMAIL_ADDRESS
AUTH_EMAIL_ASSETS_URL = AUTH_URL

AUTH_JWT_SECRET = generateRandomToken({ length: 64 })
AUTH_FIRST_CLIENT_ID = default-client
AUTH_FIRST_CLIENT_SECRET = generateRandomToken({ length: 64 })
AUTH_ADMIN_CLIENT_ID = admin-client
AUTH_ADMIN_CLIENT_SECRET = generateRandomToken({ length: 64 })

AUTH_SESSION_SECRET = generateRandomToken({ length: 32 })
AUTH_COOKIE_SECURE_OFF = typeof process.env.AUTH_COOKIE_SECURE_OFF != 'undefined' ? process.env.AUTH_COOKIE_SECURE_OFF : 'yes'

// KPN_CLIENT_ID=
// KPN_CLIENT_SECRET=

// image server
IMAGE_DOMAIN = 'image.' + process.env.BASE_DOMAIN;
IMAGE_APP_URL = 'http://' + IMAGE_DOMAIN;
IMAGE_PORT_API = BASE_PORT + 50;
IMAGE_PORT_IMAGE_SERVER = IMAGE_PORT_API + 1;

IMAGE_IMAGES_DIR = ''
DOCUMENTS_DIR = ''
IMAGE_THROTTLE = true
IMAGE_THROTTLE_CC_PROCESSORS = 4
IMAGE_THROTTLE_CC_PREFETCHER = 20
IMAGE_THROTTLE_CC_REQUESTS = 100

```
