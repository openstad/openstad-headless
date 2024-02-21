import useSWR from "swr";

export default function useCodes(clientId: string) {
  const params = new URLSearchParams();
  params.set('clientId', `${clientId}`);

  const codesListSwr = useSWR(
    `/api/oauth/api/admin/unique-codes?` + params.toString(),
  );

  async function removeCode(id: number) {
    const deleteUrl = `/api/oauth/api/admin/unique-code/${id}/delete?` + params.toString();

    const res = await fetch(deleteUrl, {
      method: 'POST',
      headers: {
        'Content-Type': 'application/json',
      },
    });

    if (res.ok) {
      const existingData = [...codesListSwr.data];
      const updatedList = existingData.filter((ed) => ed.id !== id);
      codesListSwr.mutate(updatedList);
      return updatedList;
    } else {
      throw new Error('Could not remove this voting code');
    }
  }

  return { ...codesListSwr, removeCode };
}
