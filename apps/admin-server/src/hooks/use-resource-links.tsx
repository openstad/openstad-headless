import { validateProjectNumber } from '@/lib/validateProjectNumber';
import useSWR from 'swr';

export type AdminResourceLink = {
  id: number;
  direction: 'incoming' | 'outgoing';
  source: string;
  targetId: string;
  resource?: { id: number; title: string };
};

const STATUS_MESSAGES: Record<number, string> = {
  403: 'Je hebt geen rechten om koppelingen te beheren',
  409: 'Deze koppeling bestaat al',
};

async function readError(res: Response) {
  const body = await res.json().catch(() => null);
  return new Error(
    STATUS_MESSAGES[res.status] ||
      body?.message ||
      body?.error ||
      `Verzoek mislukt (${res.status})`
  );
}

export default function useResourceLinks(projectId?: string, id?: string) {
  const projectNumber = validateProjectNumber(projectId);
  const resourceId = validateProjectNumber(id);
  const url = `/api/openstad/api/project/${projectNumber}/resource/${resourceId}/links`;

  const linksSwr = useSWR<AdminResourceLink[]>(
    projectNumber && resourceId ? url : null
  );

  async function createLink(targetSource: string, targetId: string) {
    const res = await fetch(url, {
      method: 'POST',
      headers: { 'Content-Type': 'application/json' },
      body: JSON.stringify({ targetSource, targetId }),
    });
    if (!res.ok) throw await readError(res);
    await linksSwr.mutate();
  }

  async function removeLink(linkId: number) {
    const res = await fetch(`${url}/${linkId}`, { method: 'DELETE' });
    if (!res.ok) throw await readError(res);
    await linksSwr.mutate();
  }

  async function searchResources(search: string) {
    const params = new URLSearchParams({ search, limit: '20' });
    const res = await fetch(
      `/api/openstad/api/project/${projectNumber}/link-options/openstad?${params}`
    );
    if (!res.ok) throw await readError(res);
    return (await res.json()) as Array<{ id: string; label: string }>;
  }

  return { ...linksSwr, createLink, removeLink, searchResources };
}
