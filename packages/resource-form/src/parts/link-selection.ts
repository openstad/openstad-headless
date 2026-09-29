export const RESOURCE_LINK_TYPE = 'resourceLink';
export const OPENSTAD_SOURCE = 'openstad';

export type LinkValue = {
  source: string;
  id: string;
  label: string;
  image?: string;
  own?: boolean;
};

export type LinkField = {
  fieldKey: string;
  linkSource: string;
  linkTags?: string;
};

export type LinkItem = {
  id: string;
  label: string;
  image?: string;
  tagIds?: string[];
};

export type LinkSelection = {
  links: Array<{
    source: string;
    targetId: string;
    direction: 'incoming' | 'outgoing';
    resource?: {
      id: number;
      title: string;
      images?: Array<{ url?: string }>;
      tags?: Array<{ id: number }>;
    };
  }>;
  pending: Array<{ source: string; id: string }>;
};

export type LinkPayload = {
  links: Array<{ source: string; id: string; message?: string }>;
  removedLinks: Array<{ source: string; id: string }>;
  added: LinkValue[];
  removed: LinkValue[];
};

export const linkKey = (link: { source: string; id: string }) =>
  `${link.source}:${link.id}`;

export function getLinkFields(
  items: Array<{
    type?: string;
    fieldKey: string;
    linkSource?: string;
    linkTags?: string;
  }> = []
): LinkField[] {
  return items
    .filter((item) => item.type === RESOURCE_LINK_TYPE && item.fieldKey)
    .map((item) => ({
      fieldKey: item.fieldKey,
      linkSource: item.linkSource as string,
      linkTags: item.linkTags,
    }));
}

function parseTagIds(linkTags?: string): string[] {
  return (linkTags || '')
    .split(',')
    .map((tag) => tag.trim())
    .filter(Boolean);
}

function uniqueByKey(values: LinkValue[]): LinkValue[] {
  const seen = new Set<string>();
  return values.filter((value) => {
    const key = linkKey(value);
    if (seen.has(key)) return false;
    seen.add(key);
    return true;
  });
}

export function extractLinkValues(
  formData: Record<string, unknown>,
  linkFields: LinkField[]
): {
  formData: Record<string, unknown>;
  valuesByField: Record<string, LinkValue[]>;
} {
  const rest = { ...formData };
  const valuesByField: Record<string, LinkValue[]> = {};
  for (const field of linkFields) {
    const value = rest[field.fieldKey];
    valuesByField[field.fieldKey] = Array.isArray(value)
      ? (value as LinkValue[])
      : [];
    delete rest[field.fieldKey];
  }
  return { formData: rest, valuesByField };
}

export function buildLinkPayload(
  valuesByField: Record<string, LinkValue[]>,
  prefilledByField: Record<string, LinkValue[]>,
  messages: Record<string, string> = {}
): LinkPayload {
  const current = uniqueByKey(Object.values(valuesByField).flat());
  const prefilled = uniqueByKey(Object.values(prefilledByField).flat());
  const currentKeys = new Set(current.map(linkKey));
  const prefilledKeys = new Set(prefilled.map(linkKey));

  const added = current.filter((value) => !prefilledKeys.has(linkKey(value)));
  const removed = prefilled.filter((value) => !currentKeys.has(linkKey(value)));

  return {
    links: current.map((value) => {
      const message = messages[linkKey(value)]?.trim();
      return {
        source: value.source,
        id: value.id,
        ...(message ? { message } : {}),
      };
    }),
    removedLinks: removed.map((value) => ({
      source: value.source,
      id: value.id,
    })),
    added,
    removed,
  };
}

export function splitAddedLinks(added: LinkValue[]): {
  others: LinkValue[];
  own: LinkValue[];
} {
  return {
    others: added.filter((value) => !value.own),
    own: added.filter((value) => value.own),
  };
}

export function needsLinkConfirmation(
  payload: Pick<LinkPayload, 'added' | 'removed'>
): boolean {
  return (
    payload.removed.length > 0 ||
    splitAddedLinks(payload.added).others.length > 0
  );
}

export function itemsToFetch(
  selection: LinkSelection
): Record<string, string[]> {
  const bySource: Record<string, Set<string>> = {};
  const add = (source: string, id: string) => {
    bySource[source] = bySource[source] || new Set();
    bySource[source].add(id);
  };
  selection.links
    .filter((link) => link.source !== OPENSTAD_SOURCE)
    .forEach((link) => add(link.source, link.targetId));
  selection.pending.forEach((item) => add(item.source, String(item.id)));
  return Object.fromEntries(
    Object.entries(bySource).map(([source, ids]) => [source, [...ids]])
  );
}

export function buildPrefill(
  selection: LinkSelection,
  linkFields: LinkField[],
  itemsByKey: Record<string, LinkItem>
): Record<string, LinkValue[]> {
  const candidates: Array<LinkValue & { tagIds?: string[] }> = [];

  for (const link of selection.links) {
    if (link.source === OPENSTAD_SOURCE && link.resource) {
      candidates.push({
        source: OPENSTAD_SOURCE,
        id: String(link.resource.id),
        label: link.resource.title,
        ...(link.resource.images?.[0]?.url
          ? { image: link.resource.images[0].url }
          : {}),
        tagIds: (link.resource.tags || []).map((tag) => String(tag.id)),
      });
    } else if (link.source !== OPENSTAD_SOURCE) {
      const item =
        itemsByKey[linkKey({ source: link.source, id: link.targetId })];
      candidates.push({
        source: link.source,
        id: link.targetId,
        label: item ? item.label : link.targetId,
        ...(item?.image ? { image: item.image } : {}),
      });
    }
  }

  for (const pending of selection.pending) {
    const key = linkKey({ source: pending.source, id: String(pending.id) });
    const item = itemsByKey[key];
    if (!item) continue;
    candidates.push({
      source: pending.source,
      id: String(pending.id),
      label: item.label,
      ...(item.image ? { image: item.image } : {}),
      tagIds: item.tagIds,
    });
  }

  const prefill: Record<string, LinkValue[]> = {};
  for (const field of linkFields) {
    const tagIds = parseTagIds(field.linkTags);
    prefill[field.fieldKey] = uniqueByKey(
      candidates
        .filter((candidate) => candidate.source === field.linkSource)
        .filter(
          (candidate) =>
            field.linkSource !== OPENSTAD_SOURCE ||
            !tagIds.length ||
            (candidate.tagIds || []).some((tagId) => tagIds.includes(tagId))
        )
        .map(({ tagIds: _tagIds, ...value }) => value)
    );
  }
  return prefill;
}
