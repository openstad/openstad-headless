import { ListResponse, getRecords } from '@/lib/records';
import { validateProjectNumber } from '@/lib/validateProjectNumber';
import type {
  ApiComment,
  ApiResource,
  Paginated,
} from '@openstad-headless/types';
import { useMemo } from 'react';
import useSWR from 'swr';

export type CommentListOptions = {
  sort?: string;
  searchField?: string;
  searchTerm?: string;
  sentiment?: string;
  resourceId?: string;
};

export default function useComments<
  T extends ApiComment | ApiResource = ApiComment,
>(
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

  // Lists comments, or resources with nested comments when !getFromComments;
  // callers pick the item type via T.
  const commentListSwr = useSWR<ListResponse<T>>(projectNumber ? url : null);

  const records = useMemo(
    () => getRecords(commentListSwr.data),
    [commentListSwr.data]
  );
  const pagination =
    commentListSwr.data && !Array.isArray(commentListSwr.data)
      ? commentListSwr.data.metadata
      : null;

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
  }: createComment): Promise<
    Partial<ApiComment> & { error?: string; message?: string }
  > {
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
      const newComment: ApiComment = await res.json();
      const existingData = commentListSwr.data || [];
      // Known issue: the list may hold resources or a paginated wrapper, so
      // prepending a comment here does not match its shape.
      const updatedList = [
        newComment,
        ...(existingData as T[]),
      ] as unknown as ListResponse<T>;
      commentListSwr.mutate(updatedList);
      return newComment;
    } else {
      return await res.json();
    }
  }

  async function fetchAll(): Promise<T[]> {
    const fetchAllParams = new URLSearchParams({
      noPagination: 'true',
    });
    const response = await fetch(`${baseUrl}&${fetchAllParams.toString()}`);
    const results: Paginated<T> | null = await response.json();
    return results?.records || [];
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
