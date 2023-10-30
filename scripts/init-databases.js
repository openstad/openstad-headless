require('dotenv').config();
const execute = require('./execute');

async function init() {
  try {

    // configure
    const config = require('./config');

    // init api db
    console.log('------------------------------');
    console.log('Init API database');
    await execute('npm', ['run', 'init-database'], { cwd: './apps/api-server' });

    // init auth db
    console.log('------------------------------');
    console.log('Init AUTH database');
    await execute('npm', ['run', 'init-database'], { cwd: './apps/auth-server' });

    // init image db
    console.log('------------------------------');
    console.log('Init IMAGE database');
    await execute('npm', ['run', 'init-database'], { cwd: './apps/image-server' });

  } catch(err) {
    console.log(err);
    process.exit();
  }
}

init();

