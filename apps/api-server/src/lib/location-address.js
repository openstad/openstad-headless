const LOOKUP_TIMEOUT_MS = 3000;

function hasCoordinates(location) {
  return (
    !!location &&
    typeof location === 'object' &&
    Number.isFinite(Number(location.lat)) &&
    Number.isFinite(Number(location.lng))
  );
}

function sameCoordinates(a, b) {
  return (
    hasCoordinates(a) &&
    hasCoordinates(b) &&
    Number(a.lat) === Number(b.lat) &&
    Number(a.lng) === Number(b.lng)
  );
}

async function lookupLocationAddress({ lat, lng }, reverseApiUrl) {
  const url = new URL(reverseApiUrl);
  url.searchParams.set('lat', String(lat));
  url.searchParams.set('lng', String(lng));

  const response = await fetch(url, {
    signal: AbortSignal.timeout(LOOKUP_TIMEOUT_MS),
  });
  if (!response.ok) {
    throw new Error(
      `Reverse address lookup failed with status ${response.status}`
    );
  }

  const data = await response.json();
  const result = data?.results?.[0];
  if (!result?.straat) return null;

  return { street: result.straat, city: result.woonplaats || '' };
}

async function resolveLocationAddress({
  location,
  previous,
  isNewRecord,
  reverseApiUrl,
  lookup = lookupLocationAddress,
}) {
  if (!hasCoordinates(location)) return location;

  const { address: _submittedAddress, ...coordinates } = location;

  if (
    !isNewRecord &&
    sameCoordinates(coordinates, previous) &&
    previous.address
  ) {
    return { ...coordinates, address: previous.address };
  }

  if (!reverseApiUrl) return coordinates;

  try {
    const address = await lookup(coordinates, reverseApiUrl);
    return address ? { ...coordinates, address } : coordinates;
  } catch (err) {
    console.error(
      'Reverse address lookup failed, saving location without address:',
      err.message
    );
    return coordinates;
  }
}

module.exports = {
  hasCoordinates,
  sameCoordinates,
  lookupLocationAddress,
  resolveLocationAddress,
};
