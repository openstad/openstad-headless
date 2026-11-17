/**
 * Crop rectangle expressed as percentages (0 - 100) of the source image.
 *
 * Percentages are used instead of pixels because image-steam applies steps to
 * the optimized original, which its default `originalSteps` cap at 2560px.
 * Pixel coordinates measured in the browser against the untouched original are
 * therefore in a different coordinate space and get silently clamped, which
 * makes the crop wrong or a no-op for anything larger than that cap.
 */
export type CropRect = { x: number; y: number; width: number; height: number };

export type ParsedImageCropUrl = {
  baseUrl: string;
  /** Percentage crop, or null for a plain url or a legacy pixel crop. */
  crop: CropRect | null;
  /** True when the url carries a crop step in either format. */
  hasCrop: boolean;
};

const STEP_DELIMITER = '/:/';
const NUMBER = '(\\d+(?:\\.\\d+)?)';
const UNIT = '(%25|%)?';

const CROP_STEP_PATTERN = new RegExp(
  `\\/(?::\\/)?cr=l:${NUMBER}${UNIT},t:${NUMBER}${UNIT},w:${NUMBER}${UNIT},h:${NUMBER}${UNIT}$`
);

const MIN_CROP_PERCENTAGE = 0.01;
const MAX_CROP_PERCENTAGE = 100;
const DECIMALS = 4;

const roundPercentage = (value: number) =>
  Number.isFinite(value) ? Number(value.toFixed(DECIMALS)) : 0;

const clampSize = (value: number) =>
  Math.min(
    MAX_CROP_PERCENTAGE,
    Math.max(MIN_CROP_PERCENTAGE, roundPercentage(value))
  );

const clampOffset = (value: number, size: number) =>
  Math.min(MAX_CROP_PERCENTAGE - size, Math.max(0, roundPercentage(value)));

/**
 * Add an image-steam step to a url. image-steam only parses the first `/:/`
 * segment, so a second delimiter would make every step behind it disappear.
 */
export function withImageStep(url: string, step: string): string {
  return url.includes(STEP_DELIMITER)
    ? `${url}/${step}`
    : `${url}${STEP_DELIMITER}${step}`;
}

export function parseImageCropUrl(url: string): ParsedImageCropUrl {
  const match = url.match(CROP_STEP_PATTERN);
  if (!match) return { baseUrl: url, crop: null, hasCrop: false };

  const baseUrl = url.slice(0, match.index);
  const isPercentage = Boolean(match[2] && match[4] && match[6] && match[8]);

  if (!isPercentage) return { baseUrl, crop: null, hasCrop: true };

  return {
    baseUrl,
    crop: {
      x: parseFloat(match[1]),
      y: parseFloat(match[3]),
      width: parseFloat(match[5]),
      height: parseFloat(match[7]),
    },
    hasCrop: true,
  };
}

export function buildImageCropUrl(url: string, crop: CropRect): string {
  const { baseUrl } = parseImageCropUrl(url);
  const width = clampSize(crop.width);
  const height = clampSize(crop.height);
  const left = clampOffset(crop.x, width);
  const top = clampOffset(crop.y, height);

  return withImageStep(
    baseUrl,
    `cr=l:${left}%25,t:${top}%25,w:${width}%25,h:${height}%25`
  );
}

/**
 * Url for displaying an image bounded to `maxSize` in both directions. Routes
 * through image-steam so the response is resized, format optimized and long
 * lived cacheable, instead of the untouched original that the plain
 * `/image/<file>` passthrough returns.
 */
export function buildImagePreviewUrl(url: string, maxSize: number): string {
  const { baseUrl, crop } = parseImageCropUrl(url);
  const source = crop ? buildImageCropUrl(baseUrl, crop) : baseUrl;

  return withImageStep(source, `rs=w:${maxSize},h:${maxSize}`);
}
