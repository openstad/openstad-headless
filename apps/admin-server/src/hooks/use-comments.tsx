import { validateProjectNumber } from '@/lib/validateProjectNumber';
import useSWR from 'swr';

export type CommentListOptions = {
  sort?: string;
  searchField?: string;
  searchTerm?: string;
  sentiment?: string;
  resourceId?: string;
};

export default function useComments(
  projectId?: string,
  includes?: string,
  getFromComments?: boolean,
  page?: number,
  pageSize?: number,
  options?: CommentListOptions
) {
  const projectNumber: number | undefined = validateProjectNumber(projectId);

  const includeString = includes
    ? includes
    : '?includeComments=1&includeRepliesOnComments=1';
  getFromComments = getFromComments ? getFromComments : false;

  const resourcePath =
    getFromComments && options?.resourceId && options.resourceId !== '0'
      ? `/resource/${options.resourceId}`
      : '';
  const baseUrl = getFromComments
    ? `/api/openstad/api/project/${projectNumber}${resourcePath}/comment${includeString}`
    : `/api/openstad/api/project/${projectNumber}/resource${includeString}`;

  const params = new URLSearchParams();
  if (page !== undefined && pageSize !== undefined) {
    params.set('page', page.toString());
    params.set('pageSize', pageSize.toString());
  }
  if (options?.sort?.trim()) {
    params.set('sort', options.sort.trim());
  }
  if (options?.searchTerm?.trim()) {
    const searchField =
      options.searchField && options.searchField !== ''
        ? options.searchField
        : 'text';
    params.set(`search[${searchField}]`, options.searchTerm.trim());
  }
  if (options?.sentiment?.trim()) {
    params.set('sentiment', options.sentiment.trim());
  }
  const url = `${baseUrl}${params.toString() ? `&${params.toString()}` : ''}`;

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
      const fetchAllParams = new URLSearchParams({
        page: currentPage.toString(),
        pageSize: pageSizeLimit.toString(),
      });
      const response = await fetch(`${baseUrl}&${fetchAllParams.toString()}`);
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
