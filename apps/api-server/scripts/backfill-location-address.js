require('dotenv').config();
const db = require('../src/db');
const {
  hasCoordinates,
  lookupLocationAddress,
} = require('../src/lib/location-address');

async function run() {
  const projectId = Number(process.argv[2]);
  if (!Number.isInteger(projectId)) {
    console.error(
      'Usage: node scripts/backfill-location-address.js <projectId>'
    );
    process.exit(1);
  }

  const reverseApiUrl = process.env.ZIPCODE_REVERSE_API_URL;
  if (!reverseApiUrl) {
    console.error('ZIPCODE_REVERSE_API_URL is not set');
    process.exit(1);
  }

  const resources = await db.Resource.unscoped().findAll({
    where: { projectId },
    attributes: ['id', 'location'],
  });

  let updated = 0;
  let skipped = 0;
  let failed = 0;

  for (const resource of resources) {
    const location = resource.location;
    if (!hasCoordinates(location) || location.address) {
      skipped++;
      continue;
    }

    try {
      const address = await lookupLocationAddress(location, reverseApiUrl);
      if (!address) {
        skipped++;
        continue;
      }
      resource.set('location', { ...location, address });
      await resource.save({ validate: false, hooks: false });
      updated++;
    } catch (err) {
      failed++;
      console.error(`Resource ${resource.id}: ${err.message}`);
    }
  }

  console.log(`Done. updated=${updated} skipped=${skipped} failed=${failed}`);
  process.exit(0);
}

run();
