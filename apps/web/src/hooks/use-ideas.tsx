import useSWR from 'swr';

export default function useIdeas(projectId?: string) {
  const url = `/api/openstad/api/project/${projectId}/idea?includeUserVote=1`;

  const ideasListSwr = useSWR(projectId ? url : null);

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

  async function update(id: number, body: any) {
    const updateUrl = `/api/openstad/api/project/${projectId}/idea/${id}?includeUserVote=1`;

    const res = await fetch(updateUrl, {
      method: 'PUT',
      headers: {
        'Content-Type': 'application/json',
      },
      body: JSON.stringify({ ...body }),
    });

    if (res.ok) {
      const data = await res.json();
      const existingData = [...ideasListSwr.data];
      const updatedList = existingData.filter((ed) => ed.id !== data.id);
      updatedList.push(data);
      ideasListSwr.mutate(updatedList);
      return data;
    } else {
      throw new Error('Could not update the plan');
    }
  }
  return { ...ideasListSwr, create, update };
}
