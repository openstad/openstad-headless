import useSWR from 'swr';
import {validateProjectNumber} from "../lib/validateProjectNumber";

export default function useTags(projectId?: string, id?: string) {

  // Global tags have projectId = 0, therefore this check is different from the others
  const projectNumber: number | undefined = validateProjectNumber(projectId, true);
  const useId: number | undefined = validateProjectNumber(id);

  const url = `/api/openstad/api/project/${projectNumber}/tag/${useId}`;

  const tagSwr = useSWR((projectNumber || projectNumber === 0) && useId ? url : null);

  async function updateTag(
    name: string | undefined,
    type: string | undefined,
    seqnr: number | undefined,
    addToNewResources: boolean | undefined,
    backgroundColor: string | undefined,
    color: string | undefined,
    label: string | undefined,
    mapIcon: string | undefined,
    listIcon: string | undefined,
    useDifferentSubmitAddress: boolean | undefined,
    newSubmitAddress: string | undefined,
    defaultResourceImage: string | undefined,
    documentMapIconColor: string | undefined
  ) {
    const res = await fetch(url, {
      method: 'PUT',
      headers: {
        'Content-Type': 'application/json',
      },
      body: JSON.stringify({
        projectId: projectNumber,
        id: useId,
        name,
        type,
        seqnr,
        addToNewResources,
        backgroundColor,
        color,
        label,
        mapIcon,
        listIcon,
        useDifferentSubmitAddress,
        newSubmitAddress,
        defaultResourceImage,
        documentMapIconColor
      }),
    });

    return await res.json();
  }

  return { ...tagSwr, updateTag }
}
