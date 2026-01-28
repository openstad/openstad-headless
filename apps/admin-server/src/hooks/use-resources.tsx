import useSWR from 'swr';
import {validateProjectNumber} from "@/lib/validateProjectNumber";

export default function useResources(
  projectId?: string,
  includeGlobalTags?: boolean,
  page?: number,
  pageSize?: number
) {
  const projectNumber: number | undefined = validateProjectNumber(projectId);

  const baseUrl = `/api/openstad/api/project/${projectNumber}/resource?includeUser=1&includeVoteCount=1&includeTags=1`;

  let url = baseUrl;
  if (page !== undefined && pageSize !== undefined) {
    url += `&page=${page}&pageSize=${pageSize}`;
  }

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
      const response = await fetch(`${baseUrl}&page=${currentPage}&pageSize=${pageSizeLimit}`);
      const results = await response.json();
      allData = allData.concat(results?.records || []);
    }
    return allData;
  }

  return { ...resourcesListSwr, data: records, pagination, create, update, remove, duplicate, fetchAll };
}
