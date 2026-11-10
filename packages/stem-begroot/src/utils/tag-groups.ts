type TagWithType = { id: number; type: string };

export function buildTagGroups({
  allTags,
  selectedTagIds,
  filterBehavior,
  perTagTabActive,
}: {
  allTags: TagWithType[];
  selectedTagIds: number[];
  filterBehavior?: string;
  perTagTabActive: boolean;
}): number[][] {
  if (filterBehavior !== 'and' || selectedTagIds.length === 0) return [];
  if (perTagTabActive) return [];

  const tagIdsByType: { [type: string]: number[] } = {};
  allTags.forEach((tag) => {
    if (!tagIdsByType[tag.type]) {
      tagIdsByType[tag.type] = [];
    }
    tagIdsByType[tag.type].push(tag.id);
  });

  const groups: number[][] = [];
  Object.keys(tagIdsByType).forEach((tagType) => {
    const selectedOfType = selectedTagIds.filter((tagId) =>
      tagIdsByType[tagType].includes(tagId)
    );
    if (selectedOfType.length > 0) {
      groups.push(selectedOfType);
    }
  });
  return groups;
}
