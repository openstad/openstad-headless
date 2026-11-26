export type ResourceImageFocalPoint = { x: number; y: number };

export type ResourceImage = {
  url: string;
  focalPoint?: ResourceImageFocalPoint | null;
};

type ResourceImageSource = {
  images?: Array<{ url?: string; focalPoint?: ResourceImageFocalPoint | null }>;
  tags?: Array<{ name?: string; defaultResourceImage?: string }>;
};

export function getResourceImage(
  resource?: ResourceImageSource
): ResourceImage {
  const ownImage = Array.isArray(resource?.images)
    ? resource?.images.find((image) => image?.url)
    : undefined;
  if (ownImage?.url) {
    return { url: ownImage.url, focalPoint: ownImage.focalPoint ?? undefined };
  }

  if (!Array.isArray(resource?.tags)) return { url: '' };
  const tagWithImage = [...resource.tags]
    .sort((a, b) => (a.name || '').localeCompare(b.name || ''))
    .find((tag) => tag.defaultResourceImage);
  return { url: tagWithImage?.defaultResourceImage || '' };
}

export function getResourceImageUrl(resource?: ResourceImageSource): string {
  return getResourceImage(resource).url;
}
