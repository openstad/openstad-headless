import useSWR from 'swr';
import {validateProjectNumber} from "../lib/validateProjectNumber";

export default function useStatus(projectId?: string) {
  const projectNumber: number | undefined = validateProjectNumber(projectId);

  const url = `/api/openstad/api/project/${projectNumber}/status`;

  const statusListSwr = useSWR(projectNumber ? url : null);

  async function createStatus(name: string, seqnr: number, addToNewResources: boolean) {
    const res = await fetch(url, {
      method: 'POST',
      headers: {
        'Content-Type': 'application/json',
      },
      body: JSON.stringify({ projectId: projectNumber, name, seqnr, addToNewResources }),
    });

    return await res.json();
  }

  async function removeStatus(id: number) {
    const deleteUrl = `/api/openstad/api/project/${projectNumber}/status/${id}`;

    const res = await fetch(deleteUrl, {
      method: 'DELETE',
      headers: {
        'Content-Type': 'application/json',
      },
    });

    if (res.ok) {
      const existingData = [...statusListSwr.data];
      const updatedList = existingData.filter((ed) => ed.id !== id);
      statusListSwr.mutate(updatedList);
      return updatedList;
    } else {
      throw new Error('Could not remove this status');
    }
  }

  return {...statusListSwr, createStatus, removeStatus}
}
