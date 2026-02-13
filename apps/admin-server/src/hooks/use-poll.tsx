import { validateProjectNumber } from '@/lib/validateProjectNumber';
import useSWR from 'swr';

export default function usePolls(projectId?: string) {
  const projectNumber: number | undefined = validateProjectNumber(projectId);

  const url = `/api/openstad/api/project/${projectNumber}/poll`;

  const pollListSwr = useSWR(projectNumber ? url : null);

  return { ...pollListSwr };
}
