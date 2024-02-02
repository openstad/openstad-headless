const {execSync, exec} = require('child_process');
const getHeadlessDependencyTree = require("../get-headless-dependency-tree");

async function getDependencyPackages () {
  // Get headless dependency tree
  const dependencyTree = await getHeadlessDependencyTree();
  
  // List of packages on which other packages depend (e.g. `ui` or `lib`)
  return Object.keys(dependencyTree).filter(key => Array.isArray(dependencyTree[key]) && dependencyTree[key].length > 0);
}


function buildPackage (package) {
  
  const widgetSettings = require('../../src/routes/widget/widget-settings');

  if (!widgetSettings[package].directory) {
    console.log(`No directory found for package ${package}, skipping...`);
    return;
  }
  
  let packagePath = widgetSettings[package].directory;
  
  buildPackageByDirectory(packagePath);
  
}

function buildPackageByDirectory (directory) {
  console.log(`Building package in path: ${directory}`);
  
  execSync(`npm i --prefix=packages/${directory}`, {cwd: `../../`});
  execSync(`npm run build --if-present --prefix=packages/${directory}`, {cwd: `../../`});
  
  console.log(`Done building package in path: ${directory}`)
}

module.exports = { buildPackage, buildPackageByDirectory, getDependencyPackages };
