type StatusWithLikeSetting = {
  extraFunctionality?: {
    canLike?: boolean;
  };
};

type ResourceWithStatuses = {
  statuses?: Array<StatusWithLikeSetting>;
};

export function canLikeResource(resource?: ResourceWithStatuses | null): boolean {
  if (!Array.isArray(resource?.statuses)) return true;

  return !resource.statuses.some(
    (status) => status?.extraFunctionality?.canLike === false
  );
}
