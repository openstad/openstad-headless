import useSWR from "swr";
import {validateProjectNumber} from "../lib/validateProjectNumber";

export default function useAccessCodes(projectId?: string) {
  const projectNumber: number | undefined = validateProjectNumber(projectId);

  const params = new URLSearchParams();
  params.set('useAuth', 'openstad');

  const url = `/api/openstad/auth/project/${projectNumber}/accesscode?` + params.toString();

  const accessCodesListSwr = useSWR(projectNumber ? url : null);

  async function createAccessCode(code?: string) {
    try {
      const res = await fetch(`/api/openstad/auth/project/${projectNumber}/accesscode?` + params.toString(), {
        method: 'POST',
        headers: {
          'Content-Type': 'application/json',
        },
        body: JSON.stringify({code}),
      });
      return await res.json();
    } catch(err) {
      console.log(err);
    }
  }

  async function deleteAccessCode(codeId: number) {
    const deleteUrl = `/api/openstad/auth/project/${projectNumber}/accesscode/${codeId}/delete?` + params.toString();

    const res = await fetch(deleteUrl, {
      method: 'DELETE',
      headers: {
        'Content-Type': 'application/json',
      },
    });

    if (res.ok) {
      const existingData = [...accessCodesListSwr?.data?.data || []];
      const updatedList = existingData.filter((ed: {id: number}) => ed.id !== codeId);
      accessCodesListSwr.mutate(updatedList);
      return updatedList;
    } else {
      throw new Error('Could not remove this access code');
    }

  }

  return { ...accessCodesListSwr, createAccessCode, deleteAccessCode };

}
