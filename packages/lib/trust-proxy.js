// Express 'trust proxy' from TRUST_PROXY: a hop count, an address/subnet list
// or true/false. Unset keeps trusting every proxy (previous behaviour); set it
// to the real hop count so X-Forwarded-For cannot spoof req.ip.
module.exports = function trustProxy(value = process.env.TRUST_PROXY) {
  if (value === undefined || value === '' || value === 'true') return true;
  if (value === 'false') return false;
  return /^\d+$/.test(value) ? Number(value) : value;
};
