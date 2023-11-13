import useSWR from 'swr'

export default function useIdpUser(identifier: string, provider: string) {

  const IdpUserSwr = useSWR(`/api/openstad/api/user?fromIdpUser=1&identifier=${identifier}&provider=${provider}`);

  async function createUser(
    email: string,
    projectId?: string,
    role?: string,
  ) {

    let url = `/api/openstad/api/project/${projectId}/user`;

    const res = await fetch(url, {
      method: 'POST',
      headers: {
        'Content-Type': 'application/json',
      },
      body: JSON.stringify({
        email,
        role,
      }),
    });

    // const data = await res.json();

    // IdpUserSwr.mutate(data);
  }

  async function updateUser(
    id: string,
    email: string,
    projectId?: string,
    role?: string,
  ) {
    let url = `/api/openstad/api/project/${projectId}/user/${id}`;
    const res = await fetch(url, {
      method: 'PUT',
      headers: {
        'Content-Type': 'application/json',
      },
      body: JSON.stringify({
        email,
        role,
      }),
    });
    // const data = await res.json();

    // IdpUserSwr.mutate(data);
  }

  return {... IdpUserSwr, createUser, updateUser };
}