import useSWR from 'swr';

export default function useIdeas(projectId?: string) {
  const url = `/api/openstad/api/project/${projectId}/idea?includeUserVote=1`;

  const ideasListSwr = useSWR(
    `/api/openstad/api/project/${projectId}/idea?includeUserVote=1`
  );

  async function create(body: any) {
    const res = await fetch(url, {
      method: 'POST',
      headers: {
        'Content-Type': 'application/json',
      },
      body: JSON.stringify({ ...body }),
    });

    if (res.ok) {
      const data = await res.json();
      ideasListSwr.mutate([...ideasListSwr.data, data]);
      return data;
    } else {
      throw new Error('Could not create the plan');
    }
  }

  return { ...ideasListSwr, create };
}
