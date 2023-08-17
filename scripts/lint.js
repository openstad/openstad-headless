const npm = require('npm-commands');

let args = '';
if (process.argv.length == 2) {
  args = '-- --ext .js src/**';
}

let command = 'lint:bare ' + args;
npm().cwd('.').output(true).run(command);
