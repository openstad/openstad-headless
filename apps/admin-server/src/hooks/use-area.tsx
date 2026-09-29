import { validateProjectNumber } from '@/lib/validateProjectNumber';
import type { ApiArea } from '@openstad-headless/types';
import useSWR from 'swr';

export default function useArea(areaId?: string) {
  const areaNumber: number | undefined = validateProjectNumber(areaId);

  let url = `/api/openstad/api/area/${areaNumber}`;

  const areaSwr = useSWR<ApiArea>(areaNumber ? url : null);

  async function updateArea(
    name: string,
    geoJSON: string,
    hidePolygon = false,
    tagIds: number[] = [],
    tagIdsOutside: number[] = []
  ): Promise<ApiArea> {
    const res = await fetch(url, {
      method: 'PUT',
      headers: {
        'Content-Type': 'application/json',
      },
      body: JSON.stringify({
        name: name,
        geoJSON: JSON.parse(geoJSON),
        hidePolygon,
        tagIds,
        tagIdsOutside,
      }),
    });

    return await res.json();
  }

  return { ...areaSwr, updateArea };
}
