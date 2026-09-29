export type CropRect = { x: number; y: number; width: number; height: number };

const CROP_STEP_PATTERN = /\/:\/cr=l:(\d+),t:(\d+),w:(\d+),h:(\d+)$/;

export function parseImageCropUrl(url: string): {
  baseUrl: string;
  crop: CropRect | null;
} {
  const match = url.match(CROP_STEP_PATTERN);
  if (!match) return { baseUrl: url, crop: null };
  return {
    baseUrl: url.slice(0, match.index),
    crop: { x: +match[1], y: +match[2], width: +match[3], height: +match[4] },
  };
}

export function buildImageCropUrl(url: string, crop: CropRect): string {
  const { baseUrl } = parseImageCropUrl(url);
  return `${baseUrl}/:/cr=l:${Math.max(0, Math.round(crop.x))},t:${Math.max(0, Math.round(crop.y))},w:${Math.max(1, Math.round(crop.width))},h:${Math.max(1, Math.round(crop.height))}`;
}
