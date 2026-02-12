import { validateProjectNumber } from '@/lib/validateProjectNumber';
import useSWR from 'swr';

export default function useComments(
  projectId?: string,
  includes?: string,
  getFromComments?: boolean,
  page?: number,
  pageSize?: number
) {
  const projectNumber: number | undefined = validateProjectNumber(projectId);

  const includeString = includes
    ? includes
    : '?includeComments=1&includeRepliesOnComments=1';
  getFromComments = getFromComments ? getFromComments : false;

  const baseUrl = getFromComments
    ? `/api/openstad/api/project/${projectNumber}/comment${includeString}`
    : `/api/openstad/api/project/${projectNumber}/resource${includeString}`;

  let url = baseUrl;
  if (page !== undefined && pageSize !== undefined) {
    url += `&page=${page}&pageSize=${pageSize}`;
  }

  const commentListSwr = useSWR(projectNumber ? url : null);

  const records = commentListSwr.data?.records || commentListSwr.data || [];
  const pagination = commentListSwr.data?.metadata || null;

  async function removeComment(id: number, multiple?: boolean, ids?: number[]) {
    const deleteUrl = multiple
      ? `/api/openstad/api/project/${projectNumber}/comment/delete`
      : `/api/openstad/api/project/${projectNumber}/comment/${id}`;

    const res = await fetch(deleteUrl, {
      method: 'DELETE',
      headers: {
        'Content-Type': 'application/json',
      },
      body: multiple ? JSON.stringify({ ids }) : undefined,
    });

    if (res.ok) {
      await commentListSwr.mutate();
      return true;
    } else {
      throw new Error('Could not remove this comment');
    }
  }

  type createComment = {
    projectId: string;
    resourceId: number;
    description: string;
    sentiment: 'for' | 'against' | 'no sentiment';
    parentId?: string;
    confirmation?: boolean;
    confirmationReplies?: boolean;
  };

  async function createComment({
    projectId,
    resourceId,
    description,
    sentiment,
    parentId = undefined,
    confirmation = false,
    confirmationReplies = false,
  }: createComment) {
    let url = `/api/openstad/api/project/${projectId}/resource/${resourceId}/comment`;

    const body: {
      description: string;
      sentiment: 'for' | 'against' | 'no sentiment';
      parentId?: string;
      confirmation?: boolean;
      confirmationReplies?: boolean;
    } = {
      description,
      sentiment,
      confirmation,
      confirmationReplies,
    };

    if (parentId) {
      body.parentId = parentId;
    }

    const res = await fetch(url, {
      method: 'POST',
      headers: {
        'Content-Type': 'application/json',
      },
      body: JSON.stringify(body),
    });

    if (res.ok) {
      const newComment = await res.json();
      const existingData = commentListSwr.data || [];
      const updatedList = [newComment, ...existingData];
      commentListSwr.mutate(updatedList);
      return newComment;
    } else {
      return await res.json();
    }
  }

  async function fetchAll(totalCount: number, pageSizeLimit: number) {
    let allData: any[] = [];
    const totalPagesToFetch = Math.ceil(totalCount / pageSizeLimit);

    for (let currentPage = 0; currentPage < totalPagesToFetch; currentPage++) {
      const response = await fetch(
        `${baseUrl}&page=${currentPage}&pageSize=${pageSizeLimit}`
      );
      const results = await response.json();
      allData = allData.concat(results?.records || []);
    }
    return allData;
  }

  return {
    ...commentListSwr,
    data: records,
    pagination,
    removeComment,
    createComment,
    fetchAll,
  };
}
