import 'leaflet';
import React from 'react';
import type { LeafletMouseEvent } from 'leaflet';
import { LatLng, latLngBounds } from 'leaflet';
import type { PropsWithChildren } from 'react';
import { useCallback, useEffect, useRef, useState } from 'react';
import { MapContainer } from 'react-leaflet/MapContainer';
import { useMapEvents } from 'react-leaflet/hooks';
import { loadWidget } from '../../lib/load-widget';
import { Area, isPointInArea } from './area';
import parseLocation from './lib/parse-location';
import { MapConsumer, useMapRef } from './map-consumer';
import Marker from './marker';
import MarkerClusterGroup from './marker-cluster-group';
import TileLayer from './tile-layer';
import type { BaseMapWidgetProps } from './types/basemap-widget-props';

import '@openstad-headless/document-map/src/gesture';

declare module 'leaflet' {
  function mapInteraction(map: L.Map, options?: any): any;
}

// ToDo: import { searchAddressByLatLng, suggestAddresses, LookupLatLngByAddressId } from './lib/search.js';

function isRdCoordinates(x: number, y: number) {
  return x > 0 && x < 300000 && y > 300000 && y < 620000; // Typische ranges voor RD-coördinaten
}

// RD naar WGS84 (lat, lon) conversie
const rdToWgs84 = (x: number, y: number) => {
  if (x < 1000) x *= 1000;
  if (y < 1000) y *= 1000;

  const x0 = 155000.000;
  const y0 = 463000.000;

  const f0 = 52.156160556;
  const l0 = 5.387638889;

  const a01 = 3236.0331637;
  const b10 = 5261.3028966;
  const a20 = -32.5915821;
  const b11 = 105.9780241;
  const a02 = -0.2472814;
  const b12 = 2.4576469;
  const a21 = -0.8501341;
  const b30 = -0.8192156;
  const a03 = -0.0655238;
  const b31 = -0.0560092;
  const a22 = -0.0171137;
  const b13 = 0.0560089;
  const a40 = 0.0052771;
  const b32 = -0.0025614;
  const a23 = -0.0003859;
  const b14 = 0.0012770;
  const a41 = 0.0003314;
  const b50 = 0.0002574;
  const a04 = 0.0000371;
  const b33 = -0.0000973;
  const a42 = 0.0000143;
  const b51 = 0.0000293;
  const a24 = -0.0000090;
  const b15 = 0.0000291;

  const dx = (x - x0) * Math.pow(10, -5);
  const dy = (y - y0) * Math.pow(10, -5);

  let df = a01 * dy + a20 * Math.pow(dx, 2) + a02 * Math.pow(dy, 2) + a21 * Math.pow(dx, 2) * dy + a03 * Math.pow(dy, 3);
  df += a40 * Math.pow(dx, 4) + a22 * Math.pow(dx, 2) * Math.pow(dy, 2) + a04 * Math.pow(dy, 4) + a41 * Math.pow(dx, 4) * dy;
  df += a23 * Math.pow(dx, 2) * Math.pow(dy, 3) + a42 * Math.pow(dx, 4) * Math.pow(dy, 2) + a24 * Math.pow(dx, 2) * Math.pow(dy, 4);

  const f = f0 + df / 3600;

  let dl = b10 * dx + b11 * dx * dy + b30 * Math.pow(dx, 3) + b12 * dx * Math.pow(dy, 2) + b31 * Math.pow(dx, 3) * dy;
  dl += b13 * dx * Math.pow(dy, 3) + b50 * Math.pow(dx, 5) + b32 * Math.pow(dx, 3) * Math.pow(dy, 2) + b14 * dx * Math.pow(dy, 4);
  dl += b51 * Math.pow(dx, 5) * dy + b33 * Math.pow(dx, 3) * Math.pow(dy, 3) + b15 * dx * Math.pow(dy, 5);

  const l = l0 + dl / 3600;

  const fWgs = f + (-96.862 - 11.714 * (f - 52) - 0.125 * (l - 5)) / 100000;
  const lWgs = l + (-37.902 + 0.329 * (f - 52) - 14.667 * (l - 5)) / 100000;

  return {
    lat: fWgs,
    lon: lWgs
  }
};


