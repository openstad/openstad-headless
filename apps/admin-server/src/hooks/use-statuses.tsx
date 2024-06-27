import useSWR from 'swr';

export default function useStatus(projectId?: string) {
  const url = `/api/openstad/api/project/${projectId}/status`;

  const statusListSwr = useSWR(projectId ? url : null);

  async function createStatus(name: string, seqnr: number, addToNewResources: boolean) {
    const res = await fetch(url, {
      method: 'POST',
      headers: {
        'Content-Type': 'application/json',
      },
      body: JSON.stringify({ projectId, name, seqnr, addToNewResources }),
    });

    return await res.json();
  }

  async function removeStatus(id: number) {
    const deleteUrl = `/api/openstad/api/project/${projectId}/status/${id}`;

    const res = await fetch(deleteUrl, {
      method: 'DELETE',
      headers: {
        'Content-Type': 'application/json',
      },
    });

    if (res.ok) {
      const existingData = [...statusListSwr.data];
      const updatedList = existingData.filter((ed) => ed.id !== id);
      statusListSwr.mutate(updatedList);
      return updatedList;
    } else {
      throw new Error('Could not remove this status');
    }
  }

  return {...statusListSwr, createStatus, removeStatus}
}
