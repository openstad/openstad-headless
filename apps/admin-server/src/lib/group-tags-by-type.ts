export type FilterTag = { id: number; name: string; type?: string | null };
export type TagGroup = { type: string; tags: Array<FilterTag> };

export function groupTagsByType(
  tags: Array<FilterTag>,
  query: string
): Array<TagGroup> {
  const normalizedQuery = query.trim().toLowerCase();
  const groups = new Map<string, Array<FilterTag>>();
  for (const tag of tags) {
    const type = tag.type || 'Zonder type';
    if (
      normalizedQuery &&
      !`${tag.name} ${type}`.toLowerCase().includes(normalizedQuery)
    ) {
      continue;
    }
    groups.set(type, [...(groups.get(type) || []), tag]);
  }
  return Array.from(groups.entries())
    .sort(([a], [b]) => a.localeCompare(b, 'nl'))
    .map(([type, groupTags]) => ({
      type,
      tags: [...groupTags].sort((a, b) => a.name.localeCompare(b.name, 'nl')),
    }));
}
