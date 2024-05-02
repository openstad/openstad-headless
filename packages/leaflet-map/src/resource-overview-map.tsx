import 'remixicon/fonts/remixicon.css';
import '@utrecht/component-library-css';
import '@utrecht/design-tokens/dist/root.css';
import { Button } from '@utrecht/component-library-react';

import type { PropsWithChildren } from 'react';
import { loadWidget } from '../../lib/load-widget';
import DataStore from '@openstad-headless/data-store/src';
import parseLocation from './lib/parse-location';

import 'leaflet/dist/leaflet.css';
import './css/base-map.css';
import './css/resource-overview-map.css';

import type { MarkerProps } from './types/marker-props';
import type { CategoriesType } from './types/categorize';
import type { ResourceOverviewMapWidgetProps } from './types/resource-overview-map-widget-props';
import { BaseMap } from './base-map';
import React from 'react';
import { LocationType } from '@openstad-headless/leaflet-map/src/types/location.js';

type Point = {
  lat: number;
  lng: number;
};

const ResourceOverviewMap = ({
  categorize = undefined,
  markerHref = undefined,
  countButton = undefined,
  ctaButton = undefined,
  givenResources,
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

  if (categorizeByField) {
    const { data: tags } = datastore.useTags({
      projectId: props.projectId,
      type: categorizeByField,
    });
    if (Array.isArray(tags) && tags.length) {
      categories = {};
      tags.forEach((tag: any) => {
        // TODO: types/Tag does not exist yet
        categories[tag.name] = {
          color: tag.backgroundColor,
          icon: tag.mapIcon,
        };
      });
    }
  }
  let currentMarkers =
    allResources.map((resource: any) => {
      // TODO: types/resource does not exist yet
      let marker: MarkerProps = {
        location: { ...resource.location } || undefined,
      };
      const markerLatLng = parseLocation(marker); // unify location format
      marker.lat = markerLatLng.lat;
      marker.lng = markerLatLng.lng;

      if (marker.lat && marker.lng && markerHref) {
        marker.href = markerHref.replace(/\[id\]/, resource.id);
      }

      if (marker.lat && marker.lng && categorizeByField && categories) {
        let tag = resource.tags?.find((t: any) => t.type == categorizeByField); // TODO: types/Tag does not exist yet
        if (tag) {
          marker.data = { [categorizeByField]: tag.name };
        }
      }
      return marker;
    }) || [];

  let countButtonElement: React.JSX.Element = <></>;
  if (countButton?.show) {
    countButtonElement = (
      <Button
        appearance="primary-action-button"
        className={`osc-resource-overview-map-button osc-first-button`}>
        <section className="resource-counter">
          {resources?.metadata?.totalCount}
        </section>
        <section className="resource-label">
          {countButton.label || 'plannen'}
        </section>
      </Button>
    );
  }

  let ctaButtonElement: React.JSX.Element = <></>;
  if (ctaButton?.show) {
    ctaButtonElement = (
      <Button
        appearance="primary-action-button"
        onClick={(e) => {
          if (ctaButton.href) {
            document.location.href = ctaButton.href;
          }
        }}
        className={`osc-resource-overview-map-button ${
          countButtonElement ? 'osc-second-button' : 'osc-first-button'
        }`}>
        <section className="resource-label">{ctaButton.label}</section>
      </Button>
    );
  }

  const { data: areas } = datastore.useArea({
    projectId: props.projectId,
  });

  let areaId = props?.project?.areaId || false;
  const polygon =
    areaId && Array.isArray(areas) && areas.length > 0
      ? (areas.find((area) => area.id.toString() === areaId) || {}).polygon
      : [];

  function calculateCenter(polygon: Point[]) {
    if (!polygon || polygon.length === 0) {
      return undefined;
    }

    let minX = Infinity;
    let maxX = -Infinity;
    let minY = Infinity;
    let maxY = -Infinity;

    polygon.forEach((point) => {
      if (point.lng < minX) minX = point.lng;
      if (point.lng > maxX) maxX = point.lng;
      if (point.lat < minY) minY = point.lat;
      if (point.lat > maxY) maxY = point.lat;
    });

    const avgLat = (minY + maxY) / 2;
    const avgLng = (minX + maxX) / 2;

    return { lat: avgLat, lng: avgLng };
  }

  let center: LocationType | undefined = undefined;
  if (!!polygon && Array.isArray(polygon) && polygon.length > 0) {
    center = calculateCenter(polygon);
  }

  return (
    <>
      <BaseMap
        {...props}
        area={polygon}
        autoZoomAndCenter="area"
        categorize={{ categories, categorizeByField }}
        center={center}
        markers={currentMarkers}>
        {ctaButtonElement}
        {countButtonElement}
      </BaseMap>
    </>
  );
};

ResourceOverviewMap.loadWidget = loadWidget;
export { ResourceOverviewMap };
