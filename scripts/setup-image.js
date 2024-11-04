const fs = require('fs');
const execute = require('./execute');

module.exports = async function setupImageServer(actions) {

  console.log('==============================');
  console.log('Setup image server');
  
  try {

    // create local config
    let imgConfig = `
APP_URL=${process.env.IMAGE_APP_URL}
PORT_API=${process.env.IMAGE_PORT_API}
PORT_IMAGE_SERVER=${process.env.IMAGE_PORT_IMAGE_SERVER}

IMAGES_DIR=${process.env.DOCUMENTS_DIR || '/documents'}
IMAGES_DIR=${process.env.IMAGE_IMAGES_DIR || '/images'}
IMAGE_VERIFICATION_TOKEN=${process.env.IMAGE_VERIFICATION_TOKEN}
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
    if (actions['init images']) {
      console.log('------------------------------');
      console.log('Init default images');
      await execute('npm', ['run', 'init-images'], { cwd: './apps/image-server' });
    }
    
  } catch(err) {
    console.log('------------------------------');
    console.log('Image server initialisatie error');
    console.log(err);
    process.exit();
  }
}
 
