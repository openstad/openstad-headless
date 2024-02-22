import useSWR from 'swr';

export default function useAreas(projectId?: string) {
  let url = `/api/openstad/api/area`;

  const areasSwr = useSWR(projectId ? url : null);

  async function createArea(name: string, geoJSON: string) {
    const res = await fetch(url, {
      method: 'POST',
      headers: {
        'Content-Type': 'application/json',
      },
      body: JSON.stringify({ name: name, geoJSON: JSON.parse(geoJSON) }),
    });
    return await res.json();
  }

  async function removeArea(id: number) {
    const deleteUrl = `/api/openstad/api/project/${projectId}/area/${id}`;

    const res = await fetch(deleteUrl, {
      method: 'DELETE',
      headers: {
        'Content-Type': 'application/json',
      },
    });

    if (res.ok) {
      const existingData = [...areasSwr.data];
      const updatedList = existingData.filter((ed) => ed.id !== id);
      areasSwr.mutate(updatedList);
      return updatedList;
    } else {
      throw new Error('Could not remove this area');
    }
  }

  return { ...areasSwr, createArea, removeArea };
}
