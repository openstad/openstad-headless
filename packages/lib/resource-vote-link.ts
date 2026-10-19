import { sanitizeUrl } from './sanitize-url';

export const RESOURCE_VOTE_LINK_PARAM = 'openstadResourceId';

const RELATIVE_BASE = 'http://relative.invalid';

function normaliseResourceId(resourceId: unknown): number | null {
  const id = Number(resourceId);
  return Number.isInteger(id) && id > 0 ? id : null;
}

export function buildResourceVoteLink(
  votePageUrl: string | undefined | null,
  resourceId: unknown
): string {
  const id = normaliseResourceId(resourceId);
  let url = sanitizeUrl(votePageUrl);
  if (!id || !url || /^(mailto|tel):/i.test(url)) return '';

  if (!/^https?:\/\//i.test(url) && /^[^/?#.]+\.[^/?#]+/.test(url)) {
    url = `https://${url}`;
  }

  const isAbsolute = /^https?:\/\//i.test(url);

  let parsed: URL;
  try {
    parsed = new URL(url, RELATIVE_BASE);
  } catch {
    return '';
  }

  parsed.searchParams.set(RESOURCE_VOTE_LINK_PARAM, String(id));

  return isAbsolute
    ? parsed.toString()
    : `${parsed.pathname}${parsed.search}${parsed.hash}`;
}

export function getResourceIdFromVoteLink(
  search: string | undefined | null
): number | null {
  if (!search) return null;
  const value = new URLSearchParams(search).get(RESOURCE_VOTE_LINK_PARAM);
  if (!value || !/^\d+$/.test(value.trim())) return null;
  return normaliseResourceId(value.trim());
}
