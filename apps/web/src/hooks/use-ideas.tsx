import useSWR from 'swr';

export default function useIdeas(projectId?: string) {
  const ideasListSwr = useSWR(
    `/api/openstad/api/project/${projectId}/idea?includePoll=1`
  );

  return { ...ideasListSwr };
}
