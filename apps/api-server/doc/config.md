## API configuration

All OpenStad apps are configured through environment variables that van be provided either as such or in an `.env` file.

### Minimal required configuration options

The url of the application:
```
URL=
```

Database settings
```
DB_USERNAME=
DB_PASSWORD=
DB_NAME=
```

Authentication: a jwt secret and the url of the openstad auth server
```
AUTH_JWTSECRET=
AUTH_ADAPTER_OPENSTAD_SERVERURL=
```

Email settings are stricktly speaking not required, for the api will run without these values.

SMTP settings:
```
SMTP_HOST=
SMTP_PORT=
SMTP_REQUIRESSL=
SMTP_USERNAME=
SMTP_PASSWORD=
```

The from address for email sent by the API
```
FROM_EMAIL_ADDRESS=
```

The default recipient address for notifications sent by the API:
```
NOTIFICATIONS_ADMIN_TO_EMAILADDRESS=
```




### All configuration options and defaults

```
NAME=OpenStad API
```

```
URL=https://openstad.org
DOMAIN= * domain name part of url *
PORT=8082
```

```
DB_HOST=localhost
DB_USERNAME=no-user
DB_PASSWORD=no-password
DB_NAME=openstad-api
DB_DIALECT=mysql
DB_PORT=3306
DB_MAX_POOL_SIZE=5
DB_MYSQL_CA_CERT
DB_MYSQL_CA_CERT
```

```
FROM_EMAIL_ADDRESS=email@not.set
SMTP_HOST
SMTP_PORT
SMTP_REQUIRESSL
SMTP_HOST
SMTP_HOST
```

```
NOTIFICATIONS_ADMIN_TO_EMAILADDRESS
NOTIFICATIONS_SENDENDDATENOTIFICATIONS_XDAYSBEFORE=7
NOTIFICATIONS_SENDENDDATENOTIFICATIONS_SUBJECT=Sluitingsdatum project nadert
NOTIFICATIONS_SENDENDDATENOTIFICATIONS_TEMPLATE= * See apps/api-server/config/default.js *
```

```
AUTH_JWTSECRET=REPLACE THIS VALUE!!
AUTH_ADAPTER_OPENSTAD_URL
AUTH_ADAPTER_OPENSTAD_SERVERURL
AUTH_ADAPTER_OPENSTAD_USERMAPPING= * See below *
AUTH_ADAPTER_OIDC_MODULEPATH=./src/adapter/oidc
AUTH_PROVIDER_DEFAULT_ADAPTER=openstad
AUTH_PROVIDER_OPENSTAD_ADAPTER=openstad
AUTH_PROVIDER_ANONYMOUS_ADAPTER=openstad
AUTH_FIXEDAUTHTOKENS=[]
```

Note: the complete auth configuration looks like this (more information in the [auth docs](./auth.md)):


```
{
  auth: {
    jwtSecret: 'REPLACE THIS VALUE!!',
    adapter: {
      openstad: {
        serverUrl:  null,
        modulePath: './src/adapter/openstad',
        userMapping: JSON.stringify({
          identifier: 'user_id',
          name: "user => `${user.name || ''}`.trim() || null",
          email: "user => user.email == '' ? null : user.email",
          address: "user => `${user.streetName || ''} ${user.houseNumber || ''} ${user.suffix || ''}`.trim() || null",
          role: "user => user.role || ((user.email || user.phoneNumber || user.hashedPhoneNumber) ? 'member' : 'anonymous')",
        }),
      },
      oidc: {
        modulePath: './src/adapter/oidc',
      }
    },
    provider: {
      default: {
        adapter: 'openstad',
      },
      openstad: {
        adapter: 'openstad',
      },
      anonymous: {
        adapter: 'openstad',
      },
    },
  },
  fixedAuthTokens: []
}
```

Parts of this can be provided as json blocks, so e.g. an environmant variable AUTH_PROVIDER_DEFAULT could contain the stringified value
``` 
{
  "default": {
    "adapter": "openstad"
  }
}
```

```
DEBUG=false
LOCALE=nl
LOGGING=app:*,-app:db:query
TIMEZONE=Europe/Amsterdam
TEMPLATE_SOURCE=https://cdn.jsdelivr.net/gh/Amsterdam/openstad-ecosystem-templates/site/index.json
IGNORE_BRUTE_FORCE_IPS=[]
```

```
RESOURCES_DESCRIPTION_MIN_LENGTH=140
RESOURCES_DESCRIPTION_MAXENGTH=5000
RESOURCES_ADD_NEW_RESOURCES="open"
RESOURCES_DURATION=90
RESOURCES_MINIMUM_YES_VOTES=100
RESOURCES_ANONYMIZE_THRESHOLD=180
RESOURCES_COMMENT_VOTE_THRESHOLD=0
RESOURCES_LOCATION=
RESOURCES_LOCATION_IS_MANDATORY=false
```
