import useSWR from "swr";
import {validateProjectNumber} from "../lib/validateProjectNumber";

export default function useUniqueCodes(projectId?: string) {
  const projectNumber: number | undefined = validateProjectNumber(projectId);

  const params = new URLSearchParams();
  params.set('useAuth', 'openstad');

  const url = `/api/openstad/auth/project/${projectNumber}/uniquecode?` + params.toString();

  const uniqueCodesListSwr = useSWR(projectNumber ? url : null);

  async function fetchAllUniqueCodes() {
    // add export=true for the export fetch
    const exportParams = new URLSearchParams(params);
    exportParams.set('export', 'true');

    const exportUrl = `/api/openstad/auth/project/${projectNumber}/uniquecode?` + exportParams.toString();

    const res = await fetch(exportUrl);
    if (res.ok) {
      const data = await res.json();
      return data;
    }
    else{
      throw new Error('Failed to fetch all stemcodes');
    }
  }

  async function createUniqueCodes(amount?: string) {
    try {
      const res = await fetch(`/api/openstad/auth/project/${projectNumber}/uniquecode?` + params.toString(), {
        method: 'POST',
        headers: {
          'Content-Type': 'application/json',
        },
        body: JSON.stringify({amount}),
      });
      return await res.json();
    } catch(err) {
      console.log(err);
    }
  }

  async function resetUniqueCode(id: number) {
    const url = `/api/openstad/auth/project/${projectNumber}/uniquecode/${id}/reset?` + params.toString();
    const res = await fetch(url, {
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
      uniqueCodesListSwr.mutate({ data: updatedList });
      return updatedList;
    } else {
      throw new Error('Could not reset this voting code');
    }
  }

  return { ...uniqueCodesListSwr, createUniqueCodes, fetchAllUniqueCodes, resetUniqueCode };

}
