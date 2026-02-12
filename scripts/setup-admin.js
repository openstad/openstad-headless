const fs = require('fs');
const execute = require('./execute');

module.exports = async function setupAdminServer(actions) {

  console.log('==============================');
  console.log('Setup admin server');

  try {

    // create local config
    let imgConfig = `
URL=${process.env.ADMIN_URL}
COOKIE_SECRET=${process.env.ADMIN_COOKIE_SECRET}
CLIENT_ID=${process.env.AUTH_ADMIN_CLIENT_ID}
CLIENT_SECRET=${process.env.AUTH_ADMIN_CLIENT_SECRET}
OAUTH_URL=${process.env.AUTH_APP_URL}
API_URL=${process.env.API_URL}
API_URL_INTERNAL=${process.env.API_URL}
API_FIXED_AUTH_KEY=${process.env.API_FIXED_AUTH_KEY}
PORT=${process.env.ADMIN_PORT}
`
    if (actions['create config']) {
      console.log('------------------------------');
      console.log('Create config file');
      await fs.writeFileSync('./apps/admin-server/.env', imgConfig);
    }
    
    // npm i
    if (actions['npm install']) {
      console.log('------------------------------');
      console.log('Execute `npm i`');
      await execute('npm', ['i'], { cwd: './apps/admin-server' });
    }
    
  } catch(err) {
    console.log('------------------------------');
    console.log('Admin server initialisatie error');
    console.log(err);
    process.exit();
  }
}

