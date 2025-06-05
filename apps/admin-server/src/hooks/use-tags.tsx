import useSWR from 'swr';
import {validateProjectNumber} from "@/lib/validateProjectNumber";

export default function useTag(projectId?: string, includeGlobalTags?: boolean) {
  const projectNumber: number | undefined = validateProjectNumber(projectId, true);

  let url = `/api/openstad/api/project/${projectNumber}/tag`;

  if (includeGlobalTags) {
    url += '?includeGlobalTags=true';
  }

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
