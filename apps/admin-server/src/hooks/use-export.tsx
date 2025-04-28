import useSWR from 'swr';

export default function useExport(projectId?: string) {
  if (projectId && (!/^\d+$/.test(projectId.toString()))) {
    projectId = undefined;
  }

  const url = `/api/openstad/api/project/${projectId}/export`;

  const exportSWR = useSWR(projectId ? url : null);

  return {...exportSWR}
}