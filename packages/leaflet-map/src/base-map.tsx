import { useState, useEffect, PropsWithChildren } from 'react';
import {loadWidget} from '../../lib/load-widget';
import { LatLng, latLngBounds, LeafletMouseEvent } from 'leaflet';
import { MapContainer, useMapEvents } from 'react-leaflet';
import { MapConsumer, useMapRef } from './map-consumer';
import TileLayer from './tile-layer';
import { Area, isPointInArea } from './area';
import Marker from './marker';
import MarkerClusterGroup from './marker-cluster-group';

// ToDo: import { searchAddressByLatLng, suggestAddresses, LookupLatLngByAddressId } from './lib/search.js';

import 'leaflet/dist/leaflet.css';
import './css/base-map.less';

import { LocationType } from './types/location';
import { BaseProps } from '../../types/base-props';
import { ProjectSettingProps } from '../../types/project-setting-props';
import { MarkerProps } from './types/marker-props';
import { MapPropsType } from './types/index';

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
	center = {
		lat: 52.37104644463586,
		lng: 4.900402911007405,
	},

  tilesVariant = 'nlmaps',
  tiles = undefined,
  minZoom = 0,
  maxZoom = 25,

  categorize = undefined,
  
  // ToDo: search = false,
	zoomposition = 'bottomleft',
	disableDefaultUI = true,
  clustering = {
    isActive: true,
  },

  onClick = undefined,
  onMarkerClick = undefined,

  ...props
}: PropsWithChildren<BaseMapWidgetProps>) {

  let [currentMarkers, setCurrentMarkers] = useState(markers);

  let [mapId] = useState(`${parseInt(Math.random() * 1e8 as any as string)}`);
  let [mapRef] = useMapRef(mapId);

  // map is ready
  useEffect(() => {
		let event = new CustomEvent('osc-map-is-ready', { detail: { id: mapId } });
		window.dispatchEvent(event);
  }, []);

	// auto zoom and center on init
  useEffect(() => {
    if (!mapRef) return;
	  if (autoZoomAndCenter) {
		  let centerOn = ( autoZoomAndCenter == 'area' && area ) || ( currentMarkers?.length && currentMarkers );
      if (!centerOn) {
				centerOn = area;
      }
		  if (centerOn) {
			  setBoundsAndCenter( centerOn );
		  }
	  }
  }, [mapRef]);

  // update center
  useEffect(() => {
    if (!mapRef) return;
		if (center) {
			setBoundsAndCenter([center]);
		}
  }, [center]);

  // markers
  useEffect(() => {

    if (markers.length == 0 && currentMarkers.length == 0) return;

    let result = [...markers];

    result.map((marker, i) => {

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

  }, [markers]);

  async function setBoundsAndCenter(points: LocationType[] | MarkerProps[]) {

	  let poly = [];
    if (points && Array.isArray(points)) {
	    points.forEach(function(point: any) {
		    if (point._latlng) {
			    point = point._latlng;
		    } else if (point.location) {
			    point = point.location.coordinates ? { lat: point.location.coordinates[0], lng: point.location.coordinates[1] }  : point.location;
		    } else if (point.position) {
			    point = point.position.coordinates ? { lat: point.position.coordinates[0], lng: point.position.coordinates[1] }  : point.position;
		    }
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

  }

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


    <MapContainer id={`osc-base-map-${mapId}`} className="osc-base-map-widget-container" center={[center.lat, center.lng]} zoom={zoom} scrollWheelZoom={scrollWheelZoom}>

      <MapConsumer mapId={mapId}/>

      <TileLayer {...tileLayerProps}/>

      { area && area.length ? <Area area={area} areaPolygonStyle={areaPolygonStyle}/> : null }

      {currentMarkers.map((data, i) => {
        if (data.isClustered) {
          clusterMarkers.push(data);
        } else {
          return (<Marker {...props} {...data} key={`marker-${i}`}/>);
        }
      })}

      <MarkerClusterGroup {...props} categorize={categorize} {...clustering} markers={clusterMarkers}/>

      <MapEventsListener onClick={onClick} area={area}/>

      {props.children}

    </MapContainer>
  );

}

type MapEventsListenerProps = {
  area: LocationType[],
  onClick: (e: LeafletMouseEvent & { isInArea: boolean }, map: object) => void,
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


