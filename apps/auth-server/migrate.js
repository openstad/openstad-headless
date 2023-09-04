require('dotenv').config();
const db = require('./db');
const { Umzug, SequelizeStorage } = require('umzug');

const umzug = new Umzug({
  migrations: { glob: './migrations/*.js' },
  // context: db.sequelize.getQueryInterface(),
  storage: new SequelizeStorage({ sequelize: db.sequelize, tableName : 'migrations' }),
  logger: console,
});

(async () => {
  let migrations = await umzug.up();
  if( !migrations.length ) {
		console.log('No new migrations');
	}
  process.exit();
})();
