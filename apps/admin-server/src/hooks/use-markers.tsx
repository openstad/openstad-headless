import { validateProjectNumber } from '@/lib/validateProjectNumber';
import useSWR from 'swr';

export default function useMarkers(projectId?: string) {
  const projectNumber: number | undefined = validateProjectNumber(projectId);

  let url = `/api/openstad/api/project/${projectNumber}/markers`;

  const markersSwr = useSWR(projectNumber ? url : null);

  async function createMarkers(name: string, markers: any[] = []) {
    const res = await fetch(url, {
      method: 'POST',
      headers: {
        'Content-Type': 'application/json',
      },
      body: JSON.stringify({ name, markers }),
    });
    if (!res.ok) {
      throw new Error('Could not create markers');
    }
    const data = await res.json();
    markersSwr.mutate();
    return data;
  }

  async function removeMarkers(id: number) {
    const deleteUrl = `${url}/${id}`;

    const res = await fetch(deleteUrl, {
      method: 'DELETE',
      headers: {
        'Content-Type': 'application/json',
      },
    });

    if (res.ok) {
      const existingData = [...(markersSwr.data || [])];
      const updatedList = existingData.filter((ed: any) => ed.id !== id);
      markersSwr.mutate(updatedList);
      return updatedList;
    } else {
      throw new Error('Could not remove markers');
    }
  }

  async function duplicateMarkers(id: number) {
    const duplicateUrl = `${url}/${id}/duplicate`;

    const res = await fetch(duplicateUrl, {
      method: 'POST',
      headers: {
        'Content-Type': 'application/json',
      },
    });

    if (res.ok) {
      const data = await res.json();
      markersSwr.mutate();
      return data;
    } else {
      throw new Error('Could not duplicate markers');
    }
  }

  return { ...markersSwr, createMarkers, removeMarkers, duplicateMarkers };
}
