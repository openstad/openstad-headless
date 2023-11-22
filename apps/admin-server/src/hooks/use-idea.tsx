import useSWR from 'swr';

export default function useIdea(projectId?: string, id?: string) {
  const url = `/api/openstad/api/project/${projectId}/idea/${id}?includeUserVote=1`;

  const ideaSwr = useSWR(projectId && id ? url : null);

  return { ...ideaSwr };
}
