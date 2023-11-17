import useSWR from 'swr';

export default function useTags(projectId?: string) {
  const url = `/api/openstad/api/project/${projectId}/tag`;

  const tagListSwr = useSWR(projectId ? url : null);

  async function createTag(projectId: string, name: string, type: string) {
    const res = await fetch(url, {
      method: 'POST',
      headers: {
        'Content-Type': 'application/json',
      },
      body: JSON.stringify({ projectId, name, type }),
    });
  }

  return {...tagListSwr, createTag}
}