import 'leaflet/dist/leaflet.css';
import './css/base-map.css';
import type { LocationType } from './types/location';
import L from 'leaflet';
import {Circle, Polyline} from "react-leaflet";
import type { MarkerProps } from './types/marker-props';

interface MapDataLayerFeature {
  geometry?: {
    type?: string;
    coordinates?: Array<[number, number]> | [number, number];
  };
}

interface MapDataLayer {
  layer?: {
    features?: Array<MapDataLayerFeature>;
  };
}

const BaseMap = ({
  iconCreateFunction = undefined,
  defaultIcon = undefined,

  area = undefined,
  areaPolygonStyle = undefined,

  markers = [],

  autoZoomAndCenter = undefined,

  zoom = 7,
  scrollWheelZoom = true,
  center = {
    lat: 52.37104644463586,
    lng: 4.900402911007405,
  },

  tilesVariant = 'nlmaps',
  tiles = undefined,
  minZoom = 7,
  maxZoom = 20,

  categorize = undefined,

  // ToDo: search = false,

  clustering = {
    isActive: true,
  },

  onClick = undefined,
  onMarkerClick = undefined,

  width = '100%',
  height = undefined,
  customPolygon = [],
  mapDataLayers = [],
  locationProx = undefined,
  ...props
}: PropsWithChildren<BaseMapWidgetProps & { onClick?: (e: LeafletMouseEvent & { isInArea: boolean }, map: object) => void }>) => {


  const definedCenterPoint =
    center.lat && center.lng
      ? { lat: center.lat, lng: center.lng }
      : { lat: 52.37104644463586, lng: 4.900402911007405 };

  tilesVariant = props?.map?.tilesVariant || tilesVariant ||'nlmaps';
  const customUrlSetting = tilesVariant === 'custom' ? props?.map?.customUrl : undefined;
      

  // clustering geeft errors; ik begrijp niet waarom: het gebeurd alleen in de gebuilde widgets, niet in de dev componenten
  // het lijkt een timing issue, waarbij niet alles in de juiste volgporde wordt geladen
  // voor nu staat het dus uit
  clustering = {
    isActive: false
  };

  let [currentMarkers, setCurrentMarkers] = useState(markers);
  let [currentPolyLines, setPolyLines] = useState<Array<{
    positions: [number, number][],
    style: {
      color: string,
      weight: number,
      opacity: number,
    }
  }>>([]);
  let [mapId] = useState(`${parseInt((Math.random() * 1e8) as any as string)}`);
  let [mapRef] = useMapRef(mapId);

  const setBoundsAndCenter = useCallback(
    (polygons: Array<Array<LocationType>>) => {
      let allPolygons: LocationType[][] = [];
  
      if (polygons && Array.isArray(polygons)) {
        polygons.forEach((points: Array<LocationType>) => {
          let poly: LocationType[] = [];
          if (points && Array.isArray(points)) {
            points.forEach((point: LocationType) => {
              parseLocation(point);
              if (point.lat) {
                poly.push(point);
              }
            });
          }
          if (poly.length > 0) {
            allPolygons.push(poly);
          }
        });
      }
  
      if (allPolygons.length == 0) {
        mapRef.panTo(
          new LatLng(definedCenterPoint.lat, definedCenterPoint.lng)
        );
        return;
      }
  
      if (allPolygons.length == 1 && allPolygons[0].length == 1 && allPolygons[0][0].lat && allPolygons[0][0].lng) {
        mapRef.panTo(new LatLng(allPolygons[0][0].lat, allPolygons[0][0].lng));
        return;
      }
  
      let combinedBounds = latLngBounds([]);
      allPolygons.forEach((poly) => {
        let bounds = latLngBounds(
          poly.map(
            (p) =>
              new LatLng(
                p.lat || definedCenterPoint.lat,
                p.lng || definedCenterPoint.lng
              )
          )
        );
        combinedBounds.extend(bounds);
      });
  
      mapRef.fitBounds(combinedBounds);
    },
    [center, mapRef]
  );

  // map is ready
  useEffect(() => {
    const event = new CustomEvent('osc-map-is-ready', { detail: { id: mapId } });
    window.dispatchEvent(event);
  }, [mapId]);

  // auto zoom and center on init
  useEffect(() => {
    if (!mapRef || !autoZoomAndCenter) return;

    if (autoZoomAndCenter === 'area') {
      if (area?.length) {
        const updatedArea = Array.isArray(area[0]) ? area : [area];
        setBoundsAndCenter(updatedArea as any);
        return;
      }

      if (!area?.length && mapDataLayers?.length) {
        const coords = mapDataLayers.reduce((acc: Array<{ lat: number, lng: number }>, layer: MapDataLayer) => {
          const features = layer?.layer?.features ?? [];
          features.forEach((feature: MapDataLayerFeature) => {
            if (feature?.geometry?.type === 'LineString' && Array.isArray(feature.geometry.coordinates)) {
              (feature.geometry.coordinates as Array<[number, number]>).forEach((coord) => {
                acc.push({ lat: coord[1], lng: coord[0] });
              });
            } else if (feature?.geometry?.type === 'Point' && Array.isArray(feature.geometry.coordinates)) {
              const coord = feature.geometry.coordinates as [number, number];
              acc.push({ lat: coord[1], lng: coord[0] });
            }
          });
          return acc;
        }, []);

        if (coords.length > 0) {
          const bounds = latLngBounds(coords.map((c: any) => [c.lat, c.lng] as [number, number]));
          mapRef.fitBounds(bounds);
        }
        return;
      }
    }

    if (currentMarkers?.length) {
      setBoundsAndCenter(currentMarkers as any);
    } else if (center) {
      setBoundsAndCenter([center] as any);
    }
  }, [mapRef, area, center, autoZoomAndCenter, mapDataLayers, currentMarkers, setBoundsAndCenter]);

  // markers
  useEffect(() => {
    if ((markers.length === 0 && currentMarkers.length === 0) && mapDataLayers.length === 0) return;

    const processMarkers = () => {
      const result = [...markers];
      const polyLines: {
        positions: [number, number][],
        style: {
          color: string,
          weight: number,
          opacity: number,
        }
      }[] = [];

      // Process map data layers
      if (mapDataLayers.length > 0) {
        mapDataLayers.forEach((dataLayer: any) => {
          const records = dataLayer?.layer?.result?.records;
          const geoJsonFeatures = dataLayer?.layer?.features;

          // Process records
          if (records?.length) {
            records.forEach((record: any) => {
              const {lat, lon, titel, inhoud} = record;
              const long = lon || record.long;

              if (lat && long) {
                const icon = dataLayer?.icon?.[0]?.url;
                if (icon) {
                  result.push({
                    lat,
                    lng: long,
                    title: titel,
                    description: inhoud,
                    markerId: `record-${lat}-${long}-${titel || 'marker'}`,
                    isVisible: true,
                    isClustered: false,
                    icon: L.icon({
                      iconUrl: icon,
                      iconSize: [30, 40],
                      iconAnchor: [15, 40],
                      className: 'custom-image-icon',
                    })
                  });
                }
              }
            });
          }

          // Process GeoJSON features
          if (geoJsonFeatures?.length) {
            geoJsonFeatures.forEach((feature: any) => {
              if (!feature.geometry) return;
              const geometryType = feature.geometry?.type;

              if (geometryType === 'LineString') {
                const coordinates = feature.geometry?.coordinates || [];
                const latlngs = coordinates.map(([lng, lat]: [number, number]) => {
                  if (isRdCoordinates(lng, lat)) {
                    const converted = rdToWgs84(lng, lat);
                    return [converted.lat, converted.lon];
                  }
                  return [lat, lng];
                });

                polyLines.push({
                  positions: latlngs,
                  style: {
                    color: feature?.properties?.stroke || 'rgb(85, 85, 85)',
                    weight: feature?.properties?.['stroke-width'] || 2,
                    opacity: feature?.properties?.['stroke-opacity'] ?? 1,
                  },
                });
              } else if (geometryType === 'Point') {
                const coordinates = feature.geometry?.coordinates;
                let lat = coordinates?.[1];
                let long = coordinates?.[0];
                const {Objectnaam, Locatieaanduiding} = feature.properties;

                if (isRdCoordinates(long, lat)) {
                  const converted = rdToWgs84(long, lat);
                  lat = converted.lat;
                  long = converted.lon;
                }

                if (lat && long) {
                  const icon = dataLayer?.icon?.[0]?.url;
                  if (icon) {
                    result.push({
                      lat,
                      lng: long,
                      title: Objectnaam,
                      description: Locatieaanduiding,
                      markerId: `feature-${lat}-${long}-${Objectnaam || 'marker'}`,
                      isVisible: true,
                      isClustered: false,
                      icon: L.icon({
                        iconUrl: icon,
                        iconSize: [30, 40],
                        iconAnchor: [15, 40],
                        className: 'custom-image-icon',
                      })
                    });
                  }
                }
              }
            });
          }
        });
      }

      // Process markers
      const processedMarkers = result.map(marker => {
        parseLocation(marker);

        const markerData: MarkerProps = {
          ...marker,
          markerId: marker.markerId || `marker-${marker.lat}-${marker.lng}`,
          iconCreateFunction: marker.iconCreateFunction || iconCreateFunction,
          onClick: marker.onClick ? [...marker.onClick, onMarkerClick] : [onMarkerClick],
          isVisible: true,
          isClustered: clustering?.isActive && !marker.doNotCluster ? false : undefined
        };

        // Handle categorization
        if (categorize?.categorizeByField && markerData.data?.[categorize.categorizeByField]) {
          const type = markerData.data[categorize.categorizeByField];
          const category = categorize.categories?.[type];
          if (category && !markerData.icon) {
            const icon = category.icon || (category.color ? { ...defaultIcon, color: category.color } : undefined);
            if (icon) markerData.icon = icon;
          }
        }

        // Handle default icon
        if (!markerData.icon && defaultIcon) {
          markerData.icon = markerData.color
            ? { ...defaultIcon, color: markerData.color }
            : defaultIcon;
        }

        return markerData;
      });

      return { markers: processedMarkers, polyLines };
    };

    const { markers: newMarkers, polyLines: newPolyLines } = processMarkers();

    // Only update state if there are actual changes
    const markersChanged = newMarkers.length !== currentMarkers.length ||
      newMarkers.some((marker, index) =>
        marker.lat !== currentMarkers[index]?.lat ||
        marker.lng !== currentMarkers[index]?.lng
      );

    if (markersChanged) {
      setCurrentMarkers(newMarkers);
    }

    if (newPolyLines.length > 0) {
      setPolyLines(newPolyLines);
    }
  }, [markers, mapDataLayers, iconCreateFunction, defaultIcon, categorize, clustering, onMarkerClick]);

  let clusterMarkers: MarkerProps[] = [];

  // ToDo: waarom kan ik die niet gewoon als props meesturen
  const tileLayerProps = {
    tilesVariant,
    customUrlSetting,
    tiles,
    minZoom,
    maxZoom,
    ...props,
  };

  useEffect(() => {
    document.documentElement.style.setProperty('--basemap-map-width', width);

    const heightValue = height
      ? (height.match(/\d+(px|%|vh|vw|em|rem|ex|ch|vmin|vmax|cm|mm|in|pt|pc)$/)
          ? height
          : `${height}px`)
      : 'auto';

    document.documentElement.style.setProperty('--basemap-map-height', heightValue);
    document.documentElement.style.setProperty('--basemap-map-aspect-ratio', height ? 'unset' : '16 / 9');
  }, [width, height]);

  const [isTouchDevice, setIsTouchDevice] = useState(false);

  useEffect(() => {
    if ('ontouchstart' in window) {
      setIsTouchDevice(true);
    }
  }, []);

  const mapContainerRef = useRef<any>(null);
  useEffect(() => {
    const map = mapContainerRef.current;
    let mapInteractionInstance: any;

    if (map && L && L.mapInteraction) {
      mapInteractionInstance = L.mapInteraction(map, {
        isTouch: isTouchDevice,
      });
    }

    return () => {
      if (mapInteractionInstance && mapInteractionInstance.destroy) {
        mapInteractionInstance.destroy();
      }
    };
  }, [mapContainerRef.current, isTouchDevice]);

  return (
    <>
      <div className="map-container osc-map">
        <MapContainer
          ref={mapContainerRef}
          center={[definedCenterPoint.lat, definedCenterPoint.lng]}
          className="osc-base-map-widget-container"
          id={`osc-base-map-${mapId}`}
          scrollWheelZoom={scrollWheelZoom}
          zoom={zoom}>
          <MapConsumer mapId={mapId} />

          <TileLayer {...tileLayerProps} />

          {area && area.length ? (
            <Area area={area} areas={customPolygon} areaPolygonStyle={areaPolygonStyle} {...props} />
          ) : null}

          {currentPolyLines && currentPolyLines.length > 0 && currentPolyLines.map((polyLine, i) => {
            return (
              <Polyline
                key={`polyline-${i}`}
                positions={polyLine.positions}
                pathOptions={polyLine.style}
              />
            );
          })}

          {!!currentMarkers && currentMarkers.length > 0 && currentMarkers.map((data) => {
            if (data.isClustered) {
              clusterMarkers.push(data);
            } else if (data.lat && data.lng) {
              return (
                <Marker
                  {...props}
                  {...data}
                  key={`marker-${data.markerId || data.lat + data.lng}`}
                />
              );
            }
          })}

          {clusterMarkers.length > 0 && (
            <MarkerClusterGroup
              {...props}
              {...clustering}
              categorize={categorize}
              markers={clusterMarkers}
            />
          )}

          <MapEventsListener
            area={area}
            onClick={(e, map) =>
              onClick && onClick({ ...e, isInArea: e.isInArea }, map)
            }
            onMarkerClick={onMarkerClick}
          />

          {locationProx && locationProx.lat && locationProx.lng && (
            <Circle
              center={[parseFloat(locationProx.lat), parseFloat(locationProx.lng)]}
              radius={(locationProx.proximity  || 1) * 1000}
              pathOptions={{
                color: '#0077ff',
                fillColor: '#0077ff',
                fillOpacity: 0.1,
                weight: 2,
                dashArray: '4 4',
              }}
            />
          )}

        </MapContainer>
      </div>
    </>
  );
};

