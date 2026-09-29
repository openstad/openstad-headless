import type { ApiToken } from '@openstad-headless/types';
import useSWR from 'swr';

export type { ApiToken, ApiTokenStatus } from '@openstad-headless/types';

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
