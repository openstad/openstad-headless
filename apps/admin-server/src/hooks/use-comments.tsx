import useSWR from 'swr';

export default function useComments(projectId?: string, type?: string) {
  const resourceType = type === 'image-resource' ? 'image-resource' : 'resource' ;

  const url = `/api/openstad/api/project/${projectId}/${resourceType}?includeComments=1&includeRepliesOnComments=1`;

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