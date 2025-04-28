import useSWR from 'swr';

export default function useResource(projectId?: string, id?: string) {
  if (projectId && (!/^\d+$/.test(projectId.toString()))) {
    projectId = undefined;
  }

  if (id && (!/^\d+$/.test(id.toString()))) {
    id = undefined;
  }

  const url = `/api/openstad/api/project/${projectId}/resource/${id}?includeUserVote=1&includeTags=1`;

  const resourceSwr = useSWR(projectId && id ? url : null);

  return { ...resourceSwr };
}
