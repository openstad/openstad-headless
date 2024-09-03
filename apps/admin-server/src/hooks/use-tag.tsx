import useSWR from 'swr';

export default function useTags(projectId?: string, id?: string) {
  const url = `/api/openstad/api/project/${projectId}/tag/${id}`;

  const tagSwr = useSWR(projectId && id ? url : null);

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
        projectId,
        id,
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
