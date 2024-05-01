import useSWR from 'swr';

export default function useSubmissions(projectId?: string) {
  const url = `/api/openstad/api/project/${projectId}/submission`;

  const { data, isLoading, error, mutate } = useSWR(projectId ? url : null);

  async function remove(id: string|number) {
    const res = await fetch(`${url}/${id}`, {
      method: 'DELETE',
      headers: {
        'Content-Type': 'application/json',
      },
    });

    if (res.ok) {
      const existingData = [...data];
      const updatedList = existingData.filter((ed) => ed.id !== id);
      mutate(updatedList);
      return updatedList;
    } else {
      throw new Error('Could not remove the submission');
    }
  }

  return { data, isLoading, error, remove };
}