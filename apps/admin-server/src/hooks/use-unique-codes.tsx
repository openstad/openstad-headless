import useSWR from "swr";

export default function useUniqueCodes(projectId: string) {

  const params = new URLSearchParams();
  params.set('useAuth', 'openstad');

  const url = `/api/openstad/auth/project/${projectId}/uniquecode?` + params.toString();

  const uniqueCodesListSwr = useSWR(projectId ? url : null);

  async function createUniqueCodes(amount?: string) {
    try {
      const res = await fetch(`/api/openstad/auth/project/${projectId}/uniquecode?` + params.toString(), {
        method: 'POST',
        headers: {
          'Content-Type': 'application/json',
        },
        body: JSON.stringify({amount}),
      });
      return await res.json();
    } catch(err) {
      console.log(err);
    }
  }

  async function resetUniqueCode(id: number) {
    const url = `/api/openstad/auth/project/${projectId}/uniquecode/${id}/reset?` + params.toString();
    const res = await fetch(url, {
      method: 'POST',
      headers: {
        'Content-Type': 'application/json',
      },
    });
    if (res.ok) {
      const data = await res.json();
      const existingData = [...uniqueCodesListSwr.data.data];
      const updatedList = existingData.filter((ed) => ed.id !== id);
      updatedList.push(data);
      uniqueCodesListSwr.mutate({ data: updatedList });
      return updatedList;
    } else {
      throw new Error('Could not reset this voting code');
    }
  }

  return { ...uniqueCodesListSwr, createUniqueCodes, resetUniqueCode };

}
