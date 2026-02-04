type AreaLike = {
    id?: string | number;
    polygon?: any;
    hidePolygon?: boolean;
};

export const toSafeAreas = (areas: unknown): AreaLike[] =>
    Array.isArray(areas) ? (areas as AreaLike[]) : [];

const normalizePolygon = (polygon: any) => {
    if (!Array.isArray(polygon) || polygon.length === 0) return [];
    const first = polygon[0];
    if (first && typeof first.lat === 'number' && typeof first.lng === 'number') {
        return [polygon];
    }
    return polygon;
};

const pickPolygons = (list: AreaLike[]) =>
    list.flatMap((area) => {
        const normalized = normalizePolygon(area?.polygon);
        return Array.isArray(normalized) && normalized.length ? [normalized] : [];
    });

export const resolveMapPolygons = ({
    areas,
    areaId,
    allowedPolygonIds,
    showHiddenPolygonsForAdmin = false,
}: {
    areas: unknown;
    areaId?: string | number;
    allowedPolygonIds: number[];
    showHiddenPolygonsForAdmin?: boolean;
}) => {
    const safeAreas = toSafeAreas(areas);
    const hasAllowedPolygons = allowedPolygonIds.length > 0;

    const allowedAreas = hasAllowedPolygons
        ? safeAreas.filter((area) => allowedPolygonIds.includes(Number(area.id)))
        : [];
    const projectArea = areaId
        ? safeAreas.find((area) => area.id?.toString() === areaId)
        : undefined;
    const projectPolygon = normalizePolygon(projectArea?.polygon || []);
    const isVisible = (area: AreaLike | undefined) =>
        !area || showHiddenPolygonsForAdmin || area.hidePolygon !== true;
    const projectPolygonVisible =
        projectPolygon.length > 0 && isVisible(projectArea);

    const visibleAllowedAreas = allowedAreas.filter((area) => area.hidePolygon !== true);
    const allAllowedPolygons = pickPolygons(allowedAreas);
    const visibleAllowedPolygons = pickPolygons(visibleAllowedAreas);
    const visibleProjectPolygon = projectPolygonVisible ? projectPolygon : [];

    const polygon = hasAllowedPolygons
        ? (showHiddenPolygonsForAdmin ? allAllowedPolygons : visibleAllowedPolygons)
        : (showHiddenPolygonsForAdmin ? projectPolygon : visibleProjectPolygon);
    const renderPolygon = hasAllowedPolygons
        ? visibleAllowedPolygons
        : visibleProjectPolygon;

    const adminPolygons = hasAllowedPolygons
        ? allowedAreas
        : projectArea
            ? [projectArea]
            : [];
    const hasHiddenAdminPolygons = adminPolygons.some((area) => area?.hidePolygon === true);

    return {
        safeAreas,
        hasAllowedPolygons,
        projectArea,
        polygon,
        renderPolygon,
        adminOnlyPolygons: adminPolygons,
        hasHiddenAdminPolygons,
    };
};

export const getTargetAreaIds = ({
    hasAllowedPolygons,
    allowedPolygonIds,
    areaId,
}: {
    hasAllowedPolygons: boolean;
    allowedPolygonIds: number[];
    areaId?: string | number;
}) => (hasAllowedPolygons ? allowedPolygonIds : areaId ? [Number(areaId)] : []);
