export const OPENSTAD_SOURCE = 'openstad';

export type ResourceLink = {
  id: number;
  direction: 'incoming' | 'outgoing';
  source: string;
  targetId: string;
  resource?: {
    id: number;
    title: string;
    summary?: string;
    images?: Array<{ url?: string }>;
    tags?: Array<{ id: number; name?: string; type?: string }>;
  };
};

export type ExternalItem = {
  id: string;
  label: string;
  image?: string;
  url?: string;
};

export type RelatedTag = {
  id: string;
  name: string;
  type?: string;
};

export type RelatedItem = {
  key: string;
  source: string;
  id: string;
  title: string;
  summary?: string;
  image?: string;
  url?: string;
  tags?: RelatedTag[];
};

export function parseTagIds(tagIds?: string): string[] {
  return (tagIds || '')
    .split(',')
    .map((tag) => tag.trim())
    .filter(Boolean);
}

export function isHttpUrl(url?: string): boolean {
  return typeof url === 'string' && /^https?:\/\//i.test(url);
}

const PRIVACY_WORD = 'privacyverklaring';

export type ConsentLabelParts = {
  before: string;
  linkText: string;
  after: string;
};

export function consentLabelPlain(label: string): string {
  return label.split('{link}').join(PRIVACY_WORD);
}

export function consentLabelParts(
  label: string,
  privacyUrl?: string
): ConsentLabelParts | null {
  if (!isHttpUrl(privacyUrl)) return null;
  const placeholder = label.indexOf('{link}');
  if (placeholder >= 0) {
    return {
      before: label.slice(0, placeholder),
      linkText: PRIVACY_WORD,
      after: consentLabelPlain(label.slice(placeholder + '{link}'.length)),
    };
  }
  const word = label.toLowerCase().indexOf(PRIVACY_WORD);
  if (word < 0) return null;
  return {
    before: label.slice(0, word),
    linkText: label.slice(word, word + PRIVACY_WORD.length),
    after: label.slice(word + PRIVACY_WORD.length),
  };
}

export function buildItemLink(
  itemLink: string | undefined,
  id: string
): string | undefined {
  if (!itemLink || !itemLink.includes('[id]')) return undefined;
  return itemLink.replace('[id]', encodeURIComponent(id));
}

export function externalIdsBySource(
  links: ResourceLink[]
): Record<string, string[]> {
  const bySource: Record<string, string[]> = {};
  links
    .filter((link) => link.source !== OPENSTAD_SOURCE)
    .forEach((link) => {
      bySource[link.source] = bySource[link.source] || [];
      if (!bySource[link.source].includes(link.targetId)) {
        bySource[link.source].push(link.targetId);
      }
    });
  return bySource;
}

export function withoutLinked<T extends { id: string }>(
  options: T[],
  links: ResourceLink[]
): T[] {
  const linkedIds = new Set(
    links
      .filter((link) => link.source === OPENSTAD_SOURCE)
      .map((link) => String(link.resource ? link.resource.id : link.targetId))
  );
  return options.filter((option) => !linkedIds.has(String(option.id)));
}

export function toRelatedItems(
  links: ResourceLink[],
  {
    tagIds,
    itemLink,
    externalItems = {},
  }: {
    tagIds?: string;
    itemLink?: string;
    externalItems?: Record<string, ExternalItem>;
  }
): RelatedItem[] {
  const allowedTags = parseTagIds(tagIds);
  const seen = new Set<string>();
  const items: RelatedItem[] = [];

  for (const link of links) {
    if (link.source === OPENSTAD_SOURCE && link.resource) {
      const resourceTags = (link.resource.tags || []).map((tag) =>
        String(tag.id)
      );
      if (
        allowedTags.length &&
        !resourceTags.some((tag) => allowedTags.includes(tag))
      ) {
        continue;
      }
      const id = String(link.resource.id);
      const key = `${OPENSTAD_SOURCE}:${id}`;
      if (seen.has(key)) continue;
      seen.add(key);
      items.push({
        key,
        source: OPENSTAD_SOURCE,
        id,
        title: link.resource.title,
        summary: link.resource.summary,
        image: link.resource.images?.[0]?.url,
        url: buildItemLink(itemLink, id),
        tags: (link.resource.tags || []).map((tag) => ({
          id: String(tag.id),
          name: tag.name || '',
          type: tag.type,
        })),
      });
    } else if (link.source !== OPENSTAD_SOURCE) {
      const key = `${link.source}:${link.targetId}`;
      const item = externalItems[key];
      if (!item || seen.has(key)) continue;
      seen.add(key);
      items.push({
        key,
        source: link.source,
        id: link.targetId,
        title: item.label,
        image: item.image,
        url: isHttpUrl(item.url) ? item.url : undefined,
      });
    }
  }

  return items;
}

