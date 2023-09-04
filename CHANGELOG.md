# Changelog

## UNRELEASED
* Move API, auth and image servers, and the poc components, to one repo

### API server
* Add auth adapters and auth through third party IDPs - see /doc/auth.md
* The API is now single source of truth for OpenStad users, but always through external login services
* Syncing to the OpenSTad auth server is now done through the adapter
* Refactor Site to Project, remove Site.domain functionality, add Project.url
* Remove refreshProjectConfigMw
* Remove obsolete models and routes: AccessToken, BudegtVote and Log
* And more cleanup of old and obsolte code
* Refactor init database, merge seeds and fixtures, make table names consitent, and fix relations
* Refactor Argument to Comment
* Rename devel branch to development to be consistent with other branches
* Remove express-promise-router dependency
* Remove oauth userdata parsing: the API is now single source of truth
* Refactor useOauth to useAuth

### auth server
* Remove user.extradata: the API is now single source of truth

### image server
* Refactor init database, merge seeds and fixtures

