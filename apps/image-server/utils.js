const crypto = require('crypto');
const s3 = require('./s3');

const sanitizeFileName = (fileName) => {
  if (!fileName) {
    return fileName;
  }
  let sanitizedFileName = fileName.replace(/[^a-z0-9_\-]/gi, '_');
  return sanitizedFileName.replace(/_+/g, '_');
};

const createFilename = (originalFileName) => {
  const fileExtension = originalFileName.split('.').pop();
  const fileNameWithoutExtension =
    originalFileName.substring(0, originalFileName.lastIndexOf('.')) ||
    originalFileName;
  const sanitizedFileName = sanitizeFileName(fileNameWithoutExtension);

  const randomUUID = crypto.randomUUID();

  return `${sanitizedFileName}-${randomUUID}.${fileExtension}`;
};

const getFileUrl = (file, fileType = 'image') => {
  let url = `${process.env.APP_URL}/${fileType}/${sanitizeFileName(file.filename)}`;

  if (s3.isEnabled()) {
    // fileName is already sanitized in S3 setup
    // remove folder prefix set in key (/documents or /images)
    const newFileName = file.key.replace(new RegExp(`^${fileType}s/`), '');
    url = `${process.env.APP_URL}/${fileType}/${newFileName}`;
  }

  return url;
};

module.exports = {
  sanitizeFileName,
  createFilename,
  getFileUrl,
};
