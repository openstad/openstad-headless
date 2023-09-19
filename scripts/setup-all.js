require('dotenv').config();
const config = require('./config');
const initApi = require('./setup-api');
const initImageServer = require('./setup-image');
const initAuthServer = require('./setup-auth');
const createNginxConfigExample = require('./create-nginx-config-example');

let modules = [
  initApi,
  initImageServer,
  initAuthServer,
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

  try {
    for (let i = 0; i < modules.length; i++) {
      await modules[i]();
    }
  } catch(err) {
    console.log(err);
    process.exit();
  }
}

init();

