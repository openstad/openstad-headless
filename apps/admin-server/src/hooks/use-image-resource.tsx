import useSWR from 'swr';

export default function useImageResource(projectId?: string, id?: string) {
  const url = `/api/openstad/api/project/${projectId}/image-resource/${id}?includeUserVote=1&includeTags=1`;

  const imageResourcesListSwr = useSWR(projectId && id ? url : null);

  return { ...imageResourcesListSwr };
}
