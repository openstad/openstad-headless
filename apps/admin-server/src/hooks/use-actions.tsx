import useSWR from 'swr';

export default function useActions(projectId?: string) {
  const url = `/api/openstad/api/project/${projectId}/action`;

  const actionListSwr = useSWR(projectId ? url : null);

  return {...actionListSwr}
}