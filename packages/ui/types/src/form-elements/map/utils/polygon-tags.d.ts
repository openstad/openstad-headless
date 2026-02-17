type AreaLike = {
  id?: string | number;
  polygon?: any;
  tags?: any[];
  outsideTags?: any[];
};
export declare const resolvePolygonTags: ({
  enablePolygonTags,
  location,
  safeAreas,
  targetAreaIds,
  isPointInArea,
}: {
  enablePolygonTags: boolean | undefined;
  location?: {
    lat?: number;
    lng?: number;
  };
  safeAreas: AreaLike[];
  targetAreaIds: number[];
  isPointInArea: (polygon: any, location: any) => boolean;
}) => number[];
export {};
