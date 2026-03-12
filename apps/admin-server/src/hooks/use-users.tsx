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
  sort?: string;
  uniqueByIdpUser?: boolean;
  excludeAnonymous?: boolean;
};

export type UsersPaginationMetadata = {
  page: number;
  pageSize: number;
  pageCount: number;
  totalCount: number;
};

function buildUsersUrl(options?: UsersPaginationOptions) {
  const params = new URLSearchParams();

  if (options?.page !== undefined) {
    params.set('page', options.page.toString());
  }
  if (options?.pageSize !== undefined) {
    params.set('pageSize', options.pageSize.toString());
  }
  if (options?.q?.trim()) {
    params.set('q', options.q.trim());
  }
  if (options?.sort?.trim()) {
    params.set('sort', options.sort.trim());
  }
  if (options?.uniqueByIdpUser) {
    params.set('uniqueByIdpUser', '1');
  }
  if (options?.excludeAnonymous) {
    params.set('excludeAnonymous', '1');
  }

  const query = params.toString();
  return `/api/openstad/api/user${query ? `?${query}` : ''}`;
}

function useUsers(options?: UsersPaginationOptions) {
  const url = buildUsersUrl({
    ...options,
    pageSize:
      options?.page !== undefined
        ? (options?.pageSize ?? 20)
        : options?.pageSize,
  });
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

  async function fetchAll(fetchOptions?: UsersPaginationOptions) {
    const response = await fetch(
      buildUsersUrl({
        ...options,
        ...fetchOptions,
        page: undefined,
        pageSize: undefined,
      })
    );

    if (!response.ok) {
      throw new Error('Could not fetch all users');
    }

    const results = await response.json();
    return results?.records ?? results ?? [];
  }

  return { ...usersSwr, data, metadata, createUser, fetchAll };
}

export { useUsers as default, useUsers, type userType };
