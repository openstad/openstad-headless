const fs = require('fs');
const util = require('util');
const imgDb = require('promise-mysql');
const execute = require('./execute');

module.exports = async function setupAdminServer() {

  console.log('==============================');
  console.log('Setup admin server');

  try {

    // create local config
    let imgConfig = `
NEXTAUTH_URL=${process.env.ADMIN_URL}
NEXTAUTH_SECRET=openstad_headless
CLIENT_ID=${process.env.AUTH_ADMIN_CLIENT_ID}
CLIENT_SECRET=${process.env.AUTH_ADMIN_CLIENT_SECRET}
OAUTH_URL=${process.env.AUTH_APP_URL}
API_URL=${process.env.API_URL}
PORT=${process.env.ADMIN_PORT}
`
    console.log('------------------------------');
    console.log('Create config file');
    await fs.writeFileSync('./apps/admin-server/.env', imgConfig);

    // npm i
    console.log('------------------------------');
    console.log('Execute `npm i`');
    await execute('npm', ['i'], { cwd: './apps/admin-server' });
    
  } catch(err) {
    console.log('------------------------------');
    console.log('Admin server initialisatie error');
    console.log(err);
    process.exit();
  }
}

