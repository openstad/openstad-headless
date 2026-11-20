const { Transform } = require('node:stream');
const { Readable } = require('node:stream');
const { ALLOWED_IMAGE_EXTENSIONS } = require('./utils');

// Same ceiling the image and document routes already pass to multer.array.
const MAX_UPLOAD_FILES = 30;

const UNSUPPORTED_DOCUMENT_TYPE = 'UNSUPPORTED_DOCUMENT_TYPE';

// Magic-byte results from file-type. Legacy Office files (.doc/.xls/.ppt) are
// reported as application/x-cfb; the Open XML formats keep their own MIME types.
const DOCUMENT_MIME_TYPES = new Set([
  'application/pdf',
  'application/msword',
  'application/vnd.ms-excel',
  'application/vnd.ms-powerpoint',
  'application/vnd.openxmlformats-officedocument.wordprocessingml.document',
  'application/vnd.openxmlformats-officedocument.spreadsheetml.sheet',
  'application/vnd.openxmlformats-officedocument.presentationml.presentation',
  'application/x-cfb',
]);

const IMAGE_EXTENSION_ALIASES = {
  tif: 'tiff',
  jpg: 'jpeg',
};

function isAllowedImageExtension(ext) {
  if (typeof ext !== 'string') return false;
  const normalized = ext.toLowerCase();
  return (
    ALLOWED_IMAGE_EXTENSIONS.includes(normalized) ||
    ALLOWED_IMAGE_EXTENSIONS.includes(IMAGE_EXTENSION_ALIASES[normalized])
  );
}

function isAllowedDocumentDetection(detected) {
  if (!detected || typeof detected.mime !== 'string') return false;
  if (detected.mime.startsWith('image/')) {
    return isAllowedImageExtension(detected.ext);
  }
  return DOCUMENT_MIME_TYPES.has(detected.mime);
}

function unsupportedDocumentTypeError() {
  const error = new Error(
    'Unsupported document type. The file contents are not an allowed document or image.'
  );
  error.code = UNSUPPORTED_DOCUMENT_TYPE;
  error.status = 415;
  return error;
}

function requestSizeError(maxRequestBytes) {
  const maxMB = Math.max(1, Math.round(maxRequestBytes / (1024 * 1024)));
  const error = new Error(
    `Upload exceeds the maximum request size of ${maxMB} MB.`
  );
  error.code = 'LIMIT_REQUEST_SIZE';
  error.status = 413;
  return error;
}

function consumeUploadBudget(req, byteLength, maxRequestBytes) {
  const nextTotal = (req.uploadBytes || 0) + byteLength;
  if (nextTotal > maxRequestBytes) return requestSizeError(maxRequestBytes);
  req.uploadBytes = nextTotal;
  return null;
}

const PNG_SIGNATURE = Buffer.from([
  0x89, 0x50, 0x4e, 0x47, 0x0d, 0x0a, 0x1a, 0x0a,
]);
const CFB_SIGNATURE = Buffer.from([
  0xd0, 0xcf, 0x11, 0xe0, 0xa1, 0xb1, 0x1a, 0xe1,
]);

// "Leading bytes" (magic bytes): trusted file signatures at the start of a file.
// We prefer these over client-provided MIME or extension, which can be spoofed.
function startsWithBytes(buffer, signature) {
  return (
    buffer.length >= signature.length &&
    buffer.subarray(0, signature.length).equals(signature)
  );
}

function officeOpenXmlMime(buffer) {
  // The Open XML formats are zip archives. The entry names are ASCII, so a
  // latin1 view finds them without depending on where the central directory sits.
  const view = buffer.toString('latin1');
  if (view.includes('word/')) {
    return 'application/vnd.openxmlformats-officedocument.wordprocessingml.document';
  }
  if (view.includes('xl/')) {
    return 'application/vnd.openxmlformats-officedocument.spreadsheetml.sheet';
  }
  if (view.includes('ppt/')) {
    return 'application/vnd.openxmlformats-officedocument.presentationml.presentation';
  }
  return null;
}

/**
 * Identify a document from its leading bytes. The client MIME type and the
 * filename are not consulted. A zip that is not an Office Open XML file is
 * rejected, same as any unrecognised content.
 */
