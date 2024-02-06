const nodemon = require('nodemon');
const { execSync, exec } = require('child_process');

const {
  buildPackage,
  dependencyPackages,
  buildPackageByDirectory,
} = require('./scripts/lib/build-package');
const getHeadlessDependencyTree = require('./scripts/get-headless-dependency-tree');
const { resolve } = require('path');
const { hashElement } = require('folder-hash');
const fs = require('fs');

// Get directories based on current directory
const currentDirectory = process.cwd();
const headlessDirectory = resolve(currentDirectory, '../../');
const packageDirectory = resolve(headlessDirectory, 'packages');

let packagesBuilt = false;
let restarting = null;

nodemon({
  script: 'server.js',
  ext: 'js,ts,tsx,css',
  ignore: [`${packageDirectory}/**/dist/*`],
  watch: [headlessDirectory],
})
  .on('start', async () => {
    if (restarting) {
      await restarting;
    }
    if (packagesBuilt) return;
    console.log(
      '[!!!] first start, building all packages... [npm run build-packages]'
    );
    const output = execSync(`npm run build-packages`);
    console.log(output.toString());
  })
  .on('restart', async (changedFiles) => {
    // Because this function is async, the `start` function will start straight away
    // we use a promise on the `restarting` variable to block starting the server until after we resolve it
    let resolveRestart;
    restarting = new Promise((resolve) => {resolveRestart = resolve});
    
    const basePath = resolve(process.cwd(), '../../');
    const packagesPath = resolve(basePath, 'packages');

    console.log('[!!!] nodemon restarted', changedFiles);

    const buildPackages = new Set();
    const buildDependents = new Set();

    // Get headless dependency tree
    const dependencyTree = await getHeadlessDependencyTree();

    // Get package based on changed files
    changedFiles.forEach((file) => {
      if (file.startsWith(packagesPath)) {
        // Remove packages path from file
        const package = file.replace(packagesPath, '').split('/')[1];
        buildPackages.add(package);

        if (dependencyTree[package]) {
          dependencyTree[package].forEach((dependentPackage) => {
            buildDependents.add(dependentPackage);
          });
        }
      }
    });

    // If one of the changedFiles is a dependency package, rebuild all packages
    if (buildPackages.size > 0 || buildDependents.size > 0) {
      console.log(
        `[!!!] building packages: ${Array.from(buildPackages)
          .concat(Array.from(buildDependents))
          .join(', ')}`
      );

      // Build packages first
      buildPackages.forEach((package) => {
        buildPackageByDirectory(package);
      });

      // Build dependants after
      buildDependents.forEach((package) => {
        buildPackageByDirectory(package);
      });

      // Calculate a new hash, so we dont have to rebuild upon new start
      const hashFile = '../../.packages-build-hash';

      const currentHash = await hashElement('../../packages', {
        folders: {
          exclude: [
            '.*',
            'node_modules',
            'dist',
            'build',
            'coverage',
            'public',
          ],
        },
      });

      fs.writeFileSync(hashFile, currentHash.hash);
    }

    packagesBuilt = true;
    resolveRestart();
  });
