import { useRouter } from 'next/router';
import toast from 'react-hot-toast';
import useSWR from 'swr';

export default function useUser() {
  const router = useRouter();
  const userId = router.query.user;
  const url = `/api/openstad/api/project/1/user/${userId}`;

  const userSwr = useSWR(userId ? url : null);

  async function updateUser(body: any) {
    try {
      const res = await fetch(url, {
        method: 'PUT',
        headers: {
          'Content-Type': 'application/json',
        },
        body: JSON.stringify({ ...body }),
      });

      if(!res.ok) {
        toast.error('De gebruiker kon niet worden aangemaakt!')
      } else {
        const data = await res.json();

        userSwr.mutate(data);
      }
      toast.success('Gebruiker aangemaakt!');
    } catch (error) {
      toast.error('De gebruiker kon niet worden aangemaakt!')
    }
  }

  return { ...userSwr, updateUser };
}
