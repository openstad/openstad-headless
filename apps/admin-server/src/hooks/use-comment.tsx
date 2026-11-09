import { validateProjectNumber } from '@/lib/validateProjectNumber';
import useSWR from 'swr';

export default function useComment(projectId?: string, id?: string) {
  const projectNumber: number | undefined = validateProjectNumber(projectId);
  const useId: number | undefined = validateProjectNumber(id);

  const url = `/api/openstad/api/project/${projectNumber}/comment/${useId}`;

  const commentSwr = useSWR(projectNumber && useId ? url : null);

  async function updateComment(updates: {
    description?: string;
    sentiment?: string;
    label?: string;
  }) {
    const res = await fetch(url, {
      method: 'PUT',
      headers: {
        'Content-Type': 'application/json',
      },
      body: JSON.stringify({ id: useId, ...updates }),
    });

    return await res.json();
  }

  return { ...commentSwr, updateComment };
}
