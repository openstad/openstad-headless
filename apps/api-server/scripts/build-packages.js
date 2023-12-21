const npm = require('npm-commands');

const widgetSettings = require('../src/routes/widget/widget-settings');

const packages = Object.keys(widgetSettings);

packages.forEach((package) => {
  console.log ('Building package: ' + package);
  npm().cwd(`../../packages/${package}`).output(true).run('install');
  npm().cwd(`../../packages/${package}`).output(true).run('build --if-present');
});
