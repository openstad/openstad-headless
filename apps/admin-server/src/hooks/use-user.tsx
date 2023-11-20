import { useRouter } from 'next/router';
import useSWR from 'swr';

export default function useUser() {
  const router = useRouter();
  const userId = router.query.user;
  const url = `/api/openstad/api/project/1/user/${userId}`;

  const userSwr = useSWR(userId ? url : null);

  async function updateUser(body: any) {
    const res = await fetch(url, {
      method: 'PUT',
      headers: {
        'Content-Type': 'application/json',
      },
      body: JSON.stringify({ ...body }),
    });
    const data = await res.json();

    userSwr.mutate(data);
  }

  return { ...userSwr, updateUser };
}
