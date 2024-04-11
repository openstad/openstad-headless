import useSWR from 'swr';

type userType = {
  [key: string]: string | number | {} | undefined;
  name?: string;
  idpUser?: {
    identifier: string | number;
    provider: string;
  };
}

function useUsers() {

  const usersSwr = useSWR('/api/openstad/api/user');

  async function createUser(user:userType) {
    let url = `/api/openstad/api/project/${user.projectId}/user`;

    const res = await fetch(url, {
      method: 'POST',
      headers: {
        'Content-Type': 'application/json',
      },
      body: JSON.stringify(user),
    });
    if (!res.ok) throw new Error('User update failed')

    return await res.json();

  }

  return { ...usersSwr, createUser };
}

export {
  useUsers as default,
  useUsers,
  type userType,
}
