## Databases

The API, Auth and Image server all use Sequelize, and are setup in similar fashion.

A `db.js` script sets up Sequelize and database connections for the server. It uses models from the `./models/` directory, makes sure all associations and scopes are initialized, etc.

In any other script a simple 
```
const db = require('db');
```
should suffice; `db.ModelName.whatever` is now available for any action on the database.  
The Sequelize package and instance are available as `db.Sequelize` and `db.sequelize`.

### Database authentication - `DB_AUTH_METHOD`

Depending on the context in which the software is running, you can choose a specific database authentication method. The username is always retrieved from an environment variable, but for the password this can be different:

- **default**: By default the database password is also retrieved from an environment variable.
- **azure-auth-token**: When running in Azure, using Entra ID. By setting the environment variable `DB_AUTH_METHOD` to `azure-auth-token`, the application uses Azure's token-based authentication to securely connect to the database. It relies on the following environment variables that should get injected by Azure; `AZURE_AUTHORITY_HOST`, `AZURE_CLIENT_ID`, `AZURE_TENANT_ID` and `AZURE_FEDERATED_TOKEN_FILE`.

### Database initialisation

For each of the servers the database can be setup using the (m.m.) command 
```
NODE_ENV=development npm run init-database
```
This will create the tables and relations.

It will also create initial data from the seeds `directory`. This is split up in default and enviroment data. A file `local.js` here will be run, if available.

Since databases are connected (e.g. the API needs to know clients info on the auth server) these scripts are also available from the headless root directory:
```
NODE_ENV=development npm run init-databases
```

### Database migration

Updates to the database, that is: changes in the models, should be done through a file in the `./migrations` directory.

The command 
```
npm run migrate-database
```
can be run to update your cureent database to the newer version.

A boilerplate migration file could look like this:
```
const { Sequelize } = require('sequelize');

module.exports = {
  async up ({ context: queryInterface }) {
    await queryInterface.addColumn( 'resources', 'example1', {
      type: Sequelize.JSON,
      defaultValue: {},
      allowNull: false,
      after: 'extraData'
    });
    await queryInterface.addColumn( 'resources', 'example2', {
      type: Sequelize.INTEGER,
      allowNull: true,
      after: 'example1'
    });
  },

  async down ({ context: queryInterface }) {
    queryInterface.removeColumn( 'resources', 'example1' );
    queryInterface.removeColumn( 'resources', 'example2' );
  }
};
```

Filename convention is: sequence number + short description, e.g. `030-add-resource-example-fields`.

To revert migrations use
```
npm run migrate-database -- down
```
or
```
npm run migrate-database -- down step=2
```
