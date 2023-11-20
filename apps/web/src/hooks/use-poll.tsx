import useSWR from 'swr';

export default function usePolls(projectId?: string) {
  const url = `/api/openstad/api/project/${projectId}/poll`;

  const pollListSwr = useSWR(projectId ? url : null);

  return {...pollListSwr}
}