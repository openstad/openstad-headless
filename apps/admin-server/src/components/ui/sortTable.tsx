import type { DynamicJson } from '@openstad-headless/types';

// Union of the fields the comparators read; each table only uses the keys its
// rows have. Number() mirrors the implicit coercion of `-`.
type SortableRow = {
  createdAt?: string;
  updatedAt?: string;
  id?: number | string;
  seqnr?: number;
  resourceId?: number;
  type?: string | null;
  title?: string;
  name?: string | null;
  email?: string | null;
  postcode?: string | null;
  code?: string | number;
  ip?: string | null;
  userId?: number | null;
  score?: string | number;
  addToNewResources?: boolean;
  extraFunctionality?: { canLike?: boolean };
  resource?: { yes?: number; no?: number };
  config?: DynamicJson;
};

type Comparator = (a: SortableRow, b: SortableRow) => number;

const sortFunctions: Record<string, Comparator> = {
  'date-added': (a, b) =>
    new Date(b.createdAt!).getTime() - new Date(a.createdAt!).getTime(),
  createdAt: (a, b) =>
    new Date(b.createdAt!).getTime() - new Date(a.createdAt!).getTime(),
  'date-modified': (a, b) =>
    new Date(b.updatedAt!).getTime() - new Date(a.updatedAt!).getTime(),
  id: (a, b) => Number(b.id) - Number(a.id),
  seqnr: (a, b) => Number(b.seqnr) - Number(a.seqnr),
  resourceId: (a, b) => Number(b.resourceId) - Number(a.resourceId),
  type: (a, b) => b.type!.toLowerCase().localeCompare(a.type!.toLowerCase()),
  resource: (a, b) =>
    a.title!.toLowerCase().localeCompare(b.title!.toLowerCase()),
  // Known issue: `||` binds looser than `-`, so this is not a numeric diff.
  'voted-yes': (a, b) => b.resource?.yes || 0 - Number(a.resource?.yes) || 0,
  'voted-no': (a, b) => b.resource?.no || 0 - Number(a.resource?.no) || 0,
  name: (a, b) => a.name!.toLowerCase().localeCompare(b.name!.toLowerCase()),
  url: (a, b) => a.name!.toLowerCase().localeCompare(b.name!.toLowerCase()),
  email: (a, b) => {
    let aEmail = a?.email || '';
    let bEmail = b?.email || '';
    return aEmail.toLowerCase().localeCompare(bEmail.toLowerCase());
  },
  postcode: (a, b) => {
    let aPostcode = a?.postcode || '';
    let bPostcode = b?.postcode || '';
    return aPostcode.toLowerCase().localeCompare(bPostcode.toLowerCase());
  },
  code: (a, b) => Number(b.code) - Number(a.code),
  ip: (a, b) => Number(b.ip) - Number(a.ip),
  userId: (a, b) => Number(b.userId) - Number(a.userId),
  endDate: (a, b) =>
    new Date(b.config?.project?.endDate).getTime() -
    new Date(a.config?.project?.endDate).getTime(),
  votesIsActive: (a, b) =>
    (b.config!.votes.isActive ? 1 : -1) - (a.config!.votes.isActive ? 1 : -1),
  commentsIsActive: (a, b) =>
    (b.config!.comments.canComment ? 1 : -1) -
    (a.config!.comments.canComment ? 1 : -1),
  addToNewResources: (a, b) =>
    (b.addToNewResources ? 1 : -1) - (a.addToNewResources ? 1 : -1),
  canLike: (a, b) =>
    (b.extraFunctionality?.canLike ? 1 : -1) -
    (a.extraFunctionality?.canLike ? 1 : -1),
  score: (a, b) => Number(b.score) - Number(a.score),
};

export const sortTable = <T extends SortableRow>(
  sortType: string,
  el: React.MouseEvent<HTMLElement, MouseEvent>,
  data: T[] | undefined = []
): T[] => {
  const sortFunction = sortFunctions[sortType];
  if (!sortFunction) {
    return data;
  }
  const filterButtons = document.querySelectorAll('.filter-button');
  filterButtons.forEach((button) => button.classList.remove('font-bold'));
  filterButtons.forEach((button) => button.classList.remove('text-black'));

  el.currentTarget.classList.toggle('--up');
  el.currentTarget.classList.add('font-bold');
  el.currentTarget.classList.add('text-black');

  const direction = el.currentTarget.classList.contains('--up') ? 'up' : 'down';

  const sortedWidgets = [...data].sort((a, b) => {
    const result = sortFunction(a, b);
    return direction === 'up' ? result : -result;
  });

  return sortedWidgets;
};

export const searchTable = (
  setData: Function,
  type?: string,
  delay: number = 250
) => {
  let timerId: NodeJS.Timeout;
  const debouncedSearchTable = <T extends object>(
    searchTerm: string,
    data: T[] = [],
    originalData: T[] = []
  ) => {
    clearTimeout(timerId);
    timerId = setTimeout(() => {
      if (searchTerm.length >= 1) {
        const searchResult = data.filter((item) => {
          if (type) {
            const value = (item as Record<string, unknown>)[type];
            return String(value || '')
              .toLowerCase()
              .includes(searchTerm.toLowerCase());
          } else {
            return Object.values(item).some((val) =>
              String(val || '')
                .toLowerCase()
                .includes(searchTerm.toLowerCase())
            );
          }
        });
        setData(searchResult);
      } else {
        setData(originalData);
      }
    }, delay);
  };

  return debouncedSearchTable;
};
