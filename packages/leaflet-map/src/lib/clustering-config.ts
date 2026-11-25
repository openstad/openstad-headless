import type { MarkerProps } from '../types/marker-props';

const CLUSTER_RADIUS_BY_LEVEL: Record<string, number> = {
  low: 20,
  medium: 40,
  high: 80,
};

export type ClusteringConfig = {
  isActive: boolean;
  maxClusterRadius?: number;
};

export function getClusteringConfig(map?: {
  clustering?: string;
}): ClusteringConfig {
  const level = map?.clustering;
  if (
    typeof level === 'string' &&
    Object.prototype.hasOwnProperty.call(CLUSTER_RADIUS_BY_LEVEL, level)
  ) {
    return { isActive: true, maxClusterRadius: CLUSTER_RADIUS_BY_LEVEL[level] };
  }
  return { isActive: false };
}

export function shouldClusterMarker(
  marker: Pick<MarkerProps, 'doNotCluster'>,
  clustering?: { isActive?: boolean }
): boolean {
  return !!clustering?.isActive && !marker.doNotCluster;
}

export function shouldRenderClusterGroup(
  clusterMarkerCount: number,
  markerSetMarkerCount: number,
  isActive: boolean
): boolean {
  return isActive && clusterMarkerCount + markerSetMarkerCount > 0;
}

export const MAX_SUPPORTED_ZOOM = 25;
export const DEFAULT_MAX_ZOOM = 20;

export function getEffectiveMaxZoom(maxZoom?: number | string | null): number {
  const value = typeof maxZoom === 'number' ? maxZoom : Number(maxZoom);
  if (!Number.isFinite(value) || value <= 0) return DEFAULT_MAX_ZOOM;
  return Math.min(value, MAX_SUPPORTED_ZOOM);
}

export function disableClusterPanOnFocus(leaflet: any): boolean {
  const MarkerCluster = leaflet?.MarkerCluster;
  if (!MarkerCluster || typeof MarkerCluster.mergeOptions !== 'function') {
    return false;
  }
  MarkerCluster.mergeOptions({ autoPanOnFocus: false });
  return true;
}
