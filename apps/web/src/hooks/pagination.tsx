import { useRouter } from 'next/router';

type WithMeta<T> = {
  data: T;
  meta: {
    total: number;
    size: number;
    page: number;
    results: number;
  };
};

export default function usePagination() {
  const router = useRouter();
  const page = Number(router.query.page) || 1;

  function hasNext(meta?: WithMeta<any>['meta']) {
    return meta ? meta.size === meta.results : false;
  }

  function hasPrevious(meta?: WithMeta<any>['meta']) {
    return meta ? page > 1 : false;
  }

  function next() {
    // get current query params from router
    router.push(
      `${router.pathname}?${new URLSearchParams({
        ...router.query,
        page: (page + 1).toString(),
      }).toString()}`
    );
  }

  function previous() {
    router.push(
      `${router.pathname}?${new URLSearchParams({
        ...router.query,
        page: (page - 1).toString(),
      }).toString()}`
    );
  }

  function goToPage(page: number) {
    router.push(
      `${router.pathname}?${new URLSearchParams({
        ...router.query,
        page: page.toString(),
      }).toString()}`
    );
  }

  function goToLast(meta: WithMeta<any>['meta']) {
    const totalPages = Math.round(meta.total / meta.size + 1);

    goToPage(totalPages);
  }

  function goToFirst() {
    goToPage(1);
  }

  function reset() {
    const query = router.query as any;
    delete query.page;
    router.push(`${router.pathname}?${new URLSearchParams(query).toString()}`);
  }

  function pages(meta?: WithMeta<any>['meta']) {
    if (!meta) return [];

    const totalPages = Math.round(meta.total / meta.size + 1);
    const maxAdjacentPages = 1;
    const paginationArray: number[] = [];
    const currentPage = page;

    for (
      let i = currentPage - maxAdjacentPages;
      i <= currentPage + maxAdjacentPages;
      i++
    ) {
      if (i >= 1 && i <= totalPages) {
        paginationArray.push(i);
      }
    }

    while (paginationArray.length < 5 && paginationArray[0] > 1) {
      paginationArray.unshift(paginationArray[0] - 1);
    }

    while (
      paginationArray.length < 5 &&
      paginationArray[paginationArray.length - 1] < totalPages
    ) {
      paginationArray.push(paginationArray[paginationArray.length - 1] + 1);
    }

    return paginationArray.map((i) => ({
      number: i,
      isActive: i === page,
    }));
  }

  return {
    next,
    previous,
    goToPage,
    reset,
    page,
    hasNext,
    hasPrevious,
    pages,
    goToLast,
    goToFirst,
  };
}
