import { useState, useEffect, useCallback } from 'react';
import type { PropsWithChildren } from 'react';
import {loadWidget} from '../../lib/load-widget';
import { LatLng, latLngBounds } from 'leaflet';
import type { LeafletMouseEvent } from 'leaflet';
import { MapContainer, useMapEvents } from 'react-leaflet';
import { MapConsumer, useMapRef } from './map-consumer';
import TileLayer from './tile-layer';
import { Area, isPointInArea } from './area';
import Marker from './marker';
import MarkerClusterGroup from './marker-cluster-group';
import parseLocation from './lib/parse-location';

// ToDo: import { searchAddressByLatLng, suggestAddresses, LookupLatLngByAddressId } from './lib/search.js';

import 'leaflet/dist/leaflet.css';
import './css/base-map.less';

import type { BaseProps } from '../../types/base-props';
import type { ProjectSettingProps } from '../../types/project-setting-props';
import type { MarkerProps } from './types/marker-props';
import type { MapPropsType } from './types/index';
import type { LocationType } from './types/location';

export type BaseMapWidgetProps =
  BaseProps &
  ProjectSettingProps & {
    resourceId?: string;
  } &
  MapPropsType;

export function BaseMap({

  iconCreateFunction = undefined,
  defaultIcon = undefined,

	area = undefined,
  areaPolygonStyle = undefined,

  markers = [],

  autoZoomAndCenter = undefined,

	zoom = 14,
  scrollWheelZoom = true,
	center = {},

  tilesVariant = 'nlmaps',
  tiles = undefined,
  minZoom = 0,
  maxZoom = 25,

  categorize = undefined,
  
  // ToDo: search = false,

  clustering = {
    isActive: true,
  },

  onClick = undefined,
  onMarkerClick = undefined,

  ...props
}: PropsWithChildren<BaseMapWidgetProps>) {

  if (!center.lat) {
		center.lat = 52.37104644463586;
		center.lng = 4.900402911007405;
  }

  let [currentMarkers, setCurrentMarkers] = useState(markers);

  let [mapId] = useState(`${parseInt(Math.random() * 1e8 as any as string)}`);
  let [mapRef] = useMapRef(mapId);

  const setBoundsAndCenter = useCallback( (points: Array<LocationType>) => {

	  let poly = [];
    if (points && Array.isArray(points)) {
	    points.forEach(function(point:LocationType) {
        parseLocation(point)
        if (point.lat) {
		      poly.push(point);
        }
	    })
    }

    if (poly.length == 0) {
      mapRef.panTo(new LatLng(center.lat, center.lng));
      return;
    }

    if (poly.length == 1) {
      mapRef.panTo(new LatLng(poly[0].lat, poly[0].lng));
      return;
    }

	  let bounds = latLngBounds(poly);
	  mapRef.fitBounds(bounds);

  }, [center, mapRef]);

  // map is ready
  useEffect(() => {
		let event = new CustomEvent('osc-map-is-ready', { detail: { id: mapId } });
		window.dispatchEvent(event);
  }, [mapId]);

	// auto zoom and center on init
  useEffect(() => {
    if (!mapRef) return;
	  if (autoZoomAndCenter) {
      if(autoZoomAndCenter == 'area' && area) {
        return setBoundsAndCenter(area);
      }
      if(currentMarkers?.length) {
			  return setBoundsAndCenter(currentMarkers);
      }
      return setBoundsAndCenter(area);
	  }
    // eslint-disable-next-line react-hooks/exhaustive-deps
  }, [mapRef]);

  // update center
  useEffect(() => {
    if (!mapRef) return;
		if (center) {
			setBoundsAndCenter([center]);
		}
  }, [center, setBoundsAndCenter, mapRef]);

  // markers
  useEffect(() => {

    if (markers.length == 0 && currentMarkers.length == 0) return;

    let result = [...markers];

    result.map((marker, i) => {

      // unify location format
      parseLocation(marker)

      // add
      let markerData: MarkerProps = {...marker};
      markerData.markerId = `${parseInt(Math.random() * 1e8 as any as string)}`;

      // iconCreateFunction
      markerData.iconCreateFunction = markerData.iconCreateFunction || iconCreateFunction;

      // categorize
      if (categorize?.categorizeByField && markerData.data?.[categorize.categorizeByField]) {
        let type = markerData.data?.[categorize.categorizeByField];
        let category = categorize.categories?.[type];
        if (category) {
          if (!markerData.icon) {
            let icon = category.icon;
            if (!icon && category.color) {
              icon = {...defaultIcon, color: category.color};
            }
            if (icon) {
              markerData.icon = icon;
            }
          }
        }
      }

      // fallback on defaultIcon
      if (!markerData.icon && defaultIcon) {
        markerData.icon = defaultIcon;
      }

      markerData.onClick = markerData.onClick ? [ ...markerData.onClick, onMarkerClick ] : [ onMarkerClick ];

      // ToDo
      markerData.isVisible = true;

		  if (clustering && clustering.isActive && !markerData.doNotCluster) {
        markerData.isClustered = true;
		  }

      result[i] = markerData

    })

    setCurrentMarkers(result);

    // eslint-disable-next-line react-hooks/exhaustive-deps
  }, [markers]);

  let clusterMarkers = [];

  // ToDo: waarom kan ik die niet gewoon als props meesturen
  const tileLayerProps = {
    tilesVariant,
    tiles,
    minZoom,
    maxZoom,
    ...props,
  };

  return (


    <MapContainer center={[center.lat, center.lng]} className="osc-base-map-widget-container" id={`osc-base-map-${mapId}`} scrollWheelZoom={scrollWheelZoom} zoom={zoom}>

      <MapConsumer mapId={mapId}/>

      <TileLayer {...tileLayerProps}/>

      { area && area.length ? <Area area={area} areaPolygonStyle={areaPolygonStyle}/> : null }

      {currentMarkers.map((data) => {
        if (data.isClustered) {
          clusterMarkers.push(data);
        } else {
          return (<Marker {...props} {...data} key={`marker-${data.markerId || data.lat+data.lng}`}/>);
        }
      })}

      <MarkerClusterGroup {...props} {...clustering} categorize={categorize} markers={clusterMarkers}/>

      <MapEventsListener area={area} onClick={onClick} />

      {props.children}

    </MapContainer>
  );

}

type MapEventsListenerProps = {
  area?: Array<LocationType>,
  onClick?: (e: LeafletMouseEvent & { isInArea: boolean }, map: object) => void,
};

function MapEventsListener({
  area = [],
  onClick = undefined,
}: MapEventsListenerProps) {
  const map = useMapEvents({
    load: () => {
      console.log('ONLOAD');
    },
    click: (e: LeafletMouseEvent) => {
      let isInArea = !(area && area.length) || isPointInArea(area, e.latlng);
		  let customEvent = new CustomEvent('osc-map-click', { detail: { ...e, isInArea } });
		  window.dispatchEvent(customEvent);
      if (onClick) {
		    if (onClick && typeof onClick == 'string') {
			    onClick = eval(onClick);
		    }
        onClick({ ...e, isInArea }, map);
      }
    },
  })
  return null;
}

BaseMap.loadWidget = loadWidget;


