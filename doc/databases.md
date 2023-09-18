## Databases

The API, Auth and Image server all use Sequelize, and are setup in similar fashion.

A `db.js` script sets up Sequelize and database connections for the server. It uses models from the `./models/` directory, makes sure all associations and scopes are initialized, etc.

In any other script a simple 
```
const db = require('db');
```
should suffice; `db.ModelName.whatever` is now available for any action on the database.  
The Sequelize package and instance are available as `db.Sequelize` and `db.sequelize`.

### Database initialisation

For each of the servers the database can be setup using the (m.m.) command 
```
NODE_ENV=development npm run init-database
```
This will create the tables and relations.

It will also create initial data from the seeds `directory`. This is split up in default and enviroment data. A file `local.js` here will be run, if available.

### Database migration

Updates to the database, that is: changes in the models, should be done through a file in the `./migrations` directory; look at a file there to see the required structure.

The command 
```
npm run migrate-database
```
can be run to update your cureent database to the newer version.


