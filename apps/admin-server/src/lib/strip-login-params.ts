const LOGIN_PARAMS = ['openstadlogintoken', 'openstadprojectid'];

export function queryWithoutLoginParams(
  searchParams: URLSearchParams | undefined
): string {
  const params = new URLSearchParams(searchParams);
  LOGIN_PARAMS.forEach((name) => params.delete(name));
  const query = params.toString();
  return query ? `?${query}` : '';
}
