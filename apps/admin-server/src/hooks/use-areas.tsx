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

  return { ...areasSwr, createArea };
}
