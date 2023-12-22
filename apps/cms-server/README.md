# Openstad Frontend - With ApostropheCMS v3

## Intro
The Openstad software allows organisation to easily build software for digital participation & democracy.

The main software runs ApostropheCMS v2 for site management, this is a first draft for moving that to v3. It implements loading sites, connecting to auth & moved over a few widgets.

## Installation
### 1. Create a .env file
```
PORT=3000
# able to set an external domain for dev & test purposed, make sure the oAuth is allowed to redirect to localhost
OVERWRITE_DOMAIN=
SITE_API_KEY=
API_URL=
# if your mongodb is not on localhost:27017
APOS_MONGODB_URI=
```
### Npm i & npm run
```
npm i & npm run dev
```

### Crash on startup
In development mode at times there is a crash after a change on startup. 
A restart solves that. Needs more investigation.

## Moving from ApostropheV2 
Moving from ApostropheCMS v2 a few things changed:

- Construct is now named init
- Schema fields are now structured as objects instead of an array, the name is now the key of the object
- Options in a widgets are not top level elements, but nested under options key options: {label: 'Name of widget'} instead of label: 'Name of widget'
- Widgets do not end in -widgets, but in -widget
- Arraging is now then under key group:
- less is no longer supported, have to migrate  over to sass
- To link directly to a static file in a module now, make sure it's in public dir and link to it as such, assuming images is a direcotry in the ui/public directory. Example: lib/modules/agenda-widget/ui/public/img/bg.png : /modules/agenda-widget/img/bg.png
