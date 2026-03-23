import { validateProjectNumber } from '@/lib/validateProjectNumber';
import useSWR from 'swr';

export default function useUniqueCodes(
  projectId?: string,
  page?: number,
  pageSize?: number,
  search?: string,
  sort?: string
) {
  const projectNumber: number | undefined = validateProjectNumber(projectId);

  const params = new URLSearchParams();
  params.set('useAuth', 'openstad');

  if (page !== undefined && pageSize !== undefined) {
    params.set('limit', pageSize.toString());
    params.set('offset', (page * pageSize).toString());
  }
  if (search?.trim()) {
    params.set('search', search.trim());
  }
  if (sort) {
    params.set('sort', sort);
  }

  const shouldFetch =
    projectNumber !== undefined && page !== undefined && pageSize !== undefined;

  const url =
    `/api/openstad/auth/project/${projectNumber}/uniquecode?` +
    params.toString();

  const uniqueCodesListSwr = useSWR(shouldFetch ? url : null, {
    revalidateOnFocus: false,
    keepPreviousData: true,
  });

  async function fetchAllUniqueCodes() {
    const exportParams = new URLSearchParams();
    exportParams.set('useAuth', 'openstad');
    exportParams.set('export', 'true');

    const exportUrl =
      `/api/openstad/auth/project/${projectNumber}/uniquecode?` +
      exportParams.toString();

    const res = await fetch(exportUrl);
    if (res.ok) {
      const data = await res.json();
      return data;
    } else {
      throw new Error('Failed to fetch all stemcodes');
    }
  }

  async function createUniqueCodes(amount?: number) {
    try {
      const baseParams = new URLSearchParams();
      baseParams.set('useAuth', 'openstad');
      const res = await fetch(
        `/api/openstad/auth/project/${projectNumber}/uniquecode?` +
          baseParams.toString(),
        {
          method: 'POST',
          headers: {
            'Content-Type': 'application/json',
          },
          body: JSON.stringify({ amount }),
        }
      );
      return await res.json();
    } catch (err) {
      console.log(err);
    }
  }

  async function resetUniqueCode(id: number) {
    const baseParams = new URLSearchParams();
    baseParams.set('useAuth', 'openstad');
    const resetUrl =
      `/api/openstad/auth/project/${projectNumber}/uniquecode/${id}/reset?` +
      baseParams.toString();
    const res = await fetch(resetUrl, {
      method: 'POST',
      headers: {
        'Content-Type': 'application/json',
      },
    });
    if (res.ok) {
      const data = await res.json();
      const existingData = [...uniqueCodesListSwr.data.data];
      const updatedList = existingData.filter((ed) => ed.id !== id);
      updatedList.push(data);
      uniqueCodesListSwr.mutate({
        ...uniqueCodesListSwr.data,
        data: updatedList,
      });
      return updatedList;
    } else {
      throw new Error('Could not reset this voting code');
    }
  }

  return {
    ...uniqueCodesListSwr,
    createUniqueCodes,
    fetchAllUniqueCodes,
    resetUniqueCode,
  };
}
