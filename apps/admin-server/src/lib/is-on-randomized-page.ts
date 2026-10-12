type PageItem = {
  id?: string;
  questionType?: string;
  randomizeQuestions?: boolean;
};

export function isOnRandomizedPage(
  items: PageItem[],
  itemId: string | null
): boolean {
  const position = itemId
    ? items.findIndex((item) => item.id === itemId)
    : items.length;
  const end = position === -1 ? items.length : position;

  for (let index = end - 1; index >= 0; index--) {
    if (items[index].questionType === 'pagination') {
      return items[index].randomizeQuestions === true;
    }
  }

  return false;
}
