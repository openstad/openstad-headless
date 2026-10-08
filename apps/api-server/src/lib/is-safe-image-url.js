const UNSAFE_CHARACTERS = /[\x00-\x1f\x7f<>"'`\\\s]/;

function isSafeImageUrl(url) {
  if (typeof url !== 'string') return false;

  const value = url.trim();
  if (!value || UNSAFE_CHARACTERS.test(value)) return false;

  try {
    const { protocol } = new URL(value, 'https://openstad.invalid');
    return protocol === 'http:' || protocol === 'https:';
  } catch (err) {
    return false;
  }
}

module.exports = isSafeImageUrl;
