import useSWR from 'swr';

export default function useArea(projectId?: string) {
  let url = `/api/openstad/api/area`;

  const areasSwr = useSWR(projectId ? url : null);

  async function createArea(name: string, polygon: string) {
    const res = await fetch(url, {
      method: 'POST',
      headers: {
        'Content-Type': 'application/json',
      },
      body: JSON.stringify({ name: name, polygon: JSON.parse(polygon) }),
    });
    const data = await res.json();
    return data;
  }

  return { ...areasSwr, createArea };
}
