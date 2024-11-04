import useSWR from 'swr';

export default function useDatalayers(projectId?: string) {
    let url = `/api/openstad/api/datalayer`;

    const datalayerSwr = useSWR(projectId ? url : null);

    async function createDatalayer(name: string, layer: string) {
        const res = await fetch(url, {
            method: 'POST',
            headers: {
                'Content-Type': 'application/json',
            },
            body: JSON.stringify({ name: name, layer: JSON.parse(layer) }),
        });
        return await res.json();
    }

    async function removeDatalayer(id: number) {
        const deleteUrl = `/api/openstad/api/project/${projectId}/datalayer/${id}`;

        const res = await fetch(deleteUrl, {
            method: 'DELETE',
            headers: {
                'Content-Type': 'application/json',
            },
        });

        if (res.ok) {
            const existingData = [...datalayerSwr.data];
            const updatedList = existingData.filter((ed) => ed.id !== id);
            datalayerSwr.mutate(updatedList);
            return updatedList;
        } else {
            throw new Error('Could not remove this area');
        }
    }

    return { ...datalayerSwr, createDatalayer, removeDatalayer };
}
