import useSWR from 'swr';

export type Idea = {
    title: string,
    summary?: string | null
    description?: string,
    
};

export function useIdeasHook(projectId?: string) {
  let url = `/api/openstad/api/project/${projectId}/idea`;

  const swr = useSWR(projectId ? url : null);

  async function createIdea(idea: Idea) {
    const res = await fetch(url, {
      method: 'POST',
      headers: {
        'Content-Type': 'application/json',
      },
      body: JSON.stringify(idea),
    });
    const data = await res.json();
    swr.mutate([...swr.data, data]);
    return data;
  }

  return { ...swr, createIdea };
}
