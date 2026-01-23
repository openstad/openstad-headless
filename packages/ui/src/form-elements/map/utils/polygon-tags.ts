type AreaLike = {
    id?: string | number;
    polygon?: any;
    tags?: any[];
};

export const resolvePolygonTags = ({
    enablePolygonTags,
    location,
    safeAreas,
    targetAreaIds,
    isPointInArea,
}: {
    enablePolygonTags: boolean | undefined;
    location?: { lat?: number; lng?: number };
    safeAreas: AreaLike[];
    targetAreaIds: number[];
    isPointInArea: (polygon: any, location: any) => boolean;
}) => {
    if (!enablePolygonTags) return [];
    if (location?.lat == null || location?.lng == null) return [];
    if (targetAreaIds.length === 0) return [];

    const tagIds = safeAreas.reduce<number[]>((acc, area: any) => {
        if (!targetAreaIds.includes(Number(area.id))) return acc;
        if (!Array.isArray(area?.polygon) || !Array.isArray(area?.tags)) return acc;
        if (isPointInArea(area.polygon, location as any)) {
            area.tags.forEach((tag: any) => acc.push(tag.id));
        }
        return acc;
    }, []);

    return Array.from(new Set(tagIds));
};
