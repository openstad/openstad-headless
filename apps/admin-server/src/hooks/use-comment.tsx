import { validateProjectNumber } from '@/lib/validateProjectNumber';
import type { ApiComment } from '@openstad-headless/types';
import useSWR from 'swr';

export default function useComment(projectId?: string, id?: string) {
  const projectNumber: number | undefined = validateProjectNumber(projectId);
  const useId: number | undefined = validateProjectNumber(id);

  const url = `/api/openstad/api/project/${projectNumber}/comment/${useId}`;

  const commentSwr = useSWR<ApiComment>(projectNumber && useId ? url : null);

  async function updateComment(
    description: string,
    label: string
  ): Promise<ApiComment> {
    const res = await fetch(url, {
      method: 'PUT',
      headers: {
        'Content-Type': 'application/json',
      },
      body: JSON.stringify({ id: useId, description, label }),
    });

    return await res.json();
  }

  return { ...commentSwr, updateComment };
}
