import useSWR from 'swr';

export default function useExport(projectId?: string) {
  const url = `/api/openstad/api/project/${projectId}/export`;

  const exportSWR = useSWR(projectId ? url : null);

  return {...exportSWR}
}