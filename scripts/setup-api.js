const fs = require('fs');
const util = require('util');
const apiDb = require('promise-mysql');
const execute = require('./execute');

module.exports = async function setupApi() {

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

    // create local config
    let apiConfig = {

      url: process.env.API_URL,
      hostname: process.env.API_DOMAIN,

      database: {
        host     : process.env.API_DB_HOST,
        user     : process.env.API_DB_USERNAME,
        password : process.env.API_DB_PASSWORD,
        database : process.env.API_DB_NAME,
        dialect  : process.env.API_DB_DIALECT,
        multipleStatements: true
      },

      express: {
        port: process.env.API_PORT,
      },

      mail: {
        from: process.env.API_FROM_EMAIL_ADDRESS,
        transport: {
          smtp: {
            port: process.env.API_SMTP_PORT,
            host: process.env.API_SMTP_HOST,
            auth: {
              user: process.env.API_SMTP_USERNAME,
              pass: process.env.API_SMTP_PASSWORD,
            }
          }
        }
      },

      security: {
        sessions: {
          secret: process.env.API_COOKIE_SECRET,
          onlySecure: process.env.API_API_COOKIE_ONLY_SECURE,
        }
      },

      auth: {
		    adapter: {
			    openstad: {
            serverUrl: process.env.AUTH_APP_URL,
			    },
		    },
  	    jwtSecret: process.env.API_JWT_SECRET,
		    fixedAuthTokens: [
			    {
				    token: process.env.API_FIXED_AUTH_KEY,
				    userId: '1',
				    authProvider: 'openstad',
			    },
		    ]
      },


      // TODO: tmp !!
      dev: {
        "Header-Access-Control-Allow-Origin": "*"
      },

      
    }

    console.log('------------------------------');
    console.log('Create config file');
    console.log('API_FIXED_AUTH_KEY:', process.env.API_FIXED_AUTH_KEY);
    await fs.writeFileSync('./apps/api-server/config/local.js', 'module.exports = ' + JSON.stringify(apiConfig, null, 2) );

    // npm i
    console.log('------------------------------');
    console.log('Execute `npm i`');
    await execute('npm', ['i'], { cwd: './apps/api-server' });

    // init db
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
  
  } catch(err) {
    console.log('------------------------------');
    console.log('API initialisatie error');
    console.log(err);
    process.exit();
  }

}




