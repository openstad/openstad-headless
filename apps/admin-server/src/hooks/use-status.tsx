import { validateProjectNumber } from '@/lib/validateProjectNumber';
import useSWR from 'swr';

export default function useStatuses(projectId?: string, id?: string) {
  const projectNumber: number | undefined = validateProjectNumber(projectId);
  const useId: number | undefined = validateProjectNumber(id);

  const url = `/api/openstad/api/project/${projectNumber}/status/${useId}`;

  const statuseswr = useSWR(projectNumber && useId ? url : null);

  async function updateStatus(
    name: string | undefined,
    seqnr: number | undefined,
    addToNewResources: boolean | undefined,
    backgroundColor: string | undefined,
    color: string | undefined,
    label: string | undefined,
    mapIcon: string | undefined,
    listIcon: string | undefined,
    extraFunctionality: {
      editableByUser: boolean | undefined;
      canComment: boolean | undefined;
    }
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
        seqnr,
        addToNewResources,
        backgroundColor,
        color,
        label,
        mapIcon,
        listIcon,
        extraFunctionality,
      }),
    });

    return await res.json();
  }

  return { ...statuseswr, updateStatus };
}
