import DataStore from '@openstad-headless/data-store/src';
import React from 'react';
import { useState, useEffect } from 'react';
import { LatLng } from 'leaflet';
import { Polygon, Popup, Tooltip } from 'react-leaflet';
import type { AreaProps } from './types/area-props';

import { difference, polygon as tPolygon } from 'turf';
import { BaseProps } from '@openstad-headless/types/base-props';

function createCutoutPolygonMulti(areas: any) {
  const outerBoxCoordinates = [
    [-180, -90],
    [180, -90],
    [180, 90],
    [-180, 90],
    [-180, -90]
  ];

  const outerBox = tPolygon([outerBoxCoordinates]);

  let cutOutCoordinates = [outerBoxCoordinates];

  areas.forEach((area: any) => {
    const innerPolygon = tPolygon([area.map(({ lat, lng }: { lat: number, lng: number }) => [lng, lat])]);
    const newCutOut = difference(outerBox, innerPolygon) || outerBox;

    if (newCutOut?.geometry?.coordinates && newCutOut?.geometry?.coordinates.length > 1) {
      cutOutCoordinates.push(newCutOut?.geometry?.coordinates[1]);
    }
  });

  return cutOutCoordinates;
}

const isMultiPolygon = (
  value: Array<LatLng> | Array<Array<LatLng>>
): value is Array<Array<LatLng>> => Array.isArray(value[0]);

export function isPointInArea(area: Array<Array<LatLng>> | Array<LatLng>, point: LatLng) {
  if (!point) return false;
  if (!area) return true;

  if (isMultiPolygon(area)) {
    for (let poly of area) {
      if (isPointInSinglePolygon(Array.isArray(poly) ? poly : [poly], point)) {
        return true;
      }
    }
    return false;
  } else {
    return isPointInSinglePolygon(area as Array<LatLng>, point);
  }
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

  useEffect(() => {
    if (areaRenderMode !== 'cutout') {
      setPoly([]);
      return;
    }

    if (area && area.length > 0) {
      let validPolygons: LatLng[][] = [];

      if (isMultiPolygon(area)) {
        validPolygons = area.map((polygon) =>
          polygon.map((point) => new LatLng(point.lat, point.lng))
        );
      } else {
        validPolygons = [area.map((point) => new LatLng(point.lat, point.lng))];
      }

      const cutout = createCutoutPolygonMulti(validPolygons);

      setPoly(cutout);
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
      ) : areaRenderMode === 'polygons' ? (
        (isMultiPolygon(area) ? area : [area]).map((polygon, index) => (
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
