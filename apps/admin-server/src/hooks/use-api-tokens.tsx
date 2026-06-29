import useSWR from 'swr';

export type ApiTokenStatus = 'active' | 'expired' | 'revoked';

export type ApiToken = {
  id: number;
  userId: number;
  projectId: number;
  name: string | null;
  tokenPrefix: string;
  lastFour: string;
  // null = the token never expires
  expiresAt: string | null;
  lastUsedAt: string | null;
  createdAt: string;
  status: ApiTokenStatus;
  // Only present on the project-level overview endpoint
  owner?: { id: number; name: string | null } | null;
  // True when the token belongs to a superuser on the admin project and is
  // shown in another project's overview (read-only there)
  isSuperUserToken?: boolean;
  // Only present immediately after creation
  token?: string;
};

export default function useApiTokens(projectId?: number, userId?: number) {
  const url =
    projectId && userId
      ? `/api/openstad/api/project/${projectId}/user/${userId}/api-token`
      : null;

  const swr = useSWR<ApiToken[]>(url);

  async function createToken(body: { months?: number; name?: string }) {
    if (!projectId || !userId)
      throw new Error('Project of gebruiker ontbreekt');

    const res = await fetch(
      `/api/openstad/api/project/${projectId}/user/${userId}/api-token`,
      {
        method: 'POST',
        headers: { 'Content-Type': 'application/json' },
        body: JSON.stringify(body),
      }
    );

    if (!res.ok) throw new Error('Aanmaken van token mislukt');
    const created: ApiToken = await res.json();
    swr.mutate();
    return created;
  }

  async function revokeToken(tokenId: number) {
    if (!projectId || !userId)
      throw new Error('Project of gebruiker ontbreekt');

    const res = await fetch(
      `/api/openstad/api/project/${projectId}/user/${userId}/api-token/${tokenId}`,
      { method: 'DELETE' }
    );

    if (!res.ok) throw new Error('Intrekken van token mislukt');
    swr.mutate();
  }

  return { ...swr, createToken, revokeToken };
}

export function useProjectApiTokens(projectId?: string | number) {
  const url = projectId
    ? `/api/openstad/api/project/${projectId}/api-token`
    : null;

  const swr = useSWR<ApiToken[]>(url);

  async function revokeToken(tokenId: number) {
    if (!projectId) throw new Error('Project ontbreekt');

    const res = await fetch(
      `/api/openstad/api/project/${projectId}/api-token/${tokenId}`,
      { method: 'DELETE' }
    );

    if (!res.ok) throw new Error('Intrekken van token mislukt');
    swr.mutate();
  }

  return { ...swr, revokeToken };
}
