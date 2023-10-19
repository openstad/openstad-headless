import useSWR from 'swr';

export default function useCodes(projectId?: string) {
  const url = `/api/openstad/api/project/${projectId}/code`;
  const codesSwr = useSWR(projectId ? url : null);

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
      codesSwr.mutate([...codesSwr.data, data]);
      return data;
    } else {
      throw new Error('Could not the codes');
    }
  }

  async function remove(id: number) {
    const deleteUrl = `/api/openstad/api/project/${projectId}/code/${id}?includeUserVote=1`;

    const res = await fetch(deleteUrl, {
      method: 'DELETE',
      headers: {
        'Content-Type': 'application/json',
      },
    });

    if (res.ok) {
      const existingData = [...codesSwr.data];
      const updatedList = existingData.filter((ed) => ed.id !== id);
      codesSwr.mutate(updatedList);
      return updatedList;
    } else {
      throw new Error('Could not remove the plan');
    }
  }
  return { ...codesSwr, create, remove };
}
