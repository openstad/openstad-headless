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
DB_ENABLE_CLEARTEXT_PLUGIN = false
DB_AUTH_METHOD = ''

WHITELISTED_EMAILS=''

VERBOSE_LOGGING = false

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
API_DB_ENABLE_CLEARTEXT_PLUGIN = process.env.DB_ENABLE_CLEARTEXT_PLUGIN || false
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
AUTH_DB_ENABLE_CLEARTEXT_PLUGIN = process.env.DB_ENABLE_CLEARTEXT_PLUGIN || false
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
AUTH_PHONE_HASH_SALT = generateRandomToken({ length: 32 })

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

## Phone hash salt (`AUTH_PHONE_HASH_SALT`) (2025-06-30)

Due to switching from `md5` to `sha256` for hashing phone numbers, the `AUTH_PHONE_HASH_SALT` environment variable is now used.
Preferably this should be a string of at least 32 characters. You can generate it using the `generateRandomToken` function or any other secure random string generator.
The salt should be kept secret and not shared with anyone, to ensure the security of the phone number hashing process.

This `AUTH_PHONE_HASH_SALT` variable is generated automatically during the setup process, but you can also set it manually in your `.env` file if needed.

## Multi-project login (`MULTI_PROJECT_LOGIN`) (2026-10-07)

Opt-in: set `MULTI_PROJECT_LOGIN=true` on both the api-server and the auth-server. Only the exact value `true` enables it. Without it, login behaves as before. In the Helm chart, set `multiProjectLogin: true`; it is passed to both.

With the flag on:

- A visitor who is logged in on one project is logged in on another project of the same installation with one click (no redirect). Missing data is asked for in a dialog in the widget; a vote code is asked for in that dialog too.
- The first login opens the auth server in a popup window. When the browser blocks the popup, the widget offers a button to log in in the same window. Logging in automatically without any click on another domain is not possible because browsers block third-party cookies.
- A magic link opened in another tab also completes the login in the original tab.
- Widgets no longer force a new login by default (`forceNewLogin=1`). Exceptions:
  - projects whose auth client only allows `UniqueCode` always force a new login, so the next person on a shared device does not continue as the previous voter;
  - "Vul een andere stemcode in" always forces a new login;
  - `config.auth.forceNewLoginOnWidgets` on a project overrides the default (`true` or `false`).
- After voting, the budgeting widget also ends the auth-server session.
- A vote code login creates its own identity. It is never linked to the visitor's e-mail identity, so votes cannot be traced back to an e-mail address and profile data is not shared with vote code projects.

Endpoints, the exchange policy, the vote code lockout and known gaps are described in [multi-project login](./multi-project-login.md).

Independent of the flag: in production (`NODE_ENV=production` without `FORCE_HTTP`) the api-server only sends a login token back to an `https:` URL.

## Trusted proxies (`TRUST_PROXY`) (2026-10-07)

Sets Express' `trust proxy` on the api-server and the auth-server, which decides how `req.ip` is read from `X-Forwarded-For`. Rate limiting, brute-force protection and the vote code lockout use `req.ip`.

- Unset (default): every proxy is trusted. This is the previous behaviour, but clients can then spoof their IP address.
- A number: the number of proxy hops in front of the app. Behind a single ingress controller use `1`.
- An address or subnet list, for example `10.0.0.0/8, loopback`.
- `false`: ignore `X-Forwarded-For`.

In the Helm chart, set it through `api.extraEnvVars` and `auth.extraEnvVars`.
