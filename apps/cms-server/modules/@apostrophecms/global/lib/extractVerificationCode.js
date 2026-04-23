// Extracts a clean verification code from a Google Search Console meta tag.
// Returns the code string if valid, or null if the input is not a valid tag.
function extractVerificationCode(input) {
  if (!input || typeof input !== 'string') {
    return null;
  }

  const tag = input.trim().toLowerCase();
  if (
    !tag.startsWith('<meta') ||
    !tag.includes('name="google-site-verification"') ||
    !tag.includes('content="') ||
    !tag.endsWith('>')
  ) {
    return null;
  }

  const match = input.match(/content="([^"]+)"/i);
  if (!match || !match[1]) {
    return null;
  }

  const code = match[1].trim();
  if (!/^[a-zA-Z0-9_\-/+=]+$/.test(code)) {
    return null;
  }

  return code;
}

module.exports = extractVerificationCode;
