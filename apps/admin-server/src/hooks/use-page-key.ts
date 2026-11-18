import { routeParamsKey } from '@/lib/route-params-key';
import { useRouter } from 'next/router';
import { useState } from 'react';

/** A key that changes when the page opens another record of the same route. */
export function usePageKey(): string {
  const router = useRouter();
  const params = router.isReady
    ? routeParamsKey(router.pathname, router.query)
    : null;
  const [first, setFirst] = useState<string | null>(params);
  if (first === null && params !== null) setFirst(params);
  return params === null || params === (first ?? params) ? '' : params;
}
