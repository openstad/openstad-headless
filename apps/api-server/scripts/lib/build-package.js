const {execSync, exec} = require('child_process');
const getHeadlessDependencyTree = require("../get-headless-dependency-tree");

async function getDependencyPackages () {
  // Get headless dependency tree
  const dependencyTree = await getHeadlessDependencyTree();
  
  // List of packages on which other packages depend (e.g. `ui` or `lib`)
  return Object.keys(dependencyTree).filter(key => Array.isArray(dependencyTree[key]) && dependencyTree[key].length > 0);
}


function buildPackage (package) {
  
  const getWidgetSettings = require('../../src/routes/widget/widget-settings');
  const widgetDefinitions = getWidgetSettings();

  if (!widgetDefinitions[package].directory) {
    console.log(`No directory found for package ${package}, skipping...`);
    return;
  }
  
  let packagePath = widgetDefinitions[package].directory;
  
  buildPackageByDirectory(packagePath);
  
}

function buildPackageByDirectory (directory) {
  console.log(`Building package in path: ${directory}`);
  
  //execSync(`npm i -w packages/${directory} --legacy-peer-deps`, {cwd: `../../`});
  execSync(`npm run build --if-present --w packages/${directory}`, {cwd: `../../`});
  
  console.log(`Done building package in path: ${directory}`)
}

module.exports = { buildPackage, buildPackageByDirectory, getDependencyPackages };
