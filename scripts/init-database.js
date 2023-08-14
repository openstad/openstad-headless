const config = require('config');
const db = require('../src/db');

(async () => {

  try {

    console.log('Create database...');
    await db.sequelize.query('SET FOREIGN_KEY_CHECKS = 0', { raw: true })
    await db.sequelize.sync ({ force: true });
    
    console.log('Adding data...');

    let datafile = 'default';
    try {
      await require(`../seeds/${datafile}`)(config, db);
    } catch(err) {
      console.log(err);
    }

    datafile = process.env.NODE_ENV;
    try {
      await require(`../seeds/${datafile}`)(config, db);
    } catch(err) {
      console.log(err);
    }

  } catch (err) {
    console.log(err);
  } finally {
	  db.sequelize.close();
    process.exit();
  }

})();
