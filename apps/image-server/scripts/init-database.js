require('dotenv').config();
const db = require('../db');
const hat = require('hat');

(async () => {

  try {

    console.log('Create database...');
    await db.sequelize.sync({force: true})

    console.log('Adding data...');

    let datafile = 'default';
    try {
      await require(`../seeds/${datafile}`)(db);
    } catch(err) {
      console.log(err);
    }

    datafile = process.env.NODE_ENV;
    try {
      await require(`../seeds/${datafile}`)(db);
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
