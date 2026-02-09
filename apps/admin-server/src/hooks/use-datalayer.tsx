import useSWR from 'swr';
import {validateProjectNumber} from "../lib/validateProjectNumber";

export default function useArea(layerId?: string) {
    const layerNumber: number | undefined = validateProjectNumber(layerId);

    let url = `/api/openstad/api/datalayer/${layerNumber}`;

    const datalayerSwr = useSWR(layerNumber ? url : null);

    async function updateDatalayer(name: string, layer: string, icon: any) {
        const res = await fetch(url, {
            method: 'PUT',
            headers: {
                'Content-Type': 'application/json',
            },
            body: JSON.stringify({ name: name, layer: JSON.parse(layer), icon: icon}),
        });

        return await res.json();
    }

    return { ...datalayerSwr, updateDatalayer };
}
