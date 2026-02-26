import { validateProjectNumber } from '@/lib/validateProjectNumber';
import useSWR from 'swr';

export default function useChoiceGuideResults(projectId?: string) {
  const projectNumber: number | undefined = validateProjectNumber(projectId);

  let url = `/api/openstad/api/project/${projectNumber}/choicesguide`;

  async function remove(
    id: string | number,
    multiple?: boolean,
    ids?: number[]
  ) {
    const deleteUrl = multiple ? `${url}/delete` : `${url}/${id}`;

    const res = await fetch(deleteUrl, {
      method: 'DELETE',
      headers: {
        'Content-Type': 'application/json',
      },
      body: multiple ? JSON.stringify({ ids }) : undefined,
    });

    if (!res.ok) {
      throw new Error('Could not remove the choiceguide result');
    }
  }

  return { remove };
}
