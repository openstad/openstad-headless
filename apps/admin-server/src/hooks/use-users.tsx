import useSWR from 'swr';

export default function useUsers() {
  const usersSwr = useSWR('/api/openstad/api/user');

  async function createUser(
    email: string,
    projectId?: string,
  ) {
    let url = `/api/openstad/api/project/${projectId}/user`;

    const res = await fetch(url, {
      method: 'POST',
      headers: {
        'Content-Type': 'application/json',
      },
      body: JSON.stringify({
        email: email,
      }),
    });
  }

  return { ...usersSwr, createUser };
}
