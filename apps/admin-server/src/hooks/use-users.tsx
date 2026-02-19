import useSWR from 'swr';

type userType = {
  [key: string]: string | number | {} | undefined;
  name?: string;
  idpUser?: {
    identifier: string | number;
    provider: string;
  };
};

export type UsersPaginationOptions = {
  page?: number;
  pageSize?: number;
  q?: string;
  uniqueByIdpUser?: boolean;
  excludeAnonymous?: boolean;
};

export type UsersPaginationMetadata = {
  page: number;
  pageSize: number;
  pageCount: number;
  totalCount: number;
};

function useUsers(options?: UsersPaginationOptions) {
  const page = options?.page;
  const pageSize = options?.pageSize ?? 20;
  const q = options?.q?.trim();
  const uniqueByIdpUser = options?.uniqueByIdpUser;
  const excludeAnonymous = options?.excludeAnonymous;

  const url =
    page !== undefined
      ? `/api/openstad/api/user?page=${page}&pageSize=${pageSize}${q ? `&q=${encodeURIComponent(q)}` : ''}${uniqueByIdpUser ? '&uniqueByIdpUser=1' : ''}${excludeAnonymous ? '&excludeAnonymous=1' : ''}`
      : '/api/openstad/api/user';
  const usersSwr = useSWR(url);
  const res = usersSwr.data;
  const data = res?.records ?? res;
  const metadata = res?.metadata;

  async function createUser(user: userType) {
    let url = `/api/openstad/api/project/${user.projectId}/user`;

    const res = await fetch(url, {
      method: 'POST',
      headers: {
        'Content-Type': 'application/json',
      },
      body: JSON.stringify(user),
    });
    if (!res.ok) throw new Error('User update failed');

    return await res.json();
  }

  return { ...usersSwr, data, metadata, createUser };
}

export { useUsers as default, useUsers, type userType };
