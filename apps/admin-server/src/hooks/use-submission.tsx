import { validateProjectNumber } from '@/lib/validateProjectNumber';
import useSWR from 'swr';

export default function useSubmissions(projectId?: string) {
  const projectNumber: number | undefined = validateProjectNumber(projectId);

  const baseUrl = `/api/openstad/api/project/${projectNumber}/submission`;
  const url = `${baseUrl}?includeUser=1`;

  const { data, isLoading, error, mutate } = useSWR(projectNumber ? url : null);

  async function remove(
    id: string | number,
    multiple?: boolean,
    ids?: number[]
  ) {
    const deleteUrl = multiple ? `${baseUrl}/delete` : `${baseUrl}/${id}`;

    const res = await fetch(deleteUrl, {
      method: 'DELETE',
      headers: {
        'Content-Type': 'application/json',
      },
      body: multiple ? JSON.stringify({ ids }) : undefined,
    });

    if (res.ok) {
      await mutate();
      return true;
    } else {
      throw new Error('Could not remove the submission');
    }
  }

  return { data, isLoading, error, remove };
}
