import { validateProjectNumber } from '@/lib/validateProjectNumber';
import useSWR from 'swr';

export default function useExport(projectId?: string) {
  const projectNumber: number | undefined = validateProjectNumber(projectId);

  const url = `/api/openstad/api/project/${projectNumber}/export?includeConfig=1&includeEmailConfig=1`;

  const exportSWR = useSWR(projectNumber ? url : null);

  return { ...exportSWR };
}
