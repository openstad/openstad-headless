import useSWR from 'swr';

export default function useCodes(projectId?: string) {
  const url = `localhost:31430/auth/code/login?&clientId=uniquecode&clientSecret=uniquecode123`;
  const codesSwr = useSWR(projectId ? url : null);

  async function create(body: any) {
    const res = await fetch(url, {
      method: 'POST',
      headers: {
        'Content-Type': 'application/json',
      },
      body: JSON.stringify({ code: 'a1a1a1a1', clientId: 1 }),
    });

    // if (res.ok) {
    //   const data = await res.json();
    //   codesSwr.mutate([...codesSwr.data, data]);
    //   return data;
    // } else {
    //   throw new Error('Could not create the codes');
    // }
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
      throw new Error('Could not remove the codes');
    }
  }
  return { ...codesSwr, create, remove };
}
