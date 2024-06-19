import useSWR from 'swr';

export default function useTag(projectId?: string) {
  const url = `/api/openstad/api/project/${projectId}/tag`;

  const tagListSwr = useSWR(projectId ? url : null);

  async function createTag(name: string, type: string, seqnr: number, addToNewResources: boolean) {
    const res = await fetch(url, {
      method: 'POST',
      headers: {
        'Content-Type': 'application/json',
      },
      body: JSON.stringify({ projectId, name, type, seqnr, addToNewResources }),
    });

    return await res.json();
  }

  async function removeTag(id: number) {
    const deleteUrl = `/api/openstad/api/project/${projectId}/tag/${id}`;

    const res = await fetch(deleteUrl, {
      method: 'DELETE',
      headers: {
        'Content-Type': 'application/json',
      },
    });

    if (res.ok) {
      const existingData = [...tagListSwr.data];
      const updatedList = existingData.filter((ed) => ed.id !== id);
      tagListSwr.mutate(updatedList);
      return updatedList;
    } else {
      throw new Error('Could not remove this tag');
    }
  }

  return {...tagListSwr, createTag, removeTag}
}
