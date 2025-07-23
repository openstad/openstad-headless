import '@utrecht/component-library-css';
import '@utrecht/design-tokens/dist/root.css';
import { Button, ButtonLink } from '@utrecht/component-library-react';

import {PropsWithChildren, useEffect} from 'react';
import { loadWidget } from '../../lib/load-widget';
import DataStore from '@openstad-headless/data-store/src';
import parseLocation from './lib/parse-location';

import 'leaflet/dist/leaflet.css';
import './css/base-map.css';
import './css/resource-overview-map.css';

import type { MarkerProps } from './types/marker-props';
import type { CategoriesType } from './types/categorize';
import type {DataLayer, ResourceOverviewMapWidgetProps } from './types/resource-overview-map-widget-props';
import { BaseMap } from './base-map';
import React, { useState } from 'react';
import { LocationType } from '@openstad-headless/leaflet-map/src/types/location.js';
import L from 'leaflet';

type Point = {
  lat: number;
  lng: number;
};

function generateLineStyleSVG(features: any[]): string {
  const DEFAULT_STYLE = {
    stroke: 'rgb(85, 85, 85)',
    'stroke-width': 2,
    'stroke-opacity': 1,
  };

  const styleMap: Record<string, { count: number, width: number, color: string, opacity: number }> = {};

  features.forEach(feature => {
    if (feature.geometry?.type !== 'LineString') return;

    const props = feature.properties || {};
    const stroke = props.stroke || DEFAULT_STYLE.stroke;
    const width = props['stroke-width'] || DEFAULT_STYLE['stroke-width'];
    const opacity = props['stroke-opacity'] ?? DEFAULT_STYLE['stroke-opacity'];

    const key = `${stroke}-${width}-${opacity}`;
    if (!styleMap[key]) {
      styleMap[key] = { count: 0, width, color: stroke, opacity };
    }
    styleMap[key].count++;
  });

  const totalWeight = Object.values(styleMap).reduce((sum, style) => sum + (style.width * style.count), 0);

  let currentX = 0;
  const height = 13;
  const width = 13;
  const svgParts = [
    `<svg xmlns="http://www.w3.org/2000/svg" width="${width}" height="${height}" viewBox="0 0 ${width} ${height}">`
  ];

  Object.values(styleMap).forEach(style => {
    const relativeWidth = (style.width * style.count) / totalWeight * width;
    svgParts.push(`
      <rect 
        x="${currentX}" 
        y="0" 
        width="${relativeWidth}" 
        height="${height}" 
        fill="${style.color}" 
        opacity="${style.opacity}" 
      />
    `);
    currentX += relativeWidth;
  });

  svgParts.push('</svg>');
  return `data:image/svg+xml;base64,${btoa(svgParts.join(''))}`;
}

