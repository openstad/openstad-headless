const DEFAULT_MAX_FILE_UPLOAD_SIZE_MB = 25;
const PROXY_BODY_SIZE_HEADROOM_MB = 10;
const MAX_SANE_FILE_UPLOAD_SIZE_MB = 1000;

function resolveMaxUploadSizeMb(envValue) {
  const parsed = Number(envValue);
  const isValid =
    Number.isInteger(parsed) &&
    parsed > 0 &&
    parsed <= MAX_SANE_FILE_UPLOAD_SIZE_MB;
  const isBlank = envValue === undefined || String(envValue).trim() === '';

  if (!isValid && !isBlank) {
    console.warn(
      `MAX_FILE_UPLOAD_SIZE_MB=${envValue} is invalid (allowed 1-${MAX_SANE_FILE_UPLOAD_SIZE_MB}), using ${DEFAULT_MAX_FILE_UPLOAD_SIZE_MB}`
    );
  }

  return isValid ? parsed : DEFAULT_MAX_FILE_UPLOAD_SIZE_MB;
}

function resolveProxyBodyLimit(envValue) {
  return `${resolveMaxUploadSizeMb(envValue) + PROXY_BODY_SIZE_HEADROOM_MB}mb`;
}

module.exports = { resolveMaxUploadSizeMb, resolveProxyBodyLimit };
