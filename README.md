# openstad-api

## TODO

Ik verplaats config.authorization naar config.auth. Als dat klaar is kan config.authorizationdus weg

In de jwt heb client hernoemd naar idp. Nu heeft hij nog beide.

Iss is een string die gechecked moet worden!!

useOauth moet useAuth of useIDP worden, maar dat moet ook in de frontend en is daarom nog niet doorgevoerd

'default' als waarde in de projectconfig.auth moet verwijzen naar openstad (of iets anders configureerbaars) zodat ik 'openstad' kan gebruiken als waarde in bijvoorbeeld fisexAuthTokens


## Setup

### 1. Installatie
```
git@github.com:Amsterdam/openstad-api.git
cd openstad-api
npm i
```

### 2. Maak een lokale configuratie file `./config/local.js`
```
module.exports = {

  "url": "URL",
  "hostname": "DOMAIN",

  "database": {
    "user": "DB_USERNAME",
    "password": "DB_PASSWORD",
    "database": "DB_NAME",
    "host": "DB_HOST",
    "dialect": "DB_DIALECT",
    "multipleStatements": true
  },

  "express": {
    "port": PORT
  },

  "mail": {
    "from": "EMAIL_ADDRESS",
    "transport": {
      "smtp": {
        "port": SMTP_PORT,
        "host": "SMTP_HOST",
        "auth": {
          "user": "SMTP_USERNAME",
          "pass": "SMTP_PASSWORD"
        }
      }
    }
  },

  "security": {
  },

  "authorization": {
    "jwt-secret": "MIJNOPENSTAD_JWT_SECRET",
    "auth-server-url": "MIJNOPENSTAD_URL",
    "auth-client-id": "MIJNOPENSTAD_DEFAULT_CLIENT_ID",
    "auth-client-secret": "MIJNOPENSTAD__CLIENT_PASSWORD",
    "auth-server-login-path": "/dialog/authorize?redirect_uri=[[redirectUrl]]&response_type=code&client_id=[[clientId]]&scope=offline",
    "auth-server-exchange-code-path": "/oauth/token",
    "auth-server-get-user-path": "/api/userinfo?client_id=[[clientId]]",
    "auth-server-logout-path": "/logout?clientId=[[clientId]]",
    "after-login-redirect-uri": "/?jwt=[[jwt]]",
    "fixed-auth-tokens": [
      {
        "token": "12345",
        "userId": "2"
      }
    ]
  }
}
```

### 3. Initeëer de database
For a successful reset run, make sure the following ENV values are properly set:


```
#unique hash
FRONTEND_URL=
AUTH_URL=

#unique hash
AUTH_FIRST_CLIENT_SECRET=
AUTH_FIRST_CLIENT_ID=

#for instance = http://localhost:4444|https://admin.openstad.demo
ADMIN_URL=
#optional
AUTH_INTERNAL_SERVER_URL=
```

Then run following command:
```
env ... node reset.js
```
If you are using an existing database and only want to migrate run the following command:
```
node -r dotenv/config migrate.js
```

### 4. Start de server
```
node server.js
```

### 5. Run tests

There are several test scripts:
1. `npm run test` For all tests scenarios
2. `npm run test:unit` For all unit tests
3. `npm run test:e2e` For all e2e tests

## Travis CI

### GITOPS
Gitops steps:
- Test application
- Generate assets
- Build docker image
- Push docker image
- Commit new image to helm repo (based on GITOPS_RELEASE_BRANCH and GITOPS_{environment}_VALUES_FILE )

If you want to enable gitops flow in the ci pipeline of travis you need to configure a few variables:
- GITOPS=true
- DOCKER_PUBLIC_USERNAME=openstad
- DOCKER_IMAGE_NAME=api
- HELM_REPO_NAME=openstad-kubernetes
- HELM_CHART_FOLDER=k8s/openstad
- GITOPS_RELEASE_BRANCH=master
- GITOPS_DEV_VALUES_FILE=k8s/openstad/environments/dev.values.yaml
- GITOPS_ACC_VALUES_FILE=k8s/openstad/environments/acc.values.yaml
- GITOPS_PROD_VALUES_FILE=k8s/openstad/environments/prod.values.yaml

## MySQL with SSL

When you want to connect to a MySQL server using SSL, a Certificate Authority certificate is required. The contents of this CA certificate can be passed into the `MYSQL_CA_CERT` environment variable.

## Documentatie

Meer informatie staat in de [docs directory](doc/index.md).
