export async function getOrCreateTag(
  tagName: string,
  tagType: string,
  seqnr: number,
  existingTags: any[],
  createTagFn: (name: string, type: string, seqnr: number, addToNewResources: boolean) => Promise<any>
): Promise<number> {
  const existing = existingTags.find(
    (t: any) => 
      t.name.toLowerCase() === tagName.toLowerCase() && 
      t.type.toLowerCase() === tagType.toLowerCase()
  )
  
  if (existing) {
    return existing.id
  }
  
  const newTag = await createTagFn(tagName, tagType, seqnr, false)
  return newTag.id
}

export async function processTags(
  value: any,
  existingTags: any[],
  createTagFn: (name: string, type: string, seqnr: number, addToNewResources: boolean) => Promise<any>
): Promise<number[]> {
  const tagIds: number[] = []
  
  const tagsObject = value['tags.*']
  
  if (!tagsObject || typeof tagsObject !== 'object') {
    return []
  }

  // Find highest seqnr across all tags
  const maxSeqnr = existingTags.length > 0
    ? Math.max(...existingTags.map((t: any) => t.seqnr || 0))
    : 0

  for (const tagType of Object.keys(tagsObject)) {
    const tagValue = tagsObject[tagType]
    
    if (!tagValue || typeof tagValue !== 'string') {
      continue
    }
    
    const tagNames = tagValue
      .trim()
      .split('|')
      .map((name: string) => name.trim())
      .filter((name: string) => name.length > 0)
    
    for (let i = 0; i < tagNames.length; i++) {
      const tagId = await getOrCreateTag(
        tagNames[i],
        tagType,
        maxSeqnr + (i + 1),
        existingTags,
        createTagFn
      )
      tagIds.push(tagId)
    }
  }
  
  delete value['tags.*']
  
  return tagIds
}

export function extractUniqueTags(values: any[]): Map<string, Set<string>> {
  const unique = new Map<string, Set<string>>();
  
  values.forEach(row => {
    const tagsObject = row['tags.*'];
    if (tagsObject && typeof tagsObject === 'object') {
      Object.entries(tagsObject).forEach(([type, value]) => {
        if (!unique.has(type)) {
          unique.set(type, new Set());
        }
        const names = String(value).trim().split('|').map((n: string) => n.trim());
        names.forEach(n => n && unique.get(type)!.add(n));
      });
    }
  });
  
  return unique;
}

export async function prepareTags(
  uniqueTags: Map<string, Set<string>>,
  existingTags: any[],
  createTagFn: (name: string, type: string, seqnr: number, addToNewResources: boolean) => Promise<any>
): Promise<Map<string, number>> {
  const mapping = new Map<string, number>();
  const maxSeqnr = existingTags.length > 0
    ? Math.max(...existingTags.map((t: any) => t.seqnr || 0))
    : 0;
  
  let index = 1;
  for (const [type, names] of Array.from(uniqueTags)) {
    for (const name of Array.from(names)) {
      const tagId = await getOrCreateTag(name, type, maxSeqnr + index, existingTags, createTagFn);
      mapping.set(`${type.toLowerCase()}.${name.toLowerCase()}`, tagId);
      index++;
    }
  }
  
  return mapping;
}