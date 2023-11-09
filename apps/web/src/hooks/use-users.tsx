import useSWR from 'swr';

export default function useUsers() {
  const params = new URLSearchParams()
  params.set('fromIdpUser', '3');
  params.set('identifier', '1');
  params.set('provider', 'openstad');

  const usersSwr = useSWR(`/api/openstad/api/user?${params.size ? params.toString() : ''}`);

  async function createUser(
    email: string,
    projectId?: string,
    role?: string,
    nickName?: string,
    name?: string,
    phoneNumber?: string,
    address?: string,
    city?: string,
    postcode?: string
  ) {
    let url = `/api/openstad/api/project/${projectId}/user`;

    const res = await fetch(url, {
      method: 'POST',
      headers: {
        'Content-Type': 'application/json',
      },
      body: JSON.stringify({
        email: email,
        role: role,
        nickName: nickName,
        name: name,
        phoneNumber: phoneNumber,
        address: address,
        city: city,
        postcode: postcode,
      }),
    });
  }

  return { ...usersSwr, createUser };
}
