let spamFilterEnabledCache: boolean | null = null;

export async function getRuntimeSpamFilterEnabled() {
  if (spamFilterEnabledCache !== null) return spamFilterEnabledCache;

  try {
    const response = await fetch('/api/spam-filter-enabled');
    if (!response.ok) {
      spamFilterEnabledCache = false;
      return spamFilterEnabledCache;
    }

    const body = await response.json();
    spamFilterEnabledCache = body?.spamFilterEnabled === 'true';
    return spamFilterEnabledCache;
  } catch (error) {
    spamFilterEnabledCache = false;
    return spamFilterEnabledCache;
  }
}
