type ResourceImageSource = {
  images?: Array<{ url?: string }>;
  tags?: Array<{ name?: string; defaultResourceImage?: string }>;
};

export function getResourceImageUrl(resource?: ResourceImageSource): string {
  const ownImage = Array.isArray(resource?.images)
    ? resource?.images.find((image) => image?.url)
    : undefined;
  if (ownImage?.url) return ownImage.url;

  if (!Array.isArray(resource?.tags)) return '';
  const tagWithImage = [...resource.tags]
    .sort((a, b) => (a.name || '').localeCompare(b.name || ''))
    .find((tag) => tag.defaultResourceImage);
  return tagWithImage?.defaultResourceImage || '';
}
