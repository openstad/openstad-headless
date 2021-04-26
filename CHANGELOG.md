# Changelog

## v0.14.0 (2020-04-26)
* Add 2 factor auth, configurable per role and client (site)

## v0.13.0 (2020-03-17)
* Add ellipsis css to login url in email so it will be cut off

## v0.12.0 (2020-02-23)
* In case password is not set create a random one when creating a user

## v0.11.0 (2020-01-27)
* Fallback to roleId for member uniqueCode if none defaultRoleId isset
* In case password is not set create a random one

## v0.10.0 (2020-12-09)
* Add client name to the page title, and client site URL to the logo href
* Add a favicon that can be overwritten in the client config
* Allow labels of required fields to be changed through the client config

## v0.9.0
* Update NPM modules for security

## v0.8.0 (2020-17-07)

* Alter tables with foreign keys to user from delete restrict to delete cascade, meaning they automatically get deleted

## 0.7.2 (2020-10-08)
* Update openstad logo

## 0.7.1 (2020-09-15)
* Sender in email fell back to null null, Add check to make sure firstName / lastName exists in order to prevent casting null to string

## 0.7.0 (2020-09-15)
* Start of using version numbers in changelog
