import DataStore from '@openstad-headless/data-store/src';
import React from 'react';
import { useState, useEffect } from 'react';
import { LatLng, polygon } from 'leaflet';
import { Polygon, Popup } from 'react-leaflet';
import type { AreaProps } from './types/area-props';
import type { LocationType } from './types/location';
import parseLocation from './lib/parse-location';

function createCutoutPolygon(area: Array<LocationType>, invert = true) {
  // polygon must defined from the south west corner to work with the outer box

  const extractedAreas = area.map(parseLocation);
  let bounds = polygon(extractedAreas).getBounds();
  let center = bounds.getCenter();

  let smallest = 0;
  let index = 0;

  extractedAreas.forEach(function (point, i: number) {
    let y = Math.sin(point.lng - center.lng) * Math.cos(point.lat);
    let x =
      Math.cos(center.lat) * Math.sin(point.lat) -
      Math.sin(center.lat) *
      Math.cos(point.lat) *
      Math.cos(point.lng - center.lng);
    let bearing = (Math.atan2(y, x) * 180) / Math.PI;
    if (45 - bearing < smallest) {
      smallest = 45 - bearing;
      index = i;
    }
  });

  let a = area.slice(0, index);
  let b = area.slice(index, area.length);
  area = b.concat(a);

  // outer box
  // TODO: should be calculated dynamically from the center point
  let delta1: number = 0.01;
  let delta2: number = 5;
  let outerBox: Array<LocationType> = [
    { lat: -90 + delta2, lng: -180 + delta1 },
    { lat: -90 + delta2, lng: 0 },
    { lat: -90 + delta2, lng: 180 - delta1 },
    { lat: 0, lng: 180 - delta1 },
    { lat: 90 - delta2, lng: 180 - delta1 },
    { lat: 90 - delta2, lng: 0 },
    { lat: 90 - delta2, lng: -180 + delta1 },
    { lat: 90 - delta2, lng: -180 + delta1 },
    { lat: 0, lng: -180 + delta1 },
  ];

  let result: any;

  if (invert) {
    result = [
      outerBox.map((obj) => [obj.lat, obj.lng]),
      area.map((obj) => [obj.lat, obj.lng]),
    ];

  } else {
    result = [
      area.map((obj) => [obj.lat, obj.lng]),
    ];

  }


  return result;
}

export function isPointInArea(area: Array<LatLng>, point: LatLng) {
  if (!point) return false;
  if (!area) return true;

  // taken from http://pietschsoft.com/post/2008/07/02/Virtual-Earth-Polygon-Search-Is-Point-Within-Polygon

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
  let poly;

  if (area && area.length > 0) {
    poly = createCutoutPolygon(area);
  }


  // areas bevat alle IDs (en namen) van de polygonen die je moet tonen
  // met de useArea hook kun je alle areas ophalen uit de backend als je geen areaId meegeeft als parameterkun je 
  // en vervolgens kun je filteren op de IDs die in areas zitten

  const datastore = new DataStore({});
  const { data: allAreas } = datastore.useAreas();


  interface Area {
    id: number;
    name: string;
  }
  const multiPolygon: any[] = [];
  const properties: Array<any> = [];
  const areaIds = areas?.map((item: Area) => item.id);
  const filteredAreas = allAreas.filter((item: any) => areaIds?.includes(item.id));

  if (filteredAreas) {

    filteredAreas.forEach((item: any) => {
      multiPolygon.push(item.polygon);
      properties.push({ title: item.name });
    });
  }

  return (
    <>
      {multiPolygon.length > 0 ? (
        multiPolygon.map((polygon, index) => (
          <>
            {console.log(polygon)}
            <Polygon
              key={index}
              {...props}
              pathOptions={areaPolygonStyle}
              positions={polygon}
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
              {properties &&
              <Popup className={'leaflet-popup'}>
                {properties[index].title && <h2>{properties[index].title}</h2>}
                {/* {properties[index].url && <a className="utrecht-button-link utrecht-button-link--html-a utrecht-button-link--primary-action" href={properties[index].url}>Bekijk wijk</a>} */}
              </Popup>
            }
            </Polygon>

          </>
        ))
      ) : (
        poly && <Polygon {...props} pathOptions={areaPolygonStyle} positions={poly} />
      )}
    </>
  );
}

export default Area;
