import type { FieldWithOptionalFields } from '../props';

type PaginationInput = {
  fields: Array<FieldWithOptionalFields>;
  routingKeys: string[];
  routingHiddenFields: string[];
  totalPages?: number;
  pageFieldStartPositions?: number[];
  pageFieldEndPositions?: number[];
  currentPage?: any;
};

export type EffectivePagination = {
  effectiveTotalPages?: number;
  effectiveStartPositions?: number[];
  effectiveEndPositions?: number[];
  effectiveCurrentPage: any;
};

export const computeEffectivePagination = ({
  fields,
  routingKeys,
  routingHiddenFields,
  totalPages,
  pageFieldStartPositions,
  pageFieldEndPositions,
  currentPage,
}: PaginationInput): EffectivePagination => {
  const paginationPositions = fields
    .map((field, idx) => {
      if (field.type !== 'pagination') return -1;
      const rKey = routingKeys[idx];
      if (rKey && routingHiddenFields.includes(rKey)) return -1;
      return idx;
    })
    .filter((idx) => idx !== -1);

  const effectiveTotalPages =
    typeof totalPages === 'number'
      ? paginationPositions.length + 1
      : totalPages;

  const effectiveStartPositions = pageFieldStartPositions
    ? [0, ...paginationPositions.map((idx) => idx + 1)]
    : pageFieldStartPositions;

  const effectiveEndPositions = pageFieldEndPositions
    ? [...paginationPositions, fields.length]
    : pageFieldEndPositions;

  const effectiveCurrentPage =
    typeof currentPage === 'number' && typeof effectiveTotalPages === 'number'
      ? Math.min(currentPage, effectiveTotalPages - 1)
      : currentPage;

  return {
    effectiveTotalPages,
    effectiveStartPositions,
    effectiveEndPositions,
    effectiveCurrentPage,
  };
};
