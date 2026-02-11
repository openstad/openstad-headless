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

const flattenAreaPoints = (input: any): Point[] => {
  if (!Array.isArray(input) || input.length === 0) return [];
  const first = input[0];
  if (first && typeof first.lat === 'number' && typeof first.lng === 'number') {
    return input as Point[];
  }
  return input.flatMap((entry: any) => flattenAreaPoints(entry));
};

const ResourceOverviewMap = ({
  categorize = undefined,
  markerHref = undefined,
  countButton = undefined,
  ctaButton = undefined,
  locationProx = undefined,
  givenResources,
  selectedProjects = [],
  onMarkerClick,
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
      pageSize: 99999,
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
    allResources.map((resource: any, index: number) => {
      // TODO: types/resource does not exist yet
      let marker: MarkerProps = {
        location: resource?.location ? { ...resource.location } : undefined,
      };
      const markerLatLng: any = parseLocation(marker); // unify location format
      marker.lat = markerLatLng.lat;
      marker.lng = markerLatLng.lng;

      const projectPageLink =
        Array.isArray(selectedProjects) && selectedProjects.length > 0
          ? selectedProjects.find(
              (project) => project.id === resource.projectId
            )?.detailPageLink
          : undefined;

      if (marker.lat && marker.lng) {
        if (onMarkerClick) {
          marker.onClick = [
            () => onMarkerClick(resource, index)
          ];
        } else {
            const markerLink = projectPageLink || props.itemLink || markerHref;

            if (markerLink) {
              marker.href = markerLink.replace(/\[id\]/, resource.id);
            }
        }
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

  function calculateCenter(polygon: Point[] | Point[][] | Point[][][]) {
    if (!polygon || polygon.length === 0) {
      return undefined;
    }

    const flatPolygon = flattenAreaPoints(polygon);

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

  if ( !!props?.map && typeof(props?.map) === 'object' ) {
    props.map = {
      ...props.map,
      tilesVariant: props?.tilesVariant || props?.map?.tilesVariant || 'nlmaps',
      customUrl: props?.customUrl || props?.map?.customUrl || '',
    }
  }

  const dataLayerSettings = !!props?.datalayer ? {
    datalayer: props?.datalayer || [],
    enableOnOffSwitching: props?.enableOnOffSwitching || false,
  } : props?.resourceOverviewMapWidget || {};

  return ((polygon && center) || !Number(areaId)) ? (
    <div className='map-container--buttons'>
      <Button appearance='primary-action-button' className='skip-link' onClick={skipMarkers}>Sla kaart over</Button>
      <BaseMap
        {...props}
        {...zoom}
        area={polygon}
        autoZoomAndCenter={props?.map?.autoZoomAndCenter || 'area'}
        categorize={{ categories, categorizeByField }}
        center={center}
        markers={currentMarkers}
        locationProx={locationProx}
        dataLayerSettings={dataLayerSettings}
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
