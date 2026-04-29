export function getParentDomains(hostname: string): string[] {
  const host = hostname.split(':')[0];
  const parts = host.split('.');
  const parents: string[] = [];
  for (let i = 1; i < parts.length - 1; i++) {
    parents.push(parts.slice(i).join('.'));
  }
  return parents;
}

export function parseHost(value: string): string | null {
  if (!value) return null;
  try {
    if (value.indexOf('http') !== 0) value = 'https://' + value;
    return new URL(value).host;
  } catch {
    return null;
  }
}

export function addWithParents(list: string[], host: string | null): void {
  if (!host) return;
  list.push(host);
  for (const parent of getParentDomains(host)) {
    list.push(parent);
  }
}

export function expandDomains(domains: string[]): string[] {
  const expanded: string[] = [];
  for (const d of domains) {
    const host = parseHost(d) || (d || '').trim();
    if (!host) continue;
    addWithParents(expanded, host);
  }
  return Array.from(new Set(expanded));
}