const ResourceOverviewMap = ({
  categorize = undefined,
  markerHref = undefined,
  countButton = undefined,
  ctaButton = undefined,
  locationProx = undefined,
  givenResources,
  selectedProjects = [],
  ...props
}: PropsWithChildren<ResourceOverviewMapWidgetProps>) => {
  const datastore = new DataStore({
    projectId: props.projectId,
    api: props.api,
    config: { api: props.api },
  });

  if (!Array.isArray(givenResources)) {
    givenResources = undefined;
  }

  const { data: resources } = datastore.useResources(
    {
      projectId: props.projectId,
    },
    { suspense: !!givenResources }
  );

  const allResources = givenResources || resources?.records || [];
  let categorizeByField = categorize?.categorizeByField;
  let categories: CategoriesType = {};

  const projectId = Array.isArray(selectedProjects) && selectedProjects.length > 0 ? "0" : props.projectId;

  if (categorizeByField) {
    const { data: tags } = datastore.useTags({
      projectId: projectId,
      type: categorizeByField,
    });
    if (Array.isArray(tags) && tags.length) {
      categories = {};
      tags.forEach((tag: any) => {
        // TODO: types/Tag does not exist yet
        categories[tag.name] = {
          color: tag.backgroundColor || '#558',
          icon: tag.mapIcon,
        };
      });
    }
  }
  let currentMarkers =
    allResources.map((resource: any) => {
      // TODO: types/resource does not exist yet
      let marker: MarkerProps = {
        location: resource?.location ? { ...resource.location } : undefined,
      };
      const markerLatLng: any = parseLocation(marker); // unify location format
      marker.lat = markerLatLng.lat;
      marker.lng = markerLatLng.lng;

      if ( Array.isArray(selectedProjects) && selectedProjects.length > 0 ) {
        const markerHrefUrl = selectedProjects.find((project) => project.id === resource.projectId)?.detailPageLink;

        if (markerHrefUrl) {
          markerHref = markerHrefUrl;
        }
      }

      if (marker.lat && marker.lng && markerHref) {
        marker.href = markerHref.replace(/\[id\]/, resource.id);
      }

      if (marker.lat && marker.lng && categorizeByField && categories) {
        let tag = resource.tags?.find((t: any) => t.type == categorizeByField); // TODO: types/Tag does not exist yet
        if (tag) {
          marker.data = { [categorizeByField]: tag.name };
        }
      }

      const firstStatus = resource.statuses
        ? resource.statuses
        .filter((status: { seqnr: number }) => status.seqnr !== undefined && status.seqnr !== null)
        .sort((a: { seqnr: number }, b: { seqnr: number }) => a.seqnr - b.seqnr)[0] || resource.statuses[0]
        : false;
      let MapIconImage = firstStatus && firstStatus.mapIcon ? firstStatus.mapIcon : '';

      const firstTag = resource.tags
        ? resource.tags
        .filter((tag: { seqnr: number }) => tag.seqnr !== undefined && tag.seqnr !== null)
        .sort((a: { seqnr: number }, b: { seqnr: number }) => a.seqnr - b.seqnr)[0] || resource.tags[0]
        : false;
      MapIconImage = firstTag && firstTag.mapIcon ? firstTag.mapIcon : MapIconImage;
      const MapIconColor = firstTag && firstTag.documentMapIconColor ? firstTag.documentMapIconColor : '';

      // Set the resource name
      marker.icon = {
        title: resource.title ?? 'Locatie pin',
      }

      // Set the icon color
      if (MapIconColor) {
        marker.icon.color = MapIconColor;
      }

      // Set the icon
      if (MapIconImage) {
        marker.icon = L.icon({
          iconUrl: MapIconImage,
          iconSize: [30, 40],
          iconAnchor: [15, 40],
          className: 'custom-image-icon',
        });
      }

      return marker;
    }) || [];

  const projectMarkers = selectedProjects.map((project) => {
    const marker: MarkerProps = {
      lat: project.projectLat ? parseFloat(project.projectLat) : undefined,
      lng: project.projectLng ? parseFloat(project.projectLng) : undefined,
      href: project.overviewUrl || '',
      title: project.overviewTitle || project.name || '',
      icon: project.overviewMarkerIcon
        ? L.icon({
          iconUrl: project.overviewMarkerIcon,
          iconSize: [30, 40],
          iconAnchor: [15, 40],
          className: 'custom-image-icon',
        })
        : undefined,
    };

    if (marker.lat && marker.lng) {
      return marker;
    }
    return null;
  }).filter(marker => marker !== null);

  currentMarkers = currentMarkers.concat(projectMarkers);

  if (givenResources) {
    resources.metadata.totalCount = givenResources.length;
  }

  let countButtonElement: React.JSX.Element = <></>;
  if (countButton?.show) {
    countButtonElement = (
      <div
        className="utrecht-button utrecht-button--secondary-action osc-resource-overview-map-button osc-first-button">
        <section className="resource-counter">
          {resources?.metadata?.totalCount}
        </section>
        <section className="resource-label">
          {countButton.label || 'plannen'}
        </section>
      </div>
    );
  }

  let ctaButtonElement: React.JSX.Element = <></>;
  if (ctaButton?.show) {
    ctaButtonElement = (
      <ButtonLink
        appearance="primary-action-button"
        href={ctaButton.href}
        className={`osc-resource-overview-map-button ${countButtonElement ? 'osc-second-button' : 'osc-first-button'
          }`}>
        <section className="resource-label">{ctaButton.label}</section>
      </ButtonLink>
    );
  }

  const { data: areas } = datastore.useArea({
    projectId: props.projectId,
  });

  let areaId = props?.map?.areaId || false;
  const polygon =
    areaId && Array.isArray(areas) && areas.length > 0
      ? (areas.find((area) => area.id.toString() === areaId) || {}).polygon
      : [];

  const { data: datalayers } = datastore.useDatalayer({
    projectId: props.projectId,
  });

  const mapDataLayers: { layer: any; icon?: any, name: string, id: string, activeOnInit: boolean }[] = [];
  const selectedDataLayers = props?.resourceOverviewMapWidget?.datalayer || [];
  const showOnOffButtons = props?.resourceOverviewMapWidget?.enableOnOffSwitching || false;

  if (selectedDataLayers && Array.isArray(selectedDataLayers) && Array.isArray(datalayers) && datalayers.length > 0) {
    selectedDataLayers.forEach((selectedDataLayer: DataLayer, index: number) => {
      const foundDatalayer = datalayers.find((datalayer: DataLayer) => {
        const isMatch = datalayer.id === selectedDataLayer.id;
        return isMatch;
      });

      if (foundDatalayer) {
        const stableId = `layer-${index}`;

        mapDataLayers.push({
          layer: foundDatalayer.layer,
          icon: foundDatalayer.icon,
          name: selectedDataLayer.name,
          activeOnInit: typeof(selectedDataLayer?.activeOnInit) === 'boolean' ? selectedDataLayer.activeOnInit : true,
          id: stableId
        });
      }
    });
  }

  function calculateCenter(polygon: Point[] | Point[][]) {
    if (!polygon || polygon.length === 0) {
      return undefined;
    }

    const flatPolygon = Array.isArray(polygon[0])
      ? (polygon as Point[][]).flat()
      : (polygon as Point[]);

    let minX = Infinity;
    let maxX = -Infinity;
    let minY = Infinity;
    let maxY = -Infinity;

    flatPolygon.forEach((point) => {
      if (point.lng < minX) minX = point.lng;
      if (point.lng > maxX) maxX = point.lng;
      if (point.lat < minY) minY = point.lat;
      if (point.lat > maxY) maxY = point.lat;
    });

    const avgLat = (minY + maxY) / 2;
    const avgLng = (minX + maxX) / 2;

    return { lat: avgLat, lng: avgLng };
  }

  const [center, setCenter] = useState<LocationType | undefined>(undefined);

  useEffect(() => {
    if (!!polygon) {
      setCenter( calculateCenter(polygon) );
    }
  }, [polygon, areas]);

  const zoom = {
    minZoom: props?.map?.minZoom ? parseInt(props.map.minZoom) : 7,
    maxZoom: props?.map?.maxZoom ? parseInt(props.map.maxZoom) : 20
  };

  const skipMarkers = () => {
    const nextFocus: HTMLButtonElement | null = document.querySelectorAll('.leaflet-control-zoom-in')[0] as HTMLButtonElement;

    if (nextFocus) {
      nextFocus.focus();
    }
  };

  const [activeLayers, setActiveLayers] = useState<{ [key: string]: boolean }>({});

  useEffect(() => {
    if (mapDataLayers.length > 0 && Object.keys(activeLayers).length === 0) {
      const initialLayers = mapDataLayers.reduce((acc, layer) => {
        acc[layer.id] = layer.activeOnInit;
        return acc;
      }, {} as { [key: string]: boolean });

      setActiveLayers(initialLayers);
    }
  }, [mapDataLayers]);

  const toggleLayer = (id: string) => {
    setActiveLayers(prevState => ({
      ...prevState,
      [id]: !prevState[id],
    }));
  };

  const visibleMapDataLayers = mapDataLayers.filter(layer => activeLayers[layer.id]);

  if ( !!props?.map && typeof(props?.map) === 'object' ) {
    props.map = {
      ...props.map,
      tilesVariant: props?.tilesVariant || props?.map?.tilesVariant || 'nlmaps',
      customUrl: props?.customUrl || props?.map?.customUrl || '',
    }
  }

  return ((polygon && center) || !Number(areaId)) ? (
    <div className='map-container--buttons'>
      <Button appearance='primary-action-button' className='skip-link' onClick={skipMarkers}>Sla kaart over</Button>
      { mapDataLayers.length > 0 && (
        <ul className="legend">
          {mapDataLayers.map(layer => (
            <li key={layer.id} className="legend-item">
              <label className="legend-label">
                {showOnOffButtons && (
                  <input
                    type="checkbox"
                    checked={!!activeLayers[layer.id]}
                    onChange={() => toggleLayer(layer.id)}
                  />
                )}
                <div className="legend-info">
                  {layer.icon && layer.icon[0] && layer.icon[0].url ? (
                    <img src={layer.icon[0].url} alt="Layer icon" className="legend-icon" />
                  ) : layer.layer?.features?.some((f: any) => f?.geometry?.type === 'LineString') ? (
                    <img
                      src={generateLineStyleSVG(layer.layer.features)}
                      alt="Layer line preview"
                      className="legend-icon legend-icon--line"
                    />
                  ) : null}
                  <span>{layer.name || 'Naamloze laag'}</span>
                </div>
              </label>
            </li>
          ))}
        </ul>
      )}
      <BaseMap
        {...props}
        {...zoom}
        area={polygon}
        mapDataLayers={visibleMapDataLayers}
        autoZoomAndCenter="area"
        categorize={{ categories, categorizeByField }}
        center={center}
        markers={currentMarkers}
        locationProx={locationProx}
      >
      </BaseMap>
      <div className='map-buttons'>
        {ctaButtonElement}
        {countButtonElement}
      </div>
    </div>
  ) : null;
};

ResourceOverviewMap.loadWidget = loadWidget;
export { ResourceOverviewMap };
