Authorization Server
==================

# An OAuth2 Server with Node.js; includes a simple admin panel for managing users and clients

## Prerequisites
 - [Git](https://git-scm.com/)
 - [Node.js and npm](https://nodejs.org/en/)
 - [MySQL](https://www.mysql.com/)
 - [KnexJS](https://knexjs.org)
 - OpenSSL

## Installation

#### 1. Set .env values

```
#MySQL settings
DB_HOST=
DB_USER=
DB_PASSWORD=
DB_NAME=

# Set SMTP mail server (currently only SMTP support)
MAIL_SERVER_URL=smtp.gmail.com
MAIL_SERVER_PORT=465
MAIL_SERVER_SECURE=true
MAIL_SERVER_PASSWORD=
MAIL_SERVER_USER_NAME=

# Set the redirect URL (if generated with seeds, will be put in database)
ADMIN_REDIRECT_URL=

# Set the APP url ()
APP_URL=http://localhost:2000
EMAIL_ASSETS_URL=

# Set the from name and email from which emails will be send (for example: password forgot & login url)
FROM_NAME=
FROM_EMAIL=
```

#### 2. Run NPM install

```
npm i
```

#### 3. Generate certificates with openssl (used for signing JSON tokens)
```
openssl genrsa -out privatekey.pem 2048
openssl req -new -key privatekey.pem -out certrequest.csr
openssl x509 -req -in certrequest.csr -signkey privatekey.pem -out certificate.pem
```

Put them in a dir called /certs. Code expects certs/privatekey.pem.

#### 4. Install KnexJS globally

```
npm i knex -g
```

#### 5. Run Knex migrations
```
knex migrate:latest
```

#### 6. Run Knex seeds
```
knex seed:run
```

#### 7. Login with token
After generating the token the console outputs. If you miss this you can find this in the mysql table: unique_codes (should just be one row). This code will allow you to login with a unique token. After you will be asked. You can change the login options at the client screen.

## Integration with external sites

#### 1. Create a client in the mysql database.
Set the site Url en redirectUrl. Give the site a good name, they will see this in different login screens.

#### 2. Use an NodeJS oAuth2 client to integrate
For instance grant or ...

Authorize url: APP_URL/dialog/authorize
Access url: APP_URL/oauth/token

A rough admin panel was developed, but not being used since we use the openstad admin panel for this, a rough working version with views & routes can be found in the branch feature/rough-admin-panel

## DEVELOPMENT
If you are run a dev environment without SSL, turn off secure cookies in .env
```
COOKIE_SECURE_OFF=yes
```

## Custom SMTP configuration per site
If you want to configure the SMTP server through which e-mails are sent on a site-by-site basis, this is possible through configuration in the database.
Under the `clients` table in the `config` column you can set the following parameters:

```
"smtpTransport": {
    "host": "smtp.gmail.com",
    "port": 465,
    "secure": true,
    "auth": {
        "user": "username@gmail.com",
        "pass": "password"
    }
}
```

Any configuration not provided will be fetched from the values set in the .env
