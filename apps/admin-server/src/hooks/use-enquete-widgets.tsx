import { validateProjectNumber } from '@/lib/validateProjectNumber';
import useSWR from 'swr';

export default function useEnqueteWidgets(projectId?: string) {
  const projectNumber: number | undefined = validateProjectNumber(projectId);

  const url = `/api/openstad/api/project/${projectNumber}/submission/widgets`;

  const enqueteSwr = useSWR(projectNumber ? url : null);

  return { ...enqueteSwr };
}
