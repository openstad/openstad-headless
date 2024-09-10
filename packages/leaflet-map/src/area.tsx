import DataStore from '@openstad-headless/data-store/src';
import React from 'react';
import { useState, useEffect } from 'react';
import { LatLng, polygon } from 'leaflet';
import { Polygon, Popup } from 'react-leaflet';
import type { AreaProps } from './types/area-props';
import type { LocationType } from './types/location';
import parseLocation from './lib/parse-location';

import { difference, polygon as tPolygon } from 'turf';

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

function createCutoutPolygonMulti(areas) {
  const outerBox = tPolygon([[
    [-180, -90],
    [180, -90],
    [180, 90],
    [-180, 90],
    [-180, -90]
  ]]);

  let cutoutPolygon = outerBox;

  areas.forEach(area => {
    const innerPolygon = tPolygon([area.map(({ lat, lng }) => [lng, lat])]);
    cutoutPolygon = difference(cutoutPolygon, innerPolygon) || cutoutPolygon;
  });

  return cutoutPolygon.geometry.coordinates;
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

  const [cutoutData, setCutoutData] = useState([]);

  const geojsonFeatureCollection = {
    "type": "FeatureCollection",
    "features": [
      {
        "type": "Feature",
        "properties": {
          "name": "Centrum Barneveld",
          "AREA": 56
        },
        "geometry": {
          "type": "Polygon",
          "coordinates": [
            [
              [5.583856, 52.138654],
              [5.584671, 52.143932],
              [5.589308, 52.144786],
              [5.595818, 52.142228],
              [5.597979, 52.137078],
              [5.591812, 52.134750],
              [5.585781, 52.136890],
              [5.583856, 52.138654]  // Sluit de polygoon
            ]
          ]
        }
      },
      {
        "type": "Feature",
        "properties": {
          "name": "Barneveld Noord",
          "AREA": 45
        },
        "geometry": {
          "type": "Polygon",
          "coordinates": [
            [
              [5.587501, 52.153780],
              [5.589755, 52.157503],
              [5.594382, 52.156240],
              [5.598095, 52.153080],
              [5.596284, 52.150793],
              [5.590908, 52.151590],
              [5.587501, 52.153780]  // Sluit de polygoon
            ]
          ]
        }
      },
      {
        "type": "Feature",
        "properties": {
          "name": "Voorthuizen",
          "AREA": 75
        },
        "geometry": {
          "type": "Polygon",
          "coordinates": [
            [
              [5.605741, 52.184752],
              [5.610080, 52.187238],
              [5.616000, 52.186456],
              [5.619283, 52.183892],
              [5.614422, 52.181445],
              [5.609383, 52.181705],
              [5.605741, 52.184752]  // Sluit de polygoon
            ]
          ]
        }
      }
    ]
  };

  useEffect(() => {
    const processedPolygons = geojsonFeatureCollection.features.map((feature) => {
      if (feature.geometry.type === 'Polygon') {
        const coordinates = feature.geometry.coordinates[0].map(([lng, lat]) => ({ lat, lng })); // Converteer naar lat/lng objecten
        return coordinates;
      }
      return null;
    });

    const validPolygons = processedPolygons.filter(p => p !== null);

    const cutout = createCutoutPolygonMulti(validPolygons);

    setCutoutData(cutout);
  }, []);


  let poly;

  if (area && area.length > 0) {
    poly = createCutoutPolygon(area);
  }

  const datastore = new DataStore({});
  const { data: allAreas } = datastore.useAreas();

  interface Area {
    id: number;
    name: string;
    url: string;
  }
  const multiPolygon: any[] = [];
  const properties: Array<any> = [];
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
          {cutoutData.length > 0 ? (
              <Polygon
                  {...props}
                  positions={cutoutData.map(ring => ring.map(([lng, lat]) => [lat, lng]))}  // Render both outer and inner rings
                  pathOptions={{ color: 'black', fillOpacity: 0.6 }}
              />
          ) : multiPolygon.length > 0 ? (
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
                poly && <Polygon {...props} pathOptions={areaPolygonStyle} positions={poly} />
            )}
        </>
    );
}

export default Area;
