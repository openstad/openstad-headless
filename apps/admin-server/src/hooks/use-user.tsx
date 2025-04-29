import { useRouter } from 'next/router';
import useSWR from 'swr';
import {validateProjectNumber} from "@/lib/validateProjectNumber";

export default function useUser() {

  const router = useRouter();
  let userId = router.query.user || '';

  let userDecode = '';
  let url = '';

  if (typeof userId === 'string' && /^[A-Za-z0-9+/]+={0,2}$/.test(userId)) {
    try {
      userDecode = atob(userId);
    } catch (e) {
      console.error('Invalid base64 string');
    }
  }

  if (userDecode) {
    const match = userDecode.match(/^(.+)-\*-(.+)$/);
    if (match) {
      url = `/api/openstad/api/user?byIdpUser[identifier]=${encodeURIComponent(match[2])}&byIdpUser[provider]=${encodeURIComponent(match[1])}`;
    } else {
      url = `/api/openstad/api/user/${encodeURIComponent(userDecode)}`;
    }
  }

  const userSwr = useSWR(url ? url : null);

  async function updateUser(body: any) {

    if (!Array.isArray(body)) {
      // update user
      let projectId = body.projectId;
      if (!projectId) throw new Error('Deze gebruiker kan niet worden bewerkt');
    }

    let url = `/api/openstad/api/project/${body.projectId}/user/${body.id}`;
    const res = await fetch(url, {
      method: 'PUT',
      headers: {
        'Content-Type': 'application/json',
      },
      body: JSON.stringify({ ...body }),
    });
    if (!res.ok) throw new Error('User update failed')

    return await res.json();

  }

  return { ...userSwr, updateUser };

}