function detectFileType(buffer) {
  if (!Buffer.isBuffer(buffer) || buffer.length < 4) return null;

  // PNG fixed 8-byte signature.
  if (startsWithBytes(buffer, PNG_SIGNATURE)) {
    return { ext: 'png', mime: 'image/png' };
  }
  // JPEG files start with FF D8 FF.
  if (buffer[0] === 0xff && buffer[1] === 0xd8 && buffer[2] === 0xff) {
    return { ext: 'jpg', mime: 'image/jpeg' };
  }
  // GIF header includes the version marker.
  const head6 = buffer.subarray(0, 6).toString('ascii');
  if (head6 === 'GIF87a' || head6 === 'GIF89a') {
    return { ext: 'gif', mime: 'image/gif' };
  }
  // WEBP is RIFF with a WEBP marker at offset 8.
  if (
    buffer.length >= 12 &&
    buffer.subarray(0, 4).toString('ascii') === 'RIFF' &&
    buffer.subarray(8, 12).toString('ascii') === 'WEBP'
  ) {
    return { ext: 'webp', mime: 'image/webp' };
  }
  if (buffer[0] === 0x42 && buffer[1] === 0x4d) {
    return { ext: 'bmp', mime: 'image/bmp' };
  }
  const tiffLittle =
    buffer[0] === 0x49 &&
    buffer[1] === 0x49 &&
    buffer[2] === 0x2a &&
    buffer[3] === 0x00;
  const tiffBig =
    buffer[0] === 0x4d &&
    buffer[1] === 0x4d &&
    buffer[2] === 0x00 &&
    buffer[3] === 0x2a;
  if (tiffLittle || tiffBig) {
    return { ext: 'tiff', mime: 'image/tiff' };
  }
  // PDF starts with "%PDF-".
  if (buffer.subarray(0, 5).toString('ascii') === '%PDF-') {
    return { ext: 'pdf', mime: 'application/pdf' };
  }
  // Legacy Office binary container for doc/xls/ppt.
  if (startsWithBytes(buffer, CFB_SIGNATURE)) {
    return { ext: 'cfb', mime: 'application/x-cfb' };
  }

  // ZIP signatures; then inspect entries to allow only Office Open XML zips.
  const zip =
    buffer[0] === 0x50 &&
    buffer[1] === 0x4b &&
    ((buffer[2] === 0x03 && buffer[3] === 0x04) ||
      (buffer[2] === 0x05 && buffer[3] === 0x06) ||
      (buffer[2] === 0x07 && buffer[3] === 0x08));
  if (zip) {
    const mime = officeOpenXmlMime(buffer);
    return mime ? { ext: 'zip', mime } : null;
  }

  return null;
}

function readStreamToBuffer(stream) {
  return new Promise((resolve, reject) => {
    const chunks = [];
    let truncated = false;
    stream.on('limit', () => {
      truncated = true;
    });
    stream.on('data', (chunk) => chunks.push(chunk));
    stream.on('error', reject);
    stream.on('end', () => {
      if (truncated) {
        const error = new Error('File too large.');
        error.code = 'LIMIT_FILE_SIZE';
        error.status = 413;
        reject(error);
        return;
      }
      // Gather the whole upload so type checks can inspect magic bytes.
      resolve(Buffer.concat(chunks));
    });
  });
}

/**
 * Reject a document from its bytes. The client-declared MIME type and the
 * filename extension are ignored.
 */
function createValidatingDocumentStorage(baseStorage, maxRequestBytes) {
  return {
    _handleFile(req, file, cb) {
      readStreamToBuffer(file.stream)
        .then(async (buffer) => {
          const budgetError = consumeUploadBudget(
            req,
            buffer.length,
            maxRequestBytes
          );
          if (budgetError) throw budgetError;

          const detected = await detectFileType(buffer);
          if (!isAllowedDocumentDetection(detected)) {
            throw unsupportedDocumentTypeError();
          }

          // Hand storage a stream again after validating buffered bytes.
          Object.defineProperty(file, 'stream', {
            configurable: true,
            enumerable: false,
            value: Readable.from(buffer),
          });
          baseStorage._handleFile(req, file, cb);
        })
        .catch((error) => cb(error));
    },
    _removeFile(req, file, cb) {
      if (typeof baseStorage._removeFile === 'function') {
        baseStorage._removeFile(req, file, cb);
        return;
      }
      cb(null);
    },
  };
}

/**
 * Count bytes across every file in one request and stop once the total passes
 * the cap. Image uploads keep streaming; this does not buffer them.
 */
function createRequestBudgetStorage(baseStorage, maxRequestBytes) {
  return {
    _handleFile(req, file, cb) {
      const incoming = file.stream;
      let settled = false;
      const finish = (error, info) => {
        if (settled) return;
        settled = true;
        cb(error, info);
      };
      const fail = (error) => {
        incoming.destroy();
        finish(error);
      };

      const limiter = new Transform({
        transform(chunk, encoding, callback) {
          const budgetError = consumeUploadBudget(
            req,
            chunk.length,
            maxRequestBytes
          );
          if (budgetError) {
            callback(budgetError);
            return;
          }
          callback(null, chunk);
        },
      });

      limiter.on('error', fail);
      incoming.on('error', fail);
      incoming.pipe(limiter);

      Object.defineProperty(file, 'stream', {
        configurable: true,
        enumerable: false,
        value: limiter,
      });

      baseStorage._handleFile(req, file, finish);
    },
    _removeFile(req, file, cb) {
      if (typeof baseStorage._removeFile === 'function') {
        baseStorage._removeFile(req, file, cb);
        return;
      }
      cb(null);
    },
  };
}

module.exports = {
  MAX_UPLOAD_FILES,
  UNSUPPORTED_DOCUMENT_TYPE,
  isAllowedDocumentDetection,
  consumeUploadBudget,
  createValidatingDocumentStorage,
  createRequestBudgetStorage,
};
