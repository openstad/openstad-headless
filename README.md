Authorization Server
==================

This is the authorization server example.

# Installation
```
git clone https://github.com/FrankHassanabad/Oauth2orizeRecipes.git
cd Oauth2orizeRecipes/authorization-server
npm install
npm start
```


.env values


APP_URL
EMAIL_ASSETS_URL
MAIL_SERVER_URL
MAIL_SERVER_PORT
MAIL_SERVER_SECURE
MAIL_SERVER_PASSWORD
MAIL_ASSETS_URL

FROM_EMAIL
FROM_NAME

Go here for how to use the REST API
https://github.com/FrankHassanabad/Oauth2orizeRecipes/wiki/OAuth2orize-Authorization-Server-Tests

Go here for high level views of security scenarios
https://github.com/FrankHassanabad/Oauth2orizeRecipes/wiki/Security-Scenarios

See the curl folder for headless operations and ad-hoc testing  
[curl/README.md](curl/README.md)

See url for token:
{{ssoUrl}}/dialog/authorize?redirect_uri=...&response_type=token&client_id=...&scope=o
