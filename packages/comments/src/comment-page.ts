type CommentWithId = { id?: number | string };

export function getCommentPage(
  comments: CommentWithId[] | undefined | null,
  commentId: number | string,
  itemsPerPage: number
): number | undefined {
  const perPage = Number(itemsPerPage);
  if (!Array.isArray(comments) || !Number.isFinite(perPage) || perPage < 1) {
    return undefined;
  }

  const targetId = parseInt(String(commentId), 10);
  if (isNaN(targetId)) return undefined;

  const index = comments.findIndex(
    (comment) => parseInt(String(comment?.id), 10) === targetId
  );
  if (index < 0) return undefined;

  return Math.floor(index / perPage);
}
