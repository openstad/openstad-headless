import { validateProjectNumber } from '@/lib/validateProjectNumber';
import type { ApiWidget } from '@openstad-headless/types';
import useSWR from 'swr';

export default function useEnqueteWidgets(projectId?: string) {
  const projectNumber: number | undefined = validateProjectNumber(projectId);

  const url = `/api/openstad/api/project/${projectNumber}/submission/widgets`;

  const enqueteSwr = useSWR<Pick<ApiWidget, 'id' | 'description'>[]>(
    projectNumber ? url : null
  );

  return { ...enqueteSwr };
}
