import useSWR from 'swr';

export default function useStatuses(projectId?: string, id?: string) {
  const url = `/api/openstad/api/project/${projectId}/status/${id}`;

  const statuseswr = useSWR(projectId && id ? url : null);

  async function updateStatus(name: string | undefined, seqnr: number | undefined, addToNewResources: boolean | undefined, backgroundColor: string | undefined, color: string | undefined, label: string | undefined, mapIcon: string | undefined, listIcon: string | undefined, extraFunctionality: { editableByUser: boolean | undefined, canComment: boolean | undefined } ) {
    const res = await fetch(url, {
      method: 'PUT',
      headers: {
        'Content-Type': 'application/json',
      },
      body: JSON.stringify({ projectId, id, name, seqnr, addToNewResources, backgroundColor, color, label, mapIcon, listIcon, extraFunctionality }),
    });

    return await res.json();
  }

  return { ...statuseswr, updateStatus }
}
