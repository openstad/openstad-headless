require('dotenv').config({ path: '../../.env' })
require('dotenv').config({ path: '.env' })

const db = require('../db');

const { Umzug, SequelizeStorage } = require('umzug');

(async () => {

  const args = process.argv.slice(2);
  
  if (args.length > 0 && args[0] == '--only-if-empty') {
    try {
      // Check if there are tables in the database
      const tables = await db.sequelize.query('SHOW TABLES');

      if (tables && tables[0].length > 0) {
        console.log ('--only-if-empty was given, but database is not empty, skipping initialization');
        process.exit(0);
      }
      
    } catch (err) {
      console.log ('--only-if-empty was given, but we encountered an error while checking database, skipping initialization');
      process.exit(0);
    }
  }
  
  try {

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
    
    console.log('Create database...');
    await db.sequelize.query('SET FOREIGN_KEY_CHECKS = 0', { raw: true })
    await db.sequelize.sync({ force: true });

    console.log('Marking migrations as done...');
    let pendingMigrations = await umzug.pending();
    for (let migration of pendingMigrations) {
      await umzug.storage.logMigration(migration)
    }

    console.log('Adding data...');

    let datafile = 'default';
    try {
      await require(`../seeds/${datafile}`)(db);
    } catch(err) {
      console.log(err);
    }

		datafile = process.env.NODE_ENV || 'development';
		try {
			await require(`../seeds/${datafile}`)(db);
		} catch(err) {
      if (err && err.message && err.message.match(/Cannot find module/)) {
        console.log(`  no ${datafile} data seeds found`);
      } else {
        console.log(err.message);
      }
		}

    datafile = 'local';
    try {
      await require(`../seeds/${datafile}`)(db);
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
