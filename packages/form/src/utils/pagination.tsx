import type { FieldWithOptionalFields } from '../props';

type PaginationInput = {
  fields: Array<FieldWithOptionalFields>;
  routingKeys: string[];
  routingHiddenFields: string[];
  totalPages?: number;
  pageFieldStartPositions?: number[];
  pageFieldEndPositions?: number[];
  currentPage?: any;
  submitText: string;
  prevPageText?: string;
};

export type EffectivePagination = {
  effectiveTotalPages?: number;
  effectiveStartPositions?: number[];
  effectiveEndPositions?: number[];
  effectiveCurrentPage: any;
  effectiveSubmitText: string;
  effectivePrevPageText?: string;
  lastFieldIsYouthOutro: boolean;
};

export const computeEffectivePagination = ({
  fields,
  routingKeys,
  routingHiddenFields,
  totalPages,
  pageFieldStartPositions,
  pageFieldEndPositions,
  currentPage,
  submitText,
  prevPageText,
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

  // Derive button labels from visible pagination fields
  const lastField = fields[fields.length - 1];
  const lastFieldIsYouthOutro =
    lastField?.type === 'none' &&
    (lastField as any)?.infoBlockStyle === 'youth-outro';

  let effectiveSubmitText = submitText;
  let effectivePrevPageText = prevPageText;

  if (
    typeof effectiveTotalPages === 'number' &&
    paginationPositions.length > 0
  ) {
    const visiblePagFields = paginationPositions.map((idx) => fields[idx]);
    const currentPagField = visiblePagFields[effectiveCurrentPage] as any;

    const isLastPage = effectiveCurrentPage === effectiveTotalPages - 1;
    const isSecondToLast = effectiveCurrentPage === effectiveTotalPages - 2;
    const isSubmitPage =
      isLastPage || (isSecondToLast && lastFieldIsYouthOutro);

    if (!isSubmitPage) {
      effectiveSubmitText = currentPagField?.nextPageText || 'Volgende';
    }
    effectivePrevPageText = currentPagField?.prevPageText || prevPageText;
  }

  return {
    effectiveTotalPages,
    effectiveStartPositions,
    effectiveEndPositions,
    effectiveCurrentPage,
    effectiveSubmitText,
    effectivePrevPageText,
    lastFieldIsYouthOutro,
  };
};
