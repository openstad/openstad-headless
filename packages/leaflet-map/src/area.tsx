import DataStore from '@openstad-headless/data-store/src';
import React from 'react';
import { useState, useEffect } from 'react';
import { LatLng } from 'leaflet';
import { Polygon, Popup, Tooltip } from 'react-leaflet';
import type { AreaProps, AreaShape, AreaRing, AreaPolygon, AreaMultiPolygon } from './types/area-props';

import { difference, polygon as tPolygon } from 'turf';
import { BaseProps } from '@openstad-headless/types/base-props';

type LatLngLike = { lat: number; lng: number };

const isLatLngLike = (value: any): value is LatLngLike =>
  !!value && typeof value.lat === 'number' && typeof value.lng === 'number';

const isRing = (value: unknown): value is AreaRing =>
  Array.isArray(value) && value.length > 0 && isLatLngLike((value as AreaRing)[0]);

const isPolygonWithRings = (value: unknown): value is AreaPolygon =>
  Array.isArray(value) && value.length > 0 && isRing((value as AreaPolygon)[0]);

const isMultiPolygonWithRings = (value: unknown): value is AreaMultiPolygon =>
  Array.isArray(value) &&
  value.length > 0 &&
  Array.isArray((value as AreaMultiPolygon)[0]) &&
  isRing((value as AreaMultiPolygon)[0][0]);

const isMultiPolygonMixed = (value: unknown): value is AreaMultiPolygon => {
  if (!Array.isArray(value) || value.length === 0) return false;
  return (value as unknown[]).every((entry) => isRing(entry) || isPolygonWithRings(entry));
};

const normalizeAreaToPolygons = (area?: AreaShape): AreaMultiPolygon => {
  if (!area || !Array.isArray(area) || area.length === 0) return [];
  if (isRing(area)) return [[area]];
  if (isMultiPolygonWithRings(area)) return area as AreaMultiPolygon;
  if (isMultiPolygonMixed(area)) {
    return (area as unknown[]).map((entry) => (isRing(entry) ? [entry] : (entry as AreaPolygon)));
  }
  if (isPolygonWithRings(area)) return [area as AreaPolygon];
  return [];
};

function createCutoutPolygonMulti(areas: AreaMultiPolygon) {
  const outerBoxCoordinates = [
    [-180, -90],
    [180, -90],
    [180, 90],
    [-180, 90],
    [-180, -90]
  ];

  const outerBox = tPolygon([outerBoxCoordinates]);

  let cutOutCoordinates = [outerBoxCoordinates];

  areas.forEach((area) => {
    // Filter out invalid rings (must have at least 4 points for a valid LinearRing)
    const rings = area
      .map((ring) => ring.map(({ lat, lng }) => [lng, lat]))
      .filter((ring) => ring.length >= 4);

    // Skip if no valid rings remain (need at least outer boundary)
    if (rings.length === 0) return;

    try {
      const innerPolygon = tPolygon(rings);
      const newCutOut = difference(outerBox, innerPolygon) || outerBox;

      if (newCutOut?.geometry?.coordinates && newCutOut?.geometry?.coordinates.length > 1) {
        cutOutCoordinates.push(newCutOut?.geometry?.coordinates[1]);
      }
    } catch (error) {
      console.warn('Failed to create cutout for polygon, skipping:', error);
    }
  });

  return cutOutCoordinates;
}

export function isPointInArea(area: AreaShape, point: LatLng) {
  if (!point) return false;
  if (!area) return true;

  const polygons = normalizeAreaToPolygons(area);
  for (let polygon of polygons) {
    if (polygon.length === 0) continue;
    const outerRing = polygon[0];
    if (!isPointInSinglePolygon(outerRing, point)) continue;

    if (polygon.length === 1) return true;

    const inHole = polygon.slice(1).some((ring) => isPointInSinglePolygon(ring, point));
    if (!inHole) return true;
  }

  return false;
}

