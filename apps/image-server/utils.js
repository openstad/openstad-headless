const crypto = require('crypto')

const sanitizeFileName = (fileName) => {
  if (!fileName) {
    return fileName;
  }
  let sanitizedFileName = fileName.replace(/[^a-z0-9_\-]/gi, '_');
  return sanitizedFileName.replace(/_+/g, '_');
}

const createFilename = (originalFileName) => {
  const fileExtension = originalFileName.split('.').pop();
  const fileNameWithoutExtension = originalFileName.substring(0, originalFileName.lastIndexOf('.')) || originalFileName
  const sanitizedFileName = sanitizeFileName(fileNameWithoutExtension);

  const randomUUID = crypto.randomUUID();

  return `${sanitizedFileName}-${randomUUID}.${fileExtension}`;
}

module.exports = {
    sanitizeFileName,
    createFilename
}
