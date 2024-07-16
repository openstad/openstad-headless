import useSWR from 'swr';

export default function useArea(areaId?: string) {
  let url = `/api/openstad/api/area/${areaId}`;

  const areaSwr = useSWR( url );

  async function updateArea(name: string, geoJSON: string) {
    const res = await fetch(url, {
      method: 'PUT',
      headers: {
        'Content-Type': 'application/json',
      },
      body: JSON.stringify({ name: name, geoJSON: JSON.parse(geoJSON)}),
    });

    return await res.json();
  }

  return { ...areaSwr, updateArea };
}
