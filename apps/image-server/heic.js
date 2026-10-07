const sharp = require('sharp');

/**
 * HEIC is the default photo format on iPhone, but neither libvips build in this
 * repo can decode it: the prebuilt sharp binaries ship libheif without the HEVC
 * codec, so reading metadata succeeds while decoding pixels fails with
 * "source: bad seek". Browsers other than Safari cannot render it either.
 *
 * Uploads are therefore decoded here with the WebAssembly build of libheif,
 * which does include libde265, and stored as JPEG. Everything downstream then
 * sees an ordinary image.
 */
const HEIC_EXTENSIONS = ['heic', 'heif'];

const HEIC_MIME_TYPES = [
  'image/heic',
  'image/heic-sequence',
  'image/heif',
  'image/heif-sequence',
];

const HEIC_JPEG_QUALITY = 90;

const HEIC_UNREADABLE = 'HEIC_UNREADABLE';
const HEIC_TOO_MANY_PIXELS = 'HEIC_TOO_MANY_PIXELS';

/**
 * HEIC compresses so well that the upload size limit says nothing about the
 * decoded size: a 2.4 MB file holding 200 megapixels needs an 800 MB raw
 * buffer. The cap is on pixels, not bytes. The default leaves room for the
 * largest phone photos, which currently top out at 48 megapixels.
 */
const HEIC_MAX_MEGAPIXELS = Number(process.env.HEIC_MAX_MEGAPIXELS) || 50;

/**
 * A single 48 megapixel conversion peaks around 800 MB of resident memory, so
 * conversions run one at a time unless configured otherwise.
 */
const maxConcurrentConversions =
  Number(process.env.HEIC_MAX_CONCURRENT_CONVERSIONS) || 1;

const ISPE_BOX_SIZE = 20;
const ISPE_MARKER = Buffer.from('ispe');

/**
 * Largest pixel count declared by any image spatial extents box in the file.
 * Reading this costs nothing compared to decoding, so it is what the pixel cap
 * is checked against. The box size is verified to avoid matching the four
 * marker bytes inside compressed image data.
 */
const maxPixelsFromIspeBoxes = (buffer) => {
  let max = 0;
  let offset = 0;

  while (offset < buffer.length) {
    const at = buffer.indexOf(ISPE_MARKER, offset);
    if (at === -1) break;
    offset = at + ISPE_MARKER.length;

    if (at < 4 || at + 16 > buffer.length) continue;
    if (buffer.readUInt32BE(at - 4) !== ISPE_BOX_SIZE) continue;

    const width = buffer.readUInt32BE(at + 8);
    const height = buffer.readUInt32BE(at + 12);
    if (width < 1 || height < 1) continue;

    max = Math.max(max, width * height);
  }

  return max;
};

const heicError = (code, message) =>
  Object.assign(new Error(message), { code });

const getFileExtension = (fileName) => {
  if (typeof fileName !== 'string' || !fileName.includes('.')) {
    return null;
  }
  const extension = fileName.split('.').pop().toLowerCase();
  return extension.length > 0 ? extension : null;
};

/**
 * Whether an upload claims to be HEIC based on the only two things available at
 * filter time. Browsers report the mime type inconsistently, so the extension
 * counts as well. The buffer itself is the real check and happens in
 * convertHeicToJpeg.
 */
const looksLikeHeicUpload = (fileName, mimeType) => {
  const extension = getFileExtension(fileName);
  if (extension !== null && HEIC_EXTENSIONS.includes(extension)) {
    return true;
  }
  return (
    typeof mimeType === 'string' &&
    HEIC_MIME_TYPES.includes(mimeType.toLowerCase())
  );
};

const replaceExtension = (fileName, extension) => {
  if (typeof fileName !== 'string' || fileName.length === 0) {
    return `image.${extension}`;
  }
  const lastDot = fileName.lastIndexOf('.');
  const base = lastDot > 0 ? fileName.slice(0, lastDot) : fileName;
  return `${base}.${extension}`;
};

let decodeHeic = null;

/**
 * Loading the WebAssembly module costs about 30 ms and 27 MB of resident
 * memory, so instances that never receive a HEIC should not pay for it.
 */
const getDecoder = () => {
  if (!decodeHeic) {
    decodeHeic = require('heic-decode');
  }
  return decodeHeic;
};

let activeConversions = 0;
const waiting = [];

const acquireSlot = () => {
  if (activeConversions < maxConcurrentConversions) {
    activeConversions++;
    return Promise.resolve();
  }
  return new Promise((resolve) => waiting.push(resolve));
};

const releaseSlot = () => {
  const next = waiting.shift();
  if (next) {
    next();
    return;
  }
  activeConversions--;
};

/**
 * Decode a HEIC buffer and re-encode it as JPEG. Throws when the buffer is not
 * HEIC, which is what makes this the authoritative check rather than the
 * extension. Conversions are capped because a 12 megapixel photo needs a 46 MB
 * raw buffer and the WebAssembly heap does not shrink again.
 */
const convertHeicToJpeg = async (buffer) => {
  const pixels = maxPixelsFromIspeBoxes(buffer);
  if (pixels === 0) {
    throw heicError(HEIC_UNREADABLE, 'No HEIC image dimensions found.');
  }
  if (pixels > HEIC_MAX_MEGAPIXELS * 1e6) {
    throw heicError(
      HEIC_TOO_MANY_PIXELS,
      `Image is ${Math.round(pixels / 1e6)} megapixels, the maximum is ${HEIC_MAX_MEGAPIXELS}.`
    );
  }

  await acquireSlot();
  try {
    const { width, height, data } = await getDecoder()({ buffer });

    return await sharp(Buffer.from(data.buffer, data.byteOffset, data.length), {
      raw: { width, height, channels: 4 },
    })
      .jpeg({ quality: HEIC_JPEG_QUALITY })
      .toBuffer();
  } finally {
    releaseSlot();
  }
};

module.exports = {
  HEIC_EXTENSIONS,
  HEIC_MIME_TYPES,
  HEIC_JPEG_QUALITY,
  HEIC_MAX_MEGAPIXELS,
  HEIC_TOO_MANY_PIXELS,
  HEIC_UNREADABLE,
  looksLikeHeicUpload,
  maxPixelsFromIspeBoxes,
  replaceExtension,
  convertHeicToJpeg,
};
