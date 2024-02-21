import useSWR from 'swr';

export default function useVotes(projectId?: string) {
  const url = `/api/openstad/api/project/${projectId}/vote`;

  const votesSwr = useSWR(projectId ? url : null);

  async function removeVote(id: number) {
    const deleteUrl = `/api/openstad/api/project/${projectId}/vote/${id}`;

    const res = await fetch(deleteUrl, {
      method: 'DELETE',
      headers: {
        'Content-Type': 'application/json',
      },
    });

    if (res.ok) {
      const existingData = [...votesSwr.data];
      const updatedList = existingData.filter((ed) => ed.id !== id);
      votesSwr.mutate(updatedList);
      return updatedList;
    } else {
      throw new Error('Could not remove this vote');
    }
  }

  return { ...votesSwr, removeVote };
}