export function relatedTagOptions(
  items: RelatedItem[],
  tagTypes?: string
): RelatedTag[] {
  const allowedTypes = parseTagIds(tagTypes);
  const byId = new Map<string, RelatedTag>();
  for (const item of items) {
    for (const tag of item.tags || []) {
      if (!tag.name) continue;
      if (allowedTypes.length && !allowedTypes.includes(tag.type || '')) {
        continue;
      }
      byId.set(tag.id, tag);
    }
  }
  return [...byId.values()].sort((a, b) => a.name.localeCompare(b.name, 'nl'));
}

export function filterByTags(
  items: RelatedItem[],
  selectedTagIds: string[]
): RelatedItem[] {
  if (!selectedTagIds.length) return items;
  return items.filter((item) =>
    (item.tags || []).some((tag) => selectedTagIds.includes(tag.id))
  );
}

export function validateContact({
  isDefaultHandler,
  showMessage,
  showConsent,
  showOwnResource,
  message,
  consent,
  ownResourceId,
  messageRequiredText,
  consentRequiredText,
  ownResourceRequiredText,
}: {
  isDefaultHandler: boolean;
  showMessage: boolean;
  showConsent: boolean;
  showOwnResource: boolean;
  message: string;
  consent: boolean;
  ownResourceId: string;
  messageRequiredText: string;
  consentRequiredText: string;
  ownResourceRequiredText: string;
}): string | null {
  if (showOwnResource && !ownResourceId) return ownResourceRequiredText;
  if (showMessage && isDefaultHandler && !message.trim()) {
    return messageRequiredText;
  }
  if (showConsent && !consent) return consentRequiredText;
  return null;
}

export type ContactTextDefaults = {
  description: string;
  popupDescription: string;
  consentLabel: string;
  loginDescription: string;
};

const EMAIL_CONTACT_DEFAULTS: ContactTextDefaults = {
  description:
    'Via de contactknop stuur je een bericht dat alleen de indiener kan zien. De indiener kan op jouw bericht reageren via e-mail.',
  popupDescription:
    'Via het onderstaande berichtenveld kun je een bericht versturen naar de indiener. Je bericht wordt verstuurd met een vermelding van jouw e-mailadres.',
  consentLabel:
    'Ik ga akkoord met het delen van mijn e-mailadres volgens de privacyverklaring',
  loginDescription:
    'Door in te loggen weten we zeker dat jouw e-mailadres gebruikt kan worden om jou te bereiken.',
};

const HANDLER_CONTACT_DEFAULTS: ContactTextDefaults = {
  description: 'Via deze knop stuur je een verzoek naar de indiener.',
  popupDescription:
    'Je kunt een bericht toevoegen. De indiener ziet dit bij je verzoek.',
  consentLabel: 'Ik ga akkoord met de privacyverklaring',
  loginDescription: 'Log in zodat de indiener weet van wie het verzoek komt.',
};

export function contactTextDefaults(handler?: string): ContactTextDefaults {
  return handler ? HANDLER_CONTACT_DEFAULTS : EMAIL_CONTACT_DEFAULTS;
}
