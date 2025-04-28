import useSWR from 'swr';

export default function useActions(projectId?: string) {
  if (projectId && (!/^\d+$/.test(projectId.toString()))) {
    projectId = undefined;
  }

  const url = `/api/openstad/api/project/${projectId}/action`;

  const actionListSwr = useSWR(projectId ? url : null);

  return {...actionListSwr}
}