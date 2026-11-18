/** The route with the values of its own [segments]. */
export function routeParamsKey(
  pathname: string,
  query: Record<string, string | string[] | undefined>
): string {
  const names = (pathname.match(/\[[^\]]*\]+/g) ?? []).map((segment) =>
    segment.replace(/[[\].]/g, '')
  );
  const values = names.map((name) => {
    const value = query[name];
    return Array.isArray(value) ? value.join('/') : (value ?? '');
  });
  return [pathname, ...values].join('|');
}
