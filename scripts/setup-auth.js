const fs = require('fs').promises;
const util = require('util');
const authDb = require('promise-mysql');
const execute = require('./execute');

module.exports = async function setupAuthServer() {

  console.log('==============================');
  console.log('Setup auth server');

  let connection;

  let doCreateDB;
  try {
    
    connection = await authDb.createConnection({
      host     : process.env.AUTH_DB_HOST,
      user     : process.env.AUTH_DB_USERNAME,
      password : process.env.AUTH_DB_PASSWORD,
      dialect  : process.env.AUTH_DB_DIALECT,
    });

    await connection.query(`USE \`${process.env.AUTH_DB_NAME}\`;`);

  } catch(err) {
    doCreateDB = true;
  }

  try {

    // create database?
    if (doCreateDB) {

      console.log('------------------------------');
      console.log('Create database');

      await connection.query(`CREATE DATABASE \`${process.env.AUTH_DB_NAME}\`;`)
      await connection.query(`USE \`${process.env.AUTH_DB_NAME}\`;`);
      
    } else {
      console.log('------------------------------');
      console.log('Database exists');
    }

    // check database
    let doCreateDBTables = false;
    let rows = await connection.query('SHOW TABLES;');
    if (!(rows && rows.length)) {
      doCreateDBTables = true;
    }

    // create local config
    let authConfig = `
APP_URL=${process.env.AUTH_APP_URL}
PORT=${process.env.AUTH_PORT}

DB_HOST=${process.env.AUTH_DB_HOST}
DB_USER=${process.env.AUTH_DB_USERNAME}
DB_PASSWORD=${process.env.AUTH_DB_PASSWORD}
DB_NAME=${process.env.AUTH_DB_NAME}

MAIL_SERVER_URL=${process.env.AUTH_MAIL_SERVER_URL}
MAIL_SERVER_PORT=${process.env.AUTH_MAIL_SERVER_PORT}
MAIL_SERVER_SECURE=${process.env.AUTH_MAIL_SERVER_SECURE}
MAIL_SERVER_PASSWORD=${process.env.AUTH_MAIL_SERVER_PASSWORD}
MAIL_SERVER_USER_NAME=${process.env.AUTH_MAIL_SERVER_USER_NAME}
FROM_NAME=${process.env.AUTH_FROM_NAME}
FROM_EMAIL=${process.env.AUTH_FROM_EMAIL}
EMAIL_ASSETS_URL=${process.env.AUTH_EMAIL_ASSETS_URL}

ADMIN_REDIRECT_URL=${process.env.AUTH_ADMIN_REDIRECT_URL}

COOKIE_SECURE_OFF=${process.env.AUTH_COOKIE_SECURE_OFF}
SESSION_SECRET=${process.env.AUTH_SESSION_SECRET}
`
    console.log('------------------------------');
    console.log('Create config file');
    await fs.writeFile('./apps/auth-server/.env', authConfig);

    // npm i
    console.log('------------------------------');
    console.log('Execute `npm i`');
    await execute('npm', ['i'], { cwd: './apps/auth-server' });
 
    // certs
    console.log('------------------------------');
    try {
      await fs.mkdir('apps/auth-server/certs')
      console.error('Certs dir created');
    } catch(err) {
      if (err.code !== 'EEXIST') {
        throw err;
        return;
      }
      console.error('Certs dir exists');
    }

    console.log('Create certificates');
    await execute('/usr/bin/openssl', ['genrsa', '-out', 'privatekey.pem', '2048'], { cwd: './apps/auth-server/certs/' });
    await execute('/usr/bin/openssl', ['req', '-new', '-key', 'privatekey.pem', '-out', 'certrequest.csr', '-subj', `/C=NL/ST=NA/L=NA/O=OpenStad/OU=OpenStad/CN=openstad.niels${process.env.BASE_DOMAIN}"`], { cwd: './apps/auth-server/certs/' });
    await execute('/usr/bin/openssl', ['x509', '-req', '-in', 'certrequest.csr', '-signkey', 'privatekey.pem', '-out', 'certificate.pem'], { cwd: './apps/auth-server/certs/' });

    // init db
    if (1 || doCreateDBTables) { // TODO: hij update voor nu altijd
      console.log('------------------------------');
      console.log('Init auth database');
      await execute('npm', ['run', 'init-database'], { cwd: './apps/auth-server' });
    } else {
      console.log('------------------------------');
      console.log('Auth database already initialized');
    }

    // init db oud
    // if (doCreateDBTables) {
    //  
    //   console.log('------------------------------');
    //   console.log('Create database tables');
    //   await execute('../node_modules/knex/bin/cli.js', ['migrate:latest'], { cwd: './apps/auth-server', env: { ...process.env } });
    //   await execute ('../node_modules/knex/bin/cli.js', ['seed:run'], { cwd: './apps/auth-server', env: { ...process.env,  AUTH_FIRST_CLIENT_ID: config.AUTH_FIRST_CLIENT_ID, AUTH_FIRST_CLIENT_SECRET: config.AUTH_FIRST_CLIENT_SECRET, AUTH_ADMIN_CLIENT_ID: config.AUTH_ADMIN_CLIENT_ID, AUTH_ADMIN_CLIENT_SECRET: config.AUTH_ADMIN_CLIENT_SECRET, FRONTEND_URL: config.FRONTEND_APP_URL, ADMIN_URL: config.ADMIN_APP_URL, API_URL: config.API_URL, } } );
    //   
    // } else {
    //  
    //   console.log('------------------------------');
    //   console.log('Database tables already exist - update records');
    //  
    //   const siteUrl = config.FRONTEND_APP_URL;
    //   const adminUrl = config.ADMIN_APP_URL;
    //  
    //   let allowedDomains = process.env.NODE_ENV === 'development' ? ['localhost'] : [];
    //   allowedDomains.push((config.API_URL || '').replace('http://', '').replace('https://', '').replace(/\/$/, ""));
    //   allowedDomains = JSON.stringify(allowedDomains);
    //  
    //   await connection.query('UPDATE clients SET siteUrl = ?, clientId = ?, clientSecret = ?, allowedDomains = ? WHERE id = 1;', [siteUrl,  config.AUTH_FIRST_CLIENT_ID, config.AUTH_FIRST_CLIENT_SECRET, allowedDomains]);
    //   await connection.query('UPDATE clients SET siteUrl = ?, clientId = ?, clientSecret = ?, allowedDomains = ? WHERE id = 2;', [adminUrl, config.AUTH_ADMIN_CLIENT_ID, config.AUTH_ADMIN_CLIENT_SECRET, allowedDomains]);
    //  
    // }
    
  } catch(err) {
    console.log('------------------------------');
    console.log('Auth server initialisatie error');
    console.log(err);
    process.exit();
  }

}
