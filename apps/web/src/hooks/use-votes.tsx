import useSWR from "swr";

export default function useVotes (projectId?: string) { 
  const url = `/api/openstad/api/project/${projectId}/vote`;

  const votesSwr = useSWR(projectId ? url : null)

  return { ...votesSwr };
}