require('dotenv').config({ path: '../../.env' })
require('dotenv').config({ path: '.env' })

const config = require('config');
const db = require('../src/db');

const { Umzug, SequelizeStorage } = require('umzug');

(async () => {
  const resetDatabase = async () => {
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
  }

  const args = process.argv.slice(2);
  
  const isDatabaseEmpty = async () => {
    try {
      const tables = await db.sequelize.query('SHOW TABLES');
      return tables[0].length === 0
    } catch (err) {
      console.error("Error while checking database tables:", err);
      process.exit(0);
    }
  }

  if (await isDatabaseEmpty() || args?.includes('--force')) {
    console.log('Initializing the database...');
    await resetDatabase();
  } else {
    console.log('Skipping database initialization, because tables already exist. To force reset the database, use the --force flag.')
    process.exit(0);
  }
})();
