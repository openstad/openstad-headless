import { sanitizeUrl } from './sanitize-url';

// Query parameter that tells the begroot widget which resource to put in the
// voter's selection. The resource detail widget and the admin "Stemlinks"
// overview build their links with it, the begroot widget reads it.
export const RESOURCE_VOTE_LINK_PARAM = 'openstadResourceId';

const RELATIVE_BASE = 'http://relative.invalid';

function normaliseResourceId(resourceId: unknown): number | null {
  const id = Number(resourceId);
  return Number.isInteger(id) && id > 0 ? id : null;
}

// Builds the vote page URL with ?openstadResourceId=<id>, keeping any query
// string and hash the page already has. A pasted URL without protocol
// ("www.gemeente.nl/stemmen") is treated as https. Returns '' for an empty or
// unsafe URL, or an invalid resource id.
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

// Reads the resource id from a query string such as window.location.search.
export function getResourceIdFromVoteLink(
  search: string | undefined | null
): number | null {
  if (!search) return null;
  const value = new URLSearchParams(search).get(RESOURCE_VOTE_LINK_PARAM);
  if (!value || !/^\d+$/.test(value.trim())) return null;
  return normaliseResourceId(value.trim());
}
