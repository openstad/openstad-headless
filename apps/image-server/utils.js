const crypto = require('crypto');
const s3 = require('./s3');

/**
 * Extensions the image server is able to both store and serve. Shared by the
 * upload filter and the image read route so a file can never be accepted on
 * upload and then rejected on every read.
 *
 * HEIC and HEIF are absent on purpose: the prebuilt sharp/libvips used here and
 * in the Docker image carries no HEVC codec, so image-steam cannot decode them,
 * and only Safari renders them in an img element.
 */
const ALLOWED_IMAGE_EXTENSIONS = [
  'jpg',
  'jpeg',
  'png',
  'gif',
  'bmp',
  'webp',
  'tiff',
];

const REJECTED_IMAGE_MIME_TYPES = [
  'image/heic',
  'image/heic-sequence',
  'image/heif',
  'image/heif-sequence',
];

const getFileExtension = (fileName) => {
  if (typeof fileName !== 'string' || !fileName.includes('.')) {
    return null;
  }
  const extension = fileName.split('.').pop().toLowerCase();
  return extension.length > 0 ? extension : null;
};

/**
 * Whether an uploaded file may be stored as an image. Both the reported mime
 * type and the extension have to describe a supported format, so a mismatch
 * such as IMG_1234.jpg sent as image/heic is refused.
 */
const isAllowedImageUpload = (fileName, mimeType) => {
  if (typeof mimeType !== 'string' || !mimeType.startsWith('image/')) {
    return false;
  }
  if (REJECTED_IMAGE_MIME_TYPES.includes(mimeType.toLowerCase())) {
    return false;
  }
  const extension = getFileExtension(fileName);
  return extension !== null && ALLOWED_IMAGE_EXTENSIONS.includes(extension);
};

const sanitizeFileName = (fileName) => {
  if (!fileName) {
    return fileName;
  }
  let sanitizedFileName = fileName.replace(/[^a-z0-9_\-]/gi, '_');
  return sanitizedFileName.replace(/_+/g, '_');
};

const MAX_FILENAME_LENGTH = 255;

const createFilename = (originalFileName) => {
  const fileExtension = sanitizeFileName(originalFileName.split('.').pop());
  const fileNameWithoutExtension =
    originalFileName.substring(0, originalFileName.lastIndexOf('.')) ||
    originalFileName;
  const sanitizedFileName = sanitizeFileName(fileNameWithoutExtension);

  const randomUUID = crypto.randomUUID();

  const suffixLength = randomUUID.length + fileExtension.length + 2;
  const maxBaseLength = Math.max(0, MAX_FILENAME_LENGTH - suffixLength);
  const truncatedFileName = sanitizedFileName.slice(0, maxBaseLength);

  return `${truncatedFileName}-${randomUUID}.${fileExtension}`;
};

const getFileUrl = (file, fileType = 'image') => {
  let url = `${process.env.APP_URL}/${fileType}/${sanitizeFileName(
    file.filename
  )}`;

  if (s3.isEnabled()) {
    // fileName is already sanitized in S3 setup
    // remove folder prefix set in key (/documents or /images)
    const newFileName = file.key.replace(new RegExp(`^${fileType}s/`), '');
    url = `${process.env.APP_URL}/${fileType}/${newFileName}`;
  }

  return url;
};

module.exports = {
  ALLOWED_IMAGE_EXTENSIONS,
  isAllowedImageUpload,
  sanitizeFileName,
  createFilename,
  getFileUrl,
};
