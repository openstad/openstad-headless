import { validateProjectNumber } from '@/lib/validateProjectNumber';
import useSWR from 'swr';

type ResourceMarkersOptions = {
  searchTerm?: string;
  tags?: Array<number>;
  enabled?: boolean;
};

export default function useResourceMarkers(
  projectId?: string,
  options?: ResourceMarkersOptions
) {
  const projectNumber: number | undefined = validateProjectNumber(projectId);
  const params = new URLSearchParams();
  if (options?.searchTerm?.trim()) {
    params.set('search[text]', options.searchTerm.trim());
  }
  options?.tags?.forEach((tagId) => params.append('tags', String(tagId)));

  const url = `/api/openstad/api/project/${projectNumber}/resource/markers?${params.toString()}`;
  const { data, error, isLoading } = useSWR(
    options?.enabled && projectNumber ? url : null
  );

  return { data: Array.isArray(data) ? data : [], error, isLoading };
}
