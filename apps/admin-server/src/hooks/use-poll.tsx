import { validateProjectNumber } from '@/lib/validateProjectNumber';
import type { ApiPoll } from '@openstad-headless/types';
import useSWR from 'swr';

export default function usePolls(projectId?: string) {
  const projectNumber: number | undefined = validateProjectNumber(projectId);

  const url = `/api/openstad/api/project/${projectNumber}/poll`;

  const pollListSwr = useSWR<ApiPoll[]>(projectNumber ? url : null);

  return { ...pollListSwr };
}
