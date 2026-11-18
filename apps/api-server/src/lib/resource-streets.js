function collectStreets(resources) {
  const streets = new Map();
  for (const resource of resources) {
    const address = resource?.location?.address;
    if (!address?.street) continue;
    const city = address.city || '';
    const key = `${address.street}|${city}`;
    if (!streets.has(key)) streets.set(key, { street: address.street, city });
  }
  return [...streets.values()].sort(
    (a, b) =>
      a.street.localeCompare(b.street, 'nl') ||
      a.city.localeCompare(b.city, 'nl')
  );
}

function parseStreetsParam(raw) {
  let parsed;
  try {
    parsed = JSON.parse(raw);
  } catch (err) {
    return null;
  }
  if (!Array.isArray(parsed)) return null;
  return parsed
    .filter((item) => item && typeof item.street === 'string')
    .map((item) => ({
      street: item.street,
      city: typeof item.city === 'string' ? item.city : '',
    }));
}

function matchesStreets(resource, streets) {
  const address = resource?.location?.address;
  if (!address?.street) return false;
  const city = address.city || '';
  return streets.some(
    (item) => item.street === address.street && item.city === city
  );
}

module.exports = { collectStreets, parseStreetsParam, matchesStreets };
