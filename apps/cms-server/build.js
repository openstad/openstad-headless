// Generate a random release id and write it to the ./release-id file
// This allows Apostrophe to generate the assets with the correct cache busting
// And also allows the front end to know which release it is running
const releaseId = Math.random().toString(36).substring(2, 10);
console.log(`releaseId generated: ${releaseId}`);

// Write it to the ./release-id file
const fs = require('fs');
fs.writeFileSync('./release-id', releaseId);

const aposConfig = require('./lib/apos-config');
aposConfig.shortName = 'cms-server';
require('apostrophe')(aposConfig);
