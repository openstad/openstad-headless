import useSWR from 'swr';

export default function useArea(layerId?: string) {
    let url = `/api/openstad/api/datalayer/${layerId}`;

    const datalayerSwr = useSWR( url );

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
