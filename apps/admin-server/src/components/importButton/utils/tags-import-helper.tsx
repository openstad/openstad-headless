export async function getOrCreateTag(
  tagName: string,
  tagType: string,
  seqnr: number,
  existingTags: any[],
  createTagFn: (name: string, type: string, seqnr: number, addToNewResources: boolean) => Promise<any>
): Promise<number> {
  // Case-insensitive matching on both name AND type
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

  // Find highest seqnr across ALL tags
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