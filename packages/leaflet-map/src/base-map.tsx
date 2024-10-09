import 'leaflet';

import { useState, useEffect, useCallback } from 'react';
import type { PropsWithChildren } from 'react';
import { loadWidget } from '../../lib/load-widget';
import { LatLng, latLngBounds } from 'leaflet';
import type { LeafletMouseEvent } from 'leaflet';
import { MapContainer } from 'react-leaflet/MapContainer';
import { useMapEvents } from 'react-leaflet/hooks';
import { MapConsumer, useMapRef } from './map-consumer';
import TileLayer from './tile-layer';
import { Area, isPointInArea } from './area';
import Marker from './marker';
import MarkerClusterGroup from './marker-cluster-group';
import parseLocation from './lib/parse-location';
import type { BaseMapWidgetProps } from './types/basemap-widget-props'
// ToDo: import { searchAddressByLatLng, suggestAddresses, LookupLatLngByAddressId } from './lib/search.js';
import 'leaflet/dist/leaflet.css';
import './css/base-map.css';
import type { MarkerProps } from './types/marker-props';
import type { LocationType } from './types/location';
import React from 'react';
import L from 'leaflet';

const BaseMap = ({
  iconCreateFunction = undefined,
  defaultIcon = undefined,

  area = [],
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
  ...props
}: PropsWithChildren<BaseMapWidgetProps & { onClick?: (e: LeafletMouseEvent & { isInArea: boolean }, map: object) => void }>) => {
  const definedCenterPoint =
    center.lat && center.lng
      ? { lat: center.lat, lng: center.lng }
      : { lat: 52.37104644463586, lng: 4.900402911007405 };
      

  // clustering geeft errors; ik begrijp niet waarom: het gebeurd alleen in de gebuilde widgets, niet in de dev componenten
  // het lijkt een timing issue, waarbij niet alles in de juiste volgporde wordt geladen
  // voor nu staat het dus uit
  clustering = {
    isActive: false
  };

  let [currentMarkers, setCurrentMarkers] = useState(markers);
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
    let event = new CustomEvent('osc-map-is-ready', { detail: { id: mapId } });
    window.dispatchEvent(event);
  }, [mapId]);

  // auto zoom and center on init
  useEffect(() => {

    if (!mapRef) return;
    if (autoZoomAndCenter) {
    if (autoZoomAndCenter === 'area' && area) {
        const updatedArea = Array.isArray(area[0]) ? area : [area];
        // Korte timeout om te zorgen dat de animatie te zien is. (inzomen van heel NL naar je polygoon)
        setTimeout(() => {
          return setBoundsAndCenter(updatedArea as any);
        }, 200);
      }
      if (currentMarkers?.length) {
        return setBoundsAndCenter(currentMarkers as any);
      }
      if (center) {
        setBoundsAndCenter([center] as any);
      }
    }
    // eslint-disable-next-line react-hooks/exhaustive-deps
  }, [mapRef, area]);

  // markers
  useEffect(() => {
    if ((markers.length === 0 && currentMarkers.length === 0) && mapDataLayers.length === 0) return;

    let result = [...markers];

    if (mapDataLayers.length > 0) {
      mapDataLayers?.forEach((dataLayer: any) => {
        const records = dataLayer?.layer?.result?.records;

        if (records && Array.isArray(records)) {
          records.forEach((record) => {
            const {lat, lon, titel, inhoud} = record;
            const long = lon || record.long

            if (lat && long) {
              let icon = dataLayer?.icon;
              icon = (!!icon && icon.length > 0) ? icon[0].url : undefined;

              if (icon) {
                let markerData: MarkerProps = {
                  lat,
                  lng: long,
                  title: titel,
                  description: inhoud,
                  markerId: `${parseInt((Math.random() * 1e8).toString())}`,
                  isVisible: true,
                  isClustered: true,
                };

                markerData.icon = L.icon({
                  iconUrl: icon,
                  iconSize: [30, 40],
                  iconAnchor: [15, 40],
                  className: 'custom-image-icon',
                });

                result.push(markerData);
              }
            }
          });
        }
      });
    }

    result.map((marker, i) => {
      // unify location format
      parseLocation(marker);

      // add
      let markerData: MarkerProps = { ...marker };
      markerData.markerId = `${parseInt((Math.random() * 1e8).toString())}`;

      // iconCreateFunction
      markerData.iconCreateFunction =
        markerData.iconCreateFunction || iconCreateFunction;

      // categorize
      if (
        categorize?.categorizeByField &&
        markerData.data?.[categorize.categorizeByField]
      ) {
        let type = markerData.data?.[categorize.categorizeByField];
        let category = categorize.categories?.[type];
        if (category) {
          if (!markerData.icon) {
            let icon = category.icon;
            if (!icon && category.color) {
              icon = { ...defaultIcon, color: category.color };
            }
            if (icon) {
              markerData.icon = icon;
            }
          }
        }
      }

      // fallback on defaultIcon
      if (!markerData.icon && defaultIcon) {
        if (markerData.color) {
          markerData.icon = { ...defaultIcon, color: markerData.color };
        } else {
          markerData.icon = defaultIcon;
        }
      }

      markerData.onClick = markerData.onClick
        ? [...markerData.onClick, onMarkerClick]
        : [onMarkerClick];

      // ToDo
      markerData.isVisible = true;

      if (clustering && clustering.isActive && !markerData.doNotCluster) {
        markerData.isClustered = true;
      }

      result[i] = markerData;
    });

    setCurrentMarkers(result);
  }, [markers, mapDataLayers]);

  let clusterMarkers: MarkerProps[] = [];

  // ToDo: waarom kan ik die niet gewoon als props meesturen
  const tileLayerProps = {
    tilesVariant,
    tiles,
    minZoom,
    maxZoom,
    ...props,
  };

  // <div style={{ width: '100%', aspectRatio: 16 / 9 }}>
  // <div style={{ width: '100%', height: '100%' }}>

  let style = {
    width: width,
    height: height || undefined,
    aspectRatio: height ? undefined : 16 / 9,
  };
  return (
    <>
      <div className="map-container" style={style}>
        <MapContainer
          center={[definedCenterPoint.lat, definedCenterPoint.lng]}
          className="osc-base-map-widget-container"
          id={`osc-base-map-${mapId}`}
          scrollWheelZoom={scrollWheelZoom}
          zoom={zoom}>
          <MapConsumer mapId={mapId} />

          <TileLayer {...tileLayerProps} />

          {area && area.length ? (
            <Area area={area} areas={customPolygon} areaPolygonStyle={areaPolygonStyle} />
          ) : null}

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
      console.log('ONLOAD');
    },
    click: (e: LeafletMouseEvent) => {
      const targetElement = e.originalEvent.target as HTMLElement;
      const isMarkerClick = targetElement.closest('.leaflet-marker-icon');

      if (isMarkerClick && onMarkerClick) {
        let customEvent = new CustomEvent('osc-marker-click', { detail: e });
        window.dispatchEvent(customEvent);

        onMarkerClick(e, map);

        return; // Prevent further execution (e.g., placing a new marker)
      }

      const areaLatLngs = area.map(parseLocation) as LatLng[];
      let isInArea = !(area && area.length) || isPointInArea(areaLatLngs, e.latlng);

      let customEvent = new CustomEvent('osc-map-click', {
        detail: { ...e, isInArea },
      });
      window.dispatchEvent(customEvent);

      if (onClick) {
        if (onClick && typeof onClick == 'string') {
          onClick = eval(onClick);
        }
        onClick && onClick({ ...e, isInArea }, map);
      }
    },
  });
  return null;
}

BaseMap.loadWidget = loadWidget;
export { BaseMap };
