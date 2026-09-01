export function buildPageTitle(
  resourceTitle: string,
  originalDocumentTitle: string
): string {
  const parts = originalDocumentTitle.split(' - ');
  const siteName = parts.length > 1 ? parts[parts.length - 1].trim() : '';

  return siteName ? `${resourceTitle} - ${siteName}` : resourceTitle;
}
