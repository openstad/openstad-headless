import { throwApiError } from '@/lib/api-error';
import { validateProjectNumber } from '@/lib/validateProjectNumber';
import useSWR from 'swr';

export default function useArea(layerId?: string) {
  const layerNumber: number | undefined = validateProjectNumber(layerId);

  let url = `/api/openstad/api/datalayer/${layerNumber}`;

  const datalayerSwr = useSWR(layerNumber ? url : null);

  async function updateDatalayer(
    name: string,
    layer: string,
    icon: any
  ): Promise<any | null> {
    const res = await fetch(url, {
      method: 'PUT',
      headers: {
        'Content-Type': 'application/json',
      },
      body: JSON.stringify({
        name: name,
        layer: JSON.parse(layer),
        icon: icon,
      }),
    });

    if (!res.ok) {
      await throwApiError(res, 'De kaartlaag kon niet worden opgeslagen.');
    }

    return await res.json();
  }

  return { ...datalayerSwr, updateDatalayer };
}
