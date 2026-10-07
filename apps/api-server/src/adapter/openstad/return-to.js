function setQueryParam(url, name, value) {
  const stripped = String(url)
    .replace(new RegExp(`([?&])${name}=[^&]*&`, 'g'), '$1')
    .replace(new RegExp(`[?&]${name}=[^&]*$`), '');

  return `${stripped}${stripped.includes('?') ? '&' : '?'}${name}=${value}`;
}

// The allowlist only compares hosts; in production never send a jwt to a
// plain-http url (query string or postMessage)
function canSendJwtTo(url, env = process.env) {
  if (env.NODE_ENV !== 'production' || env.FORCE_HTTP) return true;
  try {
    return new URL(url).protocol === 'https:';
  } catch (err) {
    return false;
  }
}

module.exports = { canSendJwtTo, setQueryParam };
