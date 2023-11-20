const execute = require('./execute');

async function start() {

  console.log('==============================');

  let command = 'node';
  
  try {
    console.log('Test for nodemon');
    await execute('nodemon', ['--version'], { cwd: '.' });
    command = 'nodemon'
  } catch (err) {
    console.log('nodemon not found');
  }

  
  try {
    
    console.log('Start auth server');
    execute(command, ['app.js'], { cwd: './apps/auth-server' });

    console.log('Start image server');
    execute(command, ['server.js'], { cwd: './apps/image-server' });

    console.log('Start API server');
    execute(command, ['server.js'], { cwd: './apps/api-server' });

    console.log('Start admin server');
    execute('npm', ['run', 'dev'], { cwd: './apps/admin-server' });

  } catch (err) {
    console.log('ERROR');
    console.log(err);
    process.exit();
  }

}

start();

