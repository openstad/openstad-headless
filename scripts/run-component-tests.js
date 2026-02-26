const fs = require('fs');
const path = require('path');
const { execFileSync } = require('child_process');

const packagesDir = path.resolve(__dirname, '../packages');
const packageFolders = fs.readdirSync(packagesDir);

const ciBuildId = process.env?.BUILD_ID;
console.log(`CI Build ID: ${ciBuildId}`);

for (const folder of packageFolders) {
  const packagePath = path.join(packagesDir, folder);
  const pkgJsonPath = path.join(packagePath, 'package.json');
  const cypressPath = path.join(packagePath, 'cypress');
  const cypressComponentPath = path.join(cypressPath, 'component');

  if (!fs.existsSync(pkgJsonPath)) continue;

  let args = ['run', '--component'];

  // get current folder name
  const group = folder.trim().replace(/\ /g, '-').toLowerCase();

  if (process.env?.CYPRESS_RECORD_KEY) {
    args.push('--record', `--group=${group}`, '--tag=component');

    if (ciBuildId) {
      args.push(` --ci-build-id=${ciBuildId}`);
    }
  }

  // Check if the package has cypress component tests defined
  if (!fs.existsSync(cypressPath) || !fs.existsSync(cypressComponentPath)) {
    console.log(
      `\nSkipping ${folder} as it does not have component tests defined.`
    );
    continue;
  }
  console.log(`\nRunning component tests in ${folder}...`);
  try {
    execFileSync('cypress', args, { stdio: 'inherit', cwd: packagePath });
  } catch (err) {
    console.error(`\nFailed running component test in ${folder}`);
    // Exit with a non-zero code to indicate failure
    process.exit(1);
  }
}
