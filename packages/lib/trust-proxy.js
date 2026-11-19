module.exports = function trustProxy(value = process.env.TRUST_PROXY) {
  if (value === undefined || value === '' || value === 'true') return true;
  if (value === 'false') return false;
  return /^\d+$/.test(value) ? Number(value) : value;
};
