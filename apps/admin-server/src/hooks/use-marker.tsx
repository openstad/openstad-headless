import { validateProjectNumber } from '@/lib/validateProjectNumber';
import useSWR from 'swr';

export default function useMarker(projectId?: string, markersId?: string) {
  const projectNumber: number | undefined = validateProjectNumber(projectId);
  const markersNumber: number | undefined = validateProjectNumber(markersId);

  let url = `/api/openstad/api/project/${projectNumber}/markers/${markersNumber}`;

  const markerSwr = useSWR(projectNumber && markersNumber ? url : null);

  async function updateMarkers(body: { name?: string; markers?: any[] }) {
    const res = await fetch(url, {
      method: 'PUT',
      headers: {
        'Content-Type': 'application/json',
      },
      body: JSON.stringify(body),
    });

    if (!res.ok) {
      throw new Error('Could not update markers');
    }

    const data = await res.json();
    markerSwr.mutate(data);
    return data;
  }

  return { ...markerSwr, updateMarkers };
}