type MapEventsListenerProps = {
  area?: Array<LocationType>;
  onClick?: (e: LeafletMouseEvent & { isInArea: boolean }, map: object) => void;
  onMarkerClick?: (e: LeafletMouseEvent, map: any) => void,
};

function MapEventsListener({
  area = [],
  onClick = undefined,
  onMarkerClick = undefined,
}: MapEventsListenerProps) {
  const map = useMapEvents({
    load: () => {
      console.log("ONLOAD");
    },
    click: (e: LeafletMouseEvent) => {
      const targetElement = e.originalEvent.target as HTMLElement;
      const isMarkerClick = targetElement.closest(".leaflet-marker-icon");

      if (isMarkerClick && onMarkerClick) {
        let customEvent = new CustomEvent("osc-marker-click", { detail: e });
        window.dispatchEvent(customEvent);

        onMarkerClick(e, map);

        return;
      }

      const areaLatLngs = area.map(parseLocation) as LatLng[];
      let isInArea = !(area && area.length) || isPointInArea(areaLatLngs, e.latlng);

      let customEvent = new CustomEvent("osc-map-click", {
        detail: { ...e, isInArea },
      });
      window.dispatchEvent(customEvent);

      if (onClick) {
        if (typeof onClick === "string") {
          const resolvedFunction = globalThis[onClick];
          if (typeof resolvedFunction === "function") {
            onClick = resolvedFunction;
          } else {
            console.warn(`Function ${onClick} is not defined on globalThis.`);
            return;
          }
        }

        onClick({ ...e, isInArea }, map);
      }
    },
  });

  return null;
}

BaseMap.loadWidget = loadWidget;
export { BaseMap };
