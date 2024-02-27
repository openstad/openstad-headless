require('dotenv').config({ path: '../../.env' })
require('dotenv').config({ path: '.env' })

const config = require('config');
const db = require('../src/db');

const { Umzug, SequelizeStorage } = require('umzug');
const umzug = new Umzug({
  migrations: {
    glob: './migrations/*.js',
    params: [
            db.sequelize.getQueryInterface(),
            db.Sequelize // Sequelize constructor - the required module
        ],
     },
  context: db.sequelize.getQueryInterface(),
  storage: new SequelizeStorage({ sequelize: db.sequelize, tableName : 'migrations' }),
  logger: console,
});

(async () => {

  try {

    console.log('Create database...');

    if ( db.sequelize.options.dialect == 'postgres' ) {
      await db.sequelize.query('SET session_replication_role = "replica";', { raw: true })
    } else {
      await db.sequelize.query('SET FOREIGN_KEY_CHECKS = 0', { raw: true })
    }

    await db.sequelize.sync ({ force: true });

    console.log('Marking migrations as done...');
    let pendingMigrations = await umzug.pending();
    for (let migration of pendingMigrations) {
      await umzug.storage.logMigration(migration)
    }

    console.log('Adding data...');

    let datafile = 'default';
    try {
      await require(`../seeds/${datafile}`)(config, db);
    } catch(err) {
      console.log(err);
    }

		datafile = process.env.NODE_ENV || 'development';
		try {
			await require(`../seeds/${datafile}`)(config, db);
		} catch(err) {
      if (err && err.message && err.message.match(/Cannot find module/)) {
        console.log(`  no ${datafile} data seeds found`);
      } else {
        console.log(err.message);
      }
		}

    datafile = 'local';
    try {
      await require(`../seeds/${datafile}`)(config, db);
    } catch(err) {
      if (err && err.message && err.message.match(/Cannot find module/)) {
        console.log('  no local data seeds found');
      } else {
        console.log(err.message);
      }
    }

  } catch (err) {
    console.log(err);
  } finally {
	  db.sequelize.close();
    process.exit();
  }

})();
