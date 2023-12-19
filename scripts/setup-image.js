const fs = require('fs');
const util = require('util');
const imgDb = require('promise-mysql');
const execute = require('./execute');

module.exports = async function setupImageServer(actions) {

  console.log('==============================');
  console.log('Setup image server');

  let connection;

  let doCreateDB;
  try {
    
    connection = await imgDb.createConnection({
      host     : process.env.IMAGE_DB_HOST,
      user     : process.env.IMAGE_DB_USERNAME,
      password : process.env.IMAGE_DB_PASSWORD,
      dialect  : process.env.IMAGE_DB_DIALECT,
    });

    await connection.query(`USE \`${process.env.IMAGE_DB_NAME}\`;`);

  } catch(err) {
    doCreateDB = true;
  }

  try {

    // create database?
    if (doCreateDB) {

      console.log('------------------------------');
      console.log('Create database');

      await connection.query(`CREATE DATABASE \`${process.env.IMAGE_DB_NAME}\`;`)
      await connection.query(`USE \`${process.env.IMAGE_DB_NAME}\`;`);
      
    } else {
      console.log('------------------------------');
      console.log('Database exists');
    }

    // check database
    let doCreateDBTables = false;
    let rows = await connection.query('SHOW TABLES;')
    if (!(rows && rows.length)) {
      doCreateDBTables = true;
    }

    // create local config
    let imgConfig = `
APP_URL=${process.env.IMAGE_APP_URL}
PORT_API=${process.env.IMAGE_PORT_API}
PORT_IMAGE_SERVER=${process.env.IMAGE_PORT_IMAGE_SERVER}

DB_HOST=${process.env.IMAGE_DB_HOST}
DB_USER=${process.env.IMAGE_DB_USERNAME}
DB_PASSWORD=${process.env.IMAGE_DB_PASSWORD}
DB_NAME=${process.env.IMAGE_DB_NAME}

IMAGES_DIR=${process.env.IMAGE_IMAGES_DIR}
THROTTLE=${process.env.IMAGE_THROTTLE}
THROTTLE_CC_PROCESSORS=${process.env.IMAGE_THROTTLE_CC_PROCESSORS}
THROTTLE_CC_PREFETCHER=${process.env.IMAGE_THROTTLE_CC_PREFETCHER}
THROTTLE_CC_REQUESTS=${process.env.IMAGE_THROTTLE_CC_REQUESTS}
`

    if (actions['create config']) {
      console.log('------------------------------');
      console.log('Create config file');
      await fs.writeFileSync('./apps/image-server/.env', imgConfig);
    }

    // npm i
    if (actions['npm install']) {
      console.log('------------------------------');
      console.log('Execute `npm i`');
      await execute('npm', ['i'], { cwd: './apps/image-server' });
    }
    
    // init db
    if (actions['init database']) {
      if (1 || doCreateDBTables) { // TODO: hij update voor nu altijd
        console.log('------------------------------');
        console.log('Init IMAGE database');
        await execute('npm', ['run', 'init-database'], { cwd: './apps/image-server' });
      } else {
        console.log('------------------------------');
        console.log('IMAGE database already initialized');
      }

      // create client
      // rows = await connection.query('SELECT * FROM clients;')
      // if (rows && rows.length) {
      //   console.log('Now update existing client');
      //   await connection.query('UPDATE clients SET clientName = ?, token = ?, displayName = ? WHERE id = ?', [process.env.IMAGE_CLIENT_NAME, process.env.IMAGE_CLIENT_TOKEN, process.env.IMAGE_CLIENT_DISPLAY_NAME, 1 ]);
      // } else {
      //   console.log('Create a client');
      //   await connection.query('INSERT INTO clients VALUES( ?, ?, ?, ?, NOW(), NOW() );', [1, process.env.IMAGE_CLIENT_NAME, process.env.IMAGE_CLIENT_TOKEN, process.env.IMAGE_CLIENT_DISPLAY_NAME])
      // }
    }
    
  } catch(err) {
    console.log('------------------------------');
    console.log('Image server initialisatie error');
    console.log(err);
    process.exit();
  }
}
 
