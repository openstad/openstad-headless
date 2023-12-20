const npm = require('npm-commands');

const packages = ['comments', 'likes'];

packages.forEach((package) => {
  console.log ('Building package: ' + package);
  npm().cwd(`packages/${package}`).output(true).run('install');
  npm().cwd(`packages/${package}`).output(true).run('build --if-present');
});
