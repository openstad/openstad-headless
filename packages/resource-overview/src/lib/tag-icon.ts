export function tagIcon(
  tag: { listIcon?: string; mapIcon?: string } | null | undefined
): string | false {
  if (!tag) return false;
  return tag.listIcon || tag.mapIcon || false;
}
