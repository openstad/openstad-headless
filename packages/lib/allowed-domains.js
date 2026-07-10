function getParentDomains(hostname) {
  const host = hostname.split(':')[0];
  const parts = host.split('.');
  const parents = [];
  for (let i = 1; i < parts.length - 1; i++) {
    parents.push(parts.slice(i).join('.'));
  }
  return parents;
}

function parseHost(value) {
  if (!value) return null;
  try {
    if (value.indexOf('http') !== 0) value = 'https://' + value;
    return new URL(value).host;
  } catch {
    return null;
  }
}

function toggleWww(host) {
  return host.startsWith('www.') ? host.slice(4) : 'www.' + host;
}

function addWithParents(list, host) {
  if (!host) return;
  for (const domain of [host, ...getParentDomains(host)]) {
    list.push(domain);
    list.push(toggleWww(domain));
  }
}

function expandDomains(domains) {
  const expanded = [];
  for (const d of domains) {
    const host = parseHost(d) || (d || '').trim();
    if (!host) continue;
    addWithParents(expanded, host);
  }
  return [...new Set(expanded)];
}

module.exports = {
  getParentDomains,
  parseHost,
  toggleWww,
  addWithParents,
  expandDomains,
};
