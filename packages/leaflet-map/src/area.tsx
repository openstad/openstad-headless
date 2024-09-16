import DataStore from '@openstad-headless/data-store/src';
import React from 'react';
import { useState, useEffect } from 'react';
import { LatLng } from 'leaflet';
import { Polygon, Popup } from 'react-leaflet';
import type { AreaProps } from './types/area-props';

import { difference, polygon as tPolygon } from 'turf';

function createCutoutPolygonMulti(areas: any) {
  const outerBox = tPolygon([[
    [-180, -90],
    [180, -90],
    [180, 90],
    [-180, 90],
    [-180, -90]
  ]]);

  let cutoutPolygon = outerBox;

  areas.forEach((area: any) => {
    const innerPolygon = tPolygon([area.map(({ lat, lng }: { lat: number, lng: number }) => [lng, lat])]);
    cutoutPolygon = difference(cutoutPolygon, innerPolygon) || cutoutPolygon;
  });

  return cutoutPolygon.geometry.coordinates;
}

export function isPointInArea(area: Array<Array<LatLng>> | Array<LatLng>, point: LatLng) {
  if (!point) return false;
  if (!area) return true;

  if (Array.isArray(area[0])) {
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
  ...props
}: AreaProps) {
  const datastore = new DataStore({});
  const { data: allAreas } = datastore.useAreas();

  interface Area {
    id: number;
    name: string;
    url: string;
  }

  const [poly, setPoly] = useState<any>([]);

  useEffect(() => {
    if (area && area.length > 0) {
      let validPolygons: LatLng[][] = [];

      if (Array.isArray(area[0])) {
        validPolygons = area.map((polygon: any) =>
          polygon.map(({ lat, lng }: { lat: number, lng: number }) => ({ lat, lng }))
        );
      } else {
        validPolygons = [area.map(({ lat, lng }) => new LatLng(lat, lng))];
      }

      const cutout = createCutoutPolygonMulti(validPolygons);

      setPoly(cutout);
    }
  }, [area]);

  const multiPolygon: any[] = [];
  const areaIds = areas?.map((item: Area) => item.id);
  const filteredAreas = allAreas.filter((item: any) => areaIds?.includes(item.id));

  if (filteredAreas) {
    filteredAreas.forEach((item: any) => {
      multiPolygon.push({ title: item.name, polygon: item.polygon });
    });
    areas.forEach((item: any) => {
      const existingItem = multiPolygon.find((polygonItem) => polygonItem.title === item.name);
      if (existingItem) {
        existingItem.url = item.url;
      }
    });
  }



  return (
    <>
      {multiPolygon.length > 0 ? (
        multiPolygon.map((item, index) => (
          <>
            <Polygon
              key={index}
              {...props}
              pathOptions={areaPolygonStyle}
              positions={item.polygon}
              eventHandlers={{
                mouseover: (e) => {
                  e.target.setStyle({
                    fillOpacity: 0.05,
                  });
                },
                mouseout: (e) => {
                  e.target.setStyle(areaPolygonStyle);
                },
              }}
            >
              {item.title &&
                <>
                  <Popup className={'leaflet-popup'}>
                    {item.title && <h3 className="utrecht-heading-3">{item.title}</h3>}
                    {item.url && <a className="utrecht-button-link utrecht-button-link--html-a utrecht-button-link--primary-action" href={item.url}>Lees verder</a>}
                  </Popup>
                </>
              }
            </Polygon>

          </>
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
    </>
  );
}

export default Area;
