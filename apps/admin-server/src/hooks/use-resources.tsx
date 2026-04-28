import { validateProjectNumber } from '@/lib/validateProjectNumber';
import useSWR from 'swr';

export type ResourceListOptions = {
  sort?: string;
  searchField?: string;
  searchTerm?: string;
};

export default function useResources(
  projectId?: string,
  includeGlobalTags?: boolean,
  page?: number,
  pageSize?: number,
  options?: ResourceListOptions
) {
  const projectNumber: number | undefined = validateProjectNumber(projectId);
  const baseUrl = `/api/openstad/api/project/${projectNumber}/resource`;
  const params = new URLSearchParams({
    includeUser: '1',
    includeVoteCount: '1',
    includeTags: '1',
  });

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

  const url = `${baseUrl}?${params.toString()}`;

  const resourcesListSwr = useSWR(projectNumber ? url : null);

  const records = resourcesListSwr.data?.records || resourcesListSwr.data || [];
  const pagination = resourcesListSwr.data?.metadata || null;

  async function create(body: any) {
    const res = await fetch(url, {
      method: 'POST',
      headers: {
        'Content-Type': 'application/json',
      },
      body: JSON.stringify({ ...body }),
    });

    if (res.ok) {
      const data = await res.json();
      resourcesListSwr.mutate([...resourcesListSwr.data, data]);
      return data;
    } else {
      throw new Error('Could not create the plan');
    }
  }

  async function update(id: number, body: any) {
    let updateUrl = `/api/openstad/api/project/${projectNumber}/resource/${id}?includeUserVote=1`;

    if (includeGlobalTags) {
      updateUrl += '&includeGlobalTags=true';
    }

    const res = await fetch(updateUrl, {
      method: 'PUT',
      headers: {
        'Content-Type': 'application/json',
      },
      body: JSON.stringify({ ...body }),
    });

    if (res.ok) {
      const data = await res.json();
      const existingData = [...resourcesListSwr.data];
      const updatedList = existingData.filter((ed) => ed.id !== data.id);
      updatedList.push(data);
      resourcesListSwr.mutate(updatedList);
      return data;
    } else {
      throw new Error('Could not update the plan');
    }
  }

  async function remove(id: number, multiple?: boolean, ids?: number[]) {
    const deleteUrl = multiple
      ? `/api/openstad/api/project/${projectNumber}/resource/delete`
      : `/api/openstad/api/project/${projectNumber}/resource/${id}?includeUserVote=1`;

    const res = await fetch(deleteUrl, {
      method: 'DELETE',
      headers: {
        'Content-Type': 'application/json',
      },
      body: multiple ? JSON.stringify({ ids }) : undefined,
    });

    if (res.ok) {
      const existingData = [...resourcesListSwr.data];
      const updatedList = existingData.filter((ed) => ed.id !== id);
      resourcesListSwr.mutate(updatedList);
      return updatedList;
    } else {
      throw new Error('Could not remove the plan');
    }
  }

  async function duplicate(ids: number[]) {
    const duplicateUrl = `/api/openstad/api/project/${projectNumber}/resource/duplicate`;

    const res = await fetch(duplicateUrl, {
      method: 'POST',
      headers: {
        'Content-Type': 'application/json',
      },
      body: JSON.stringify({ ids }),
    });

    if (res.ok) {
      const data = await res.json();

      resourcesListSwr.mutate([...resourcesListSwr.data, ...data]);
      return data;
    } else {
      throw new Error('Could not duplicate the widgets');
    }
  }

  async function fetchAll(totalCount: number, pageSizeLimit: number) {
    let allData: any[] = [];
    const totalPagesToFetch = Math.ceil(totalCount / pageSizeLimit);

    for (let currentPage = 0; currentPage < totalPagesToFetch; currentPage++) {
      const fetchAllParams = new URLSearchParams({
        includeUser: '1',
        includeVoteCount: '1',
        includeTags: '1',
        page: currentPage.toString(),
        pageSize: pageSizeLimit.toString(),
      });
      const response = await fetch(`${baseUrl}?${fetchAllParams.toString()}`);
      const results = await response.json();
      allData = allData.concat(results?.records || []);
    }
    return allData;
  }

  return {
    ...resourcesListSwr,
    data: records,
    pagination,
    create,
    update,
    remove,
    duplicate,
    fetchAll,
  };
}
