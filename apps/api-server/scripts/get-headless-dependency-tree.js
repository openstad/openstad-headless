const util = require('util');
const fs = require('fs');
const readdir = util.promisify(fs.readdir);
const access = util.promisify(fs.access);
const readFile = util.promisify(fs.readFile);

async function getHeadlessDependencyTree() {
  const path = require('path');

  const packagesDir = '../../packages';
  let headlessDependencyTree = {};

  const files = await readdir(packagesDir);

  for (const file of files) {
    const packageDir = path.join(packagesDir, file);
    const packageJsonPath = path.join(packageDir, 'package.json');

    try {
      await access(packageJsonPath, fs.constants.F_OK);
      const data = await readFile(packageJsonPath, 'utf8');
      const packageJson = JSON.parse(data);
      const dependencies = Object.keys(packageJson.dependencies || {});

      const openstadDependencies = dependencies
        .filter((dep) => dep.startsWith('@openstad-headless'))
        .map((dep) => dep.replace('@openstad-headless/', ''));

      headlessDependencyTree[file] = openstadDependencies;
    } catch (err) {
      // Package.json does not exist / could not be opened, log it but skip for now
      console.error(`Error reading package.json: ${err}`);
    }
  }

  // Inverse the dependencies so we can easily look up which packages to rebuild
  let invertedDependencyTree = {};

  for (let key in headlessDependencyTree) {
    headlessDependencyTree[key].forEach((item) => {
      if (invertedDependencyTree[item]) {
        invertedDependencyTree[item].push(key);
      } else {
        invertedDependencyTree[item] = [key];
      }
    });
  }

  return invertedDependencyTree;
}

module.exports = getHeadlessDependencyTree;
