import useSWR from 'swr';

export default function useTags(projectId?: string) {
  const url = `/api/openstad/api/project/${projectId}/tag`;

  const tagListSwr = useSWR(projectId ? url : null);

  return {...tagListSwr}
}