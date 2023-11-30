import useSWR from 'swr';

export default function useResource(projectId?: string, id?: string) {
  const url = `/api/openstad/api/project/${projectId}/resource/${id}?includeUserVote=1`;

  const resourceSwr = useSWR(projectId && id ? url : null);

  return { ...resourceSwr };
}
