import useSWR from 'swr';

export default function useArea(layerId?: string) {
    let url = `/api/openstad/api/datalayer/${layerId}`;

    const datalayerSwr = useSWR( url );

    async function updateDatalayer(data: { name: string; layer?: string; icon?: { url: string }[]; webserviceUrl?: string; useRealtimeWebservice?: boolean }) {
        const res = await fetch(url, {
            method: 'PUT',
            headers: {
                'Content-Type': 'application/json',
            },
            body: JSON.stringify({
                name: data.name,
                layer: data.layer ? JSON.parse(data.layer) : null,
                icon: data.icon || [],
                webserviceUrl: data.webserviceUrl || null,
                useRealtimeWebservice: data.useRealtimeWebservice || false
            }),
        });

        return await res.json();
    }

    return { ...datalayerSwr, updateDatalayer };
}
