function setQueryParam(url, name, value) {
  const stripped = String(url)
    .replace(new RegExp(`([?&])${name}=[^&]*&`, 'g'), '$1')
    .replace(new RegExp(`[?&]${name}=[^&]*$`), '');

  return `${stripped}${stripped.includes('?') ? '&' : '?'}${name}=${value}`;
}

module.exports = { setQueryParam };
