import { useRouter } from 'next/router';
import useSWR from 'swr';

export default function useUser() {

  const router = useRouter();
  let userId = router.query.user || '';
  if (Array.isArray(userId)) userId = userId[0];
  userId = atob(userId);

  let url = '';
  if (userId) {
    url = `/api/openstad/api/user/${userId}`;
  }

  let match = userId.match(/^(.+)-\*-(.+)$/);
  if (match) {
    url = `/api/openstad/api/user?&byIdpUser[identifier]=${match[2]}&byIdpUser[provider]=${match[1]}`
  }

  const userSwr = useSWR(url);

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
