import useSWR from 'swr';
import {validateProjectNumber} from "@/lib/validateProjectNumber";

export default function useTag(projectId?: string) {
  // Global tags have projectId = 0, therefore this check is different from the others
  const projectNumber: number | undefined = validateProjectNumber(projectId, true);

  const url = `/api/openstad/api/project/${projectNumber}/tag`;

  const tagListSwr = useSWR(projectNumber ? url : null);

  async function createTag(name: string, type: string, seqnr: number, addToNewResources: boolean) {
    const res = await fetch(url, {
      method: 'POST',
      headers: {
        'Content-Type': 'application/json',
      },
      body: JSON.stringify({ projectId: projectNumber, name, type, seqnr, addToNewResources }),
    });

    return await res.json();
  }

  async function removeTag(id: number) {
    const deleteUrl = `/api/openstad/api/project/${projectNumber}/tag/${id}`;

    const res = await fetch(deleteUrl, {
      method: 'DELETE',
      headers: {
        'Content-Type': 'application/json',
      },
    });

    if (res.ok) {
      const existingData = [...tagListSwr.data];
      const updatedList = existingData.filter((ed) => ed.id !== id);
      tagListSwr.mutate(updatedList);
      return updatedList;
    } else {
      throw new Error('Could not remove this tag');
    }
  }

  return {...tagListSwr, createTag, removeTag}
}
