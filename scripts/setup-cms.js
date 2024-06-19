const fs = require('fs');
const util = require('util');
const execute = require('./execute');

module.exports = async function setupCmsServer(actions) {

  console.log('==============================');
  console.log('Setup CMS server');
  
  try {

    // create local config
    let cmsConfig = `
PORT=${process.env.CMS_PORT}
OVERWRITE_URL=${process.env.CMS_OVERWRITE_URL}

MONGODB_URI=${process.env.CMS_MONGODB_URI}
CMS_DEFAULTS=${process.env.CMS_DEFAULT_SETTINGS}

MESSAGESTREAMING_REDIS_URL=${process.env.MESSAGESTREAMING_REDIS_URL}
MESSAGESTREAMING_POSTFIX=${process.env.MESSAGESTREAMING_POSTFIX}

API_URL=${process.env.API_URL}
API_KEY=${process.env.API_FIXED_AUTH_KEY}
`

    if (actions['create config']) {
      console.log('------------------------------');
      console.log('Create config file');
      await fs.writeFileSync('./apps/cms-server/.env', cmsConfig);
    }

    // npm i
    if (actions['npm install']) {
      console.log('------------------------------');
      console.log('Execute `npm i`');
      await execute('npm', ['i'], { cwd: './apps/cms-server' });
    }
    
  } catch(err) {
    console.log('------------------------------');
    console.log('CMS server initialisatie error');
    console.log(err);
    process.exit();
  }
}
 
