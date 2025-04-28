import useSWR from 'swr';

export default function usePolls(projectId?: string) {
  if (projectId && (!/^\d+$/.test(projectId.toString()))) {
    projectId = undefined;
  }

  const url = `/api/openstad/api/project/${projectId}/poll`;

  const pollListSwr = useSWR(projectId ? url : null);

  return {...pollListSwr}
}