function isPointInSinglePolygon(area: Array<LatLng>, point: LatLng) {
  let x = point.lat,
    y = point.lng;

  let inside = false;
  for (let i = 0, j = area.length - 1; i < area.length; j = i++) {
    let xi = area[i].lat,
      yi = area[i].lng;
    let xj = area[j].lat,
      yj = area[j].lng;

    let intersect =
      yi > y != yj > y && x < ((xj - xi) * (y - yi)) / (yj - yi) + xi;
    if (intersect) inside = !inside;
  }

  return inside;
}
export function Area({
  area = [],
  areas,
  areaPolygonStyle = {
    color: '#d00',
    fillColor: '#000',
    fillOpacity: 0.15,
  },
  interactionType = 'default',
  areaRenderMode = 'cutout',
  showHiddenPolygonsForAdmin = false,
  ...props
}: BaseProps & AreaProps) {
  const datastore = new DataStore({});
  const { data: allAreas } = datastore.useArea({
    projectId: props.projectId
  });

  interface Area {
    id: number;
    name: string;
    url: string;
  }

  const [poly, setPoly] = useState<any>([]);
  const [cutoutFailed, setCutoutFailed] = useState(false);

  useEffect(() => {
    if (areaRenderMode !== 'cutout') {
      setPoly([]);
      setCutoutFailed(false);
      return;
    }

    const polygons = normalizeAreaToPolygons(area);
    if (polygons.length === 0) return;

    const latLngPolygons = polygons.map((polygon) =>
      polygon.map((ring) => ring.map((point) => new LatLng(point.lat, point.lng)))
    );

    try {
      const cutout = createCutoutPolygonMulti(latLngPolygons);
      setPoly(cutout);
      setCutoutFailed(false);
    } catch (error) {
      console.warn('Failed to create cutout polygon, falling back to polygon render.', error);
      setPoly(null);
      setCutoutFailed(true);
    }
  }, [area, areaRenderMode]);

  const multiPolygon: any[] = [];
  const areaIds = areas?.map((item: Area) => item.id);
  const safeAllAreas = Array.isArray(allAreas) ? allAreas : [];
  const filteredAreas = safeAllAreas.filter((item: any) => areaIds?.includes(item.id));

  filteredAreas.forEach((item: any) => {
    multiPolygon.push({ title: item.name, polygon: item.polygon, hidePolygon: item.hidePolygon });
  });
  areas?.forEach((item: any) => {
    const existingItem = multiPolygon.find((polygonItem) => polygonItem.title === item.name);
    if (existingItem) {
      existingItem.url = item.url;
    }
  });

  const hiddenOverlayStyle = {
    ...areaPolygonStyle,
    color: '#ff0000',
    fillColor: '#ff7070',
    fillOpacity: 0.3,
    dashArray: '6 6',
  };

  const visiblePolygons = multiPolygon.filter((item) => item.hidePolygon !== true);
  const hiddenPolygons = multiPolygon.filter((item) => item.hidePolygon === true);
  const hiddenOverlays = showHiddenPolygonsForAdmin ? hiddenPolygons : [];

  return (
    <>
      {multiPolygon.length > 0 ? (
        visiblePolygons.map((item, index) => (
          <Polygon
            key={index}
            {...props}
            pathOptions={areaPolygonStyle}
            positions={item.polygon}
            eventHandlers={
              interactionType !== 'direct'
                ? {
                  mouseover: (e) => {
                    e.target.setStyle({
                      fillOpacity: 0.05,
                    });
                  },
                  mouseout: (e) => {
                    e.target.setStyle(areaPolygonStyle);
                  },
                }
                : {
                  click: () => {
                    if (item.url) window.open(item.url, '_self');
                  },
                }
            }
          >
            {(item.title && interactionType !== 'direct') ? (
              <Popup className={'leaflet-popup'}>
                {item.title && <h3 className="utrecht-heading-3">{item.title}</h3>}
                {item.url && <a className="pop-up-link" href={item.url}>Lees verder</a>}
              </Popup>
            ) : (
              <Tooltip permanent direction="center">
                <span
                  onClick={() => {
                    if (item.url) window.open(item.url, '_self');
                  }}
                >
                  {item.title}
                </span>
              </Tooltip>
            )}
          </Polygon>
        ))
      ) : areaRenderMode === 'polygons' || (areaRenderMode === 'cutout' && cutoutFailed) ? (
        normalizeAreaToPolygons(area).map((polygon, index) => (
          <Polygon
            key={`area-${index}`}
            {...props}
            pathOptions={areaPolygonStyle}
            positions={polygon}
          />
        ))
      ) : (
        poly && (
          <Polygon
            {...props}
            positions={poly.map((ring: any) => ring?.map(([lng, lat]: [number, number]) => [lat, lng]))}
            pathOptions={areaPolygonStyle}
          />
        )
      )}
      {hiddenOverlays.map((item, index) => (
        <Polygon
          key={`hidden-${index}`}
          {...props}
          pathOptions={hiddenOverlayStyle}
          positions={item.polygon}
        >
        </Polygon>
      ))}
    </>
  );
}

export default Area;
