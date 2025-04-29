import useSWR from 'swr';
import {validateProjectNumber} from "@/lib/validateProjectNumber";

export default function useComments(projectId?: string, includes?: string, getFromComments?: boolean) {
  const projectNumber: number | undefined = validateProjectNumber(projectId);

  const includeString = includes ? includes : '?includeComments=1&includeRepliesOnComments=1';
  getFromComments = getFromComments ? getFromComments : false;

  const url = getFromComments
      ? `/api/openstad/api/project/${projectNumber}/comment${includeString}`
      : `/api/openstad/api/project/${projectNumber}/resource${includeString}`;

  const commentListSwr = useSWR(projectNumber ? url : null);

  async function removeComment(id: number) {
    const deleteUrl = `/api/openstad/api/project/${projectNumber}/comment/${id}`;

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