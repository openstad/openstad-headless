import { validateProjectNumber } from '@/lib/validateProjectNumber';
import type { ApiAction } from '@openstad-headless/types';
import useSWR from 'swr';

export default function useActions(projectId?: string) {
  const projectNumber: number | undefined = validateProjectNumber(projectId);

  const url = `/api/openstad/api/project/${projectNumber}/action`;

  const actionListSwr = useSWR<ApiAction[]>(projectNumber ? url : null);

  return { ...actionListSwr };
}
