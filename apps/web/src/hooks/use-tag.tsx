import useSWR from 'swr';

export default function useTags(projectId?: string, id?: string) {
  const url = `/api/openstad/api/project/${projectId}/tag/${id}`;

  const tagSwr = useSWR(projectId && id ? url : null);

  async function updateTag(name: string, type: string, seqnr: number) {
    const res = await fetch(url, {
      method: 'PUT',
      headers: {
        'Content-Type': 'application/json',
      },
      body: JSON.stringify({ projectId, id, name, type, seqnr }),
    });
  }

  return { ...tagSwr, updateTag }
}