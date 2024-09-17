const fs = require('fs');
const apiDb = require('mysql2/promise');
const execute = require('./execute');

module.exports = async function setupApi(actions) {

  console.log('==============================');
  console.log('Setup API');

  let connection;

  let doCreateDB;
  try {
    
    connection = await apiDb.createConnection({
      host     : process.env.API_DB_HOST,
      user     : process.env.API_DB_USERNAME,
      password : process.env.API_DB_PASSWORD,
      dialect  : process.env.API_DB_DIALECT,
    });
    
    await connection.query(`USE \`${process.env.API_DB_NAME}\`;`);

  } catch(err) {
    doCreateDB = true;
  }

  try {

    // create database?
    if (doCreateDB) {

      console.log('------------------------------');
      console.log('Create database');

      await connection.query(`CREATE DATABASE \`${process.env.API_DB_NAME}\`;`)
      await connection.query(`USE \`${process.env.API_DB_NAME}\`;`);
      
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

    let fixed_auth_tokens = process.env.API_AUTH_FIXEDAUTHTOKENS || '[{"token":"${process.env.API_FIXED_AUTH_KEY}","userId":"1","authProvider":"openstad"}]';

    // create local config
    let apiConfig = `
URL=${process.env.API_URL}
DOMAIN=${process.env.API_DOMAIN}
PORT=${process.env.API_PORT}

DB_HOST=${process.env.API_DB_HOST}
DB_USERNAME=${process.env.API_DB_USERNAME}
DB_PASSWORD=${process.env.API_DB_PASSWORD}
DB_NAME=${process.env.API_DB_NAME}
DB_PORT=${process.env.API_DB_PORT}
DB_DIALECT=${process.env.API_DB_DIALECT}

MESSAGESTREAMING_REDIS_URL=${process.env.MESSAGESTREAMING_REDIS_URL}
MESSAGESTREAMING_POSTFIX=${process.env.MESSAGESTREAMING_POSTFIX}

FROM_EMAIL_ADDRESS=${process.env.API_FROM_EMAIL_ADDRESS}
SMTP_HOST=${process.env.API_SMTP_HOST}
SMTP_PORT=${process.env.API_SMTP_PORT}
SMTP_SECURE=${process.env.API_SMTP_SECURE}
SMTP_USERNAME=${process.env.API_SMTP_USERNAME}
SMTP_PASSWORD=${process.env.API_SMTP_PASSWORD}

AUTH_JWTSECRET=${process.env.API_JWT_SECRET}
AUTH_ADAPTER_OPENSTAD_SERVERURL=${process.env.AUTH_APP_URL}
AUTH_FIXEDAUTHTOKENS='${fixed_auth_tokens}'

IMAGE_APP_URL=${process.env.IMAGE_APP_URL}
IMAGE_VERIFICATION_TOKEN=${process.env.IMAGE_VERIFICATION_TOKEN}
ADMIN_DOMAIN=${process.env.ADMIN_DOMAIN}
`
    if (actions['create config']) {
      console.log('------------------------------');
      console.log('Create config file');
      console.log('API_FIXED_AUTH_KEY:', process.env.API_FIXED_AUTH_KEY);
      await fs.writeFileSync('./apps/api-server/.env', apiConfig);
    }
    
    // npm i
    if (actions['npm install']) {
      console.log('------------------------------');
      console.log('Execute `npm i`');
      await execute('npm', ['i'], { cwd: './apps/api-server' });
    }
    
    // init db
    if (actions['init database']) {
      if (1 || doCreateDBTables) { // TODO: hij update voor nu altijd
        console.log('------------------------------');
        console.log('Init API database');
        await execute('npm', ['run', 'init-database'], { cwd: './apps/api-server' });
      } else {
        console.log('------------------------------');
        console.log('API database already initialized');
      }

      // console.log('Update database records');
      // TODO: je kunt met process.env.WHATEVER de seeds vullen vanaf hier, en zo de hele basis setup configureerbar maken
    }
    
  } catch(err) {
    console.log('------------------------------');
    console.log('API initialisatie error');
    console.log(err);
    process.exit();
  }

}
