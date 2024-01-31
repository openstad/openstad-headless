# Changelog

## All
* Move API, auth and image servers, and the poc components, to one repo
* Refactor: use normal Authorization header instead of X-Authorization to connect to the API
* Add local seed data option to init-database
* Move migrations script to npm run migrate-database
* Refactor: idea is now resource

### API server
* Add auth adapters and auth through third party IDPs - see /doc/auth.md
* The API is now single source of truth for OpenStad users, but always through external login services
* Syncing to the OpenStad auth server is now done through the adapter
* Merge first- and lastname to name
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
* Refactor X-Authorisation to Authorisation
* Remove CommentVote.opinion; it is not used
* Remove anonymize votes - anonymization is now done through users
* Remove backup scripts - this should not be done in the API
* Remove mongo dependency
* Remove S3 connections - no longer required
* Move email config from project.config to project.emailConfig and hide them unless specifically asked for
* Remove articles
* Fix half implemented tags functionality
* Add seqnrs to tags
* Merge one existing filter and two existing search systems
* Remove doc routes

### Auth server
* Refactor init database and seeds
* Remove user.extradata: the API is now single source of truth
* Bugfix: toJSON of db models used the wrong data
* Bugfix: new users are now created withoud a random password
* Merge first- and lastname to name
* Remove mongo dependency
* Delete access tokens on logout

### Image server
* Refactor init database, merge seeds and fixtures

