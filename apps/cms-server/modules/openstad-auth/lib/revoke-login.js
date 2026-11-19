const REVOKE_LOGIN_TIMEOUT_MS = 3000;

const revokeLogin = async ({
  apiUrl,
  projectId,
  jwt,
  env = process.env,
  fetchImpl = fetch,
  timeoutMs = REVOKE_LOGIN_TIMEOUT_MS,
}) => {
  if (env.MULTI_PROJECT_LOGIN !== 'true') return;
  if (!jwt || !projectId) return;

  const controller = new AbortController();
  const timer = setTimeout(() => controller.abort(), timeoutMs);
  try {
    await fetchImpl(`${apiUrl}/auth/project/${projectId}/logout`, {
      method: 'POST',
      headers: { Authorization: `Bearer ${jwt}` },
      signal: controller.signal,
    });
  } catch (err) {
    console.log(
      `[${new Date().toISOString()}][cms-auth] revoking login failed: projectId=${projectId} error=${err?.message}`
    );
  } finally {
    clearTimeout(timer);
  }
};

module.exports = { revokeLogin };
