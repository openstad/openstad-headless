type AreaLike = {
    id?: string | number;
    polygon?: any;
    hidePolygon?: boolean;
};
export declare const toSafeAreas: (areas: unknown) => AreaLike[];
export declare const resolveMapPolygons: ({ areas, areaId, allowedPolygonIds, showHiddenPolygonsForAdmin, }: {
    areas: unknown;
    areaId?: string | number;
    allowedPolygonIds: number[];
    showHiddenPolygonsForAdmin?: boolean;
}) => {
    safeAreas: AreaLike[];
    hasAllowedPolygons: boolean;
    projectArea: AreaLike | undefined;
    polygon: any[];
    renderPolygon: any[];
    adminOnlyPolygons: AreaLike[];
    hasHiddenAdminPolygons: boolean;
};
export declare const getTargetAreaIds: ({ hasAllowedPolygons, allowedPolygonIds, areaId, }: {
    hasAllowedPolygons: boolean;
    allowedPolygonIds: number[];
    areaId?: string | number;
}) => number[];
export {};
