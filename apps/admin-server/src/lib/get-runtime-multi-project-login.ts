let multiProjectLoginCache: boolean | null = null;

export async function getRuntimeMultiProjectLogin() {
  if (multiProjectLoginCache !== null) return multiProjectLoginCache;

  try {
    const response = await fetch('/api/multi-project-login-enabled');
    if (!response.ok) return false;

    const body = await response.json();
    multiProjectLoginCache = body?.multiProjectLogin === true;
    return multiProjectLoginCache;
  } catch (error) {
    return false;
  }
}
