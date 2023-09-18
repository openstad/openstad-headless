require('dotenv').config();
const db = require('../db');

(async () => {

  try {

    console.log('Create database...');
    await db.sequelize.query('SET FOREIGN_KEY_CHECKS = 0', { raw: true });
    await db.sequelize.sync({ force: true });

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
