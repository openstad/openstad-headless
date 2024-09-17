import useSWR from 'swr';

export default function useComments(projectId?: string, includes?: string, getFromComments?: boolean) {
  const includeString = includes ? includes : '?includeComments=1&includeRepliesOnComments=1';
  getFromComments = getFromComments ? getFromComments : false;

  const url = getFromComments
      ? `/api/openstad/api/project/${projectId}/comment${includeString}`
      : `/api/openstad/api/project/${projectId}/resource${includeString}`;

  const commentListSwr = useSWR(projectId ? url : null);

  async function removeComment(id: number) {
    const deleteUrl = `/api/openstad/api/project/${projectId}/comment/${id}`;

    const res = await fetch(deleteUrl, {
      method: 'DELETE',
      headers: {
        'Content-Type': 'application/json',
      },
    });

    if (res.ok) {
      const existingData = [...commentListSwr.data];
      const updatedList = existingData.filter((ed) => ed.id !== id);
      commentListSwr.mutate(updatedList);
      return updatedList;
    } else {
      throw new Error('Could not remove this comment');
    }
  }

  return {...commentListSwr, removeComment}
}