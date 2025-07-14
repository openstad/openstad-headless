const fs = require('fs');
const path = require('path');
const { execSync } = require('child_process');

const packagesDir = path.resolve(__dirname, '../packages');
const packageFolders = fs.readdirSync(packagesDir);

for (const folder of packageFolders) {
  const packagePath = path.join(packagesDir, folder);
  const pkgJsonPath = path.join(packagePath, 'package.json');

  if (!fs.existsSync(pkgJsonPath)) continue;

  let command = `test:component`
  
  if (process.env?.CYPRESS_RECORD_KEY) {
    command = `test:component:record`;
  }
  
  const pkgJson = JSON.parse(fs.readFileSync(pkgJsonPath, 'utf8'));
  if (pkgJson.scripts && pkgJson.scripts[command]) {
    console.log(`\nRunning component tests in ${folder}...`);
    try {
      execSync(`npm run ${command}`, { stdio: 'inherit', cwd: packagePath });
    } catch (err) {
      console.error(`\nFailed running component test in ${folder}`);
      // Exit with a non-zero code to indicate failure
      process.exit(1);
    }
  }
}
