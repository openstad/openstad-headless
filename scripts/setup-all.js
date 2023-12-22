require('dotenv').config();
const config = require('./config');
const initApi = require('./setup-api');
const initImageServer = require('./setup-image');
const initAuthServer = require('./setup-auth');
const initAdminServer = require('./setup-admin');
const createNginxConfigExample = require('./create-nginx-config-example');

let modules = [
  initApi,
  initImageServer,
  initAuthServer,
  initAdminServer,
  createNginxConfigExample,
  function() {
    return new Promise((resolve, reject) => {
      console.log('==============================');
      console.log('Done');
      process.exit();
      resolve();
    })
  }
];

async function init() {

  let actions = {
    'create config': true,
    'npm install': true,
    'init database': true,
    'create certs': true,
    'build': true,
  }
  
  // command line arguments
  process.argv.forEach((entry) => {
    let match = entry.match(/--no-npm-install/);
    if (match) {
      actions['npm install'] = false;
    }
    match = entry.match(/--no-certs/);
    if (match) {
      actions['create certs'] = false;
    }
  });

  try {
    for (let i = 0; i < modules.length; i++) {
      await modules[i](actions);
    }
  } catch(err) {
    console.log(err);
    process.exit();
  }
}

init();

