import 'remixicon/fonts/remixicon.css';
import "@utrecht/component-library-css";
import "@utrecht/design-tokens/dist/root.css";
import { Button } from "@utrecht/component-library-react";

import type { PropsWithChildren } from 'react';
import { useState, useEffect } from 'react';
import { loadWidget } from '../../lib/load-widget';
import DataStore from '@openstad-headless/data-store/src';
import parseLocation from './lib/parse-location';

import 'leaflet/dist/leaflet.css';
import './css/base-map.css';
import './css/resource-overview-map.css';

import type { MarkerProps } from './types/marker-props';
import type { CategoriesType } from './types/categorize';
import type {ResourceOverviewMapWidgetProps} from './types/resource-overview-map-widget-props'
import { BaseMap } from './base-map';

const ResourceOverviewMap = ({
  categorize = undefined,
  markerHref = undefined,
  countButton = undefined,
  ctaButton = undefined,
  ...props
}: PropsWithChildren<ResourceOverviewMapWidgetProps>) => {

  const datastore = new DataStore({
    projectId: props.projectId,
    api: props.api,
    config: { api: props.api },
  });

  const { data: resources } = datastore.useResources({
    projectId: props.projectId,
  });

  const allResources = resources?.records || [];

  let categorizeByField = categorize?.categorizeByField;
  let categories: CategoriesType =  {};

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

  let buttons = [];
  if (countButton?.show) {
    let countbutton = (
      <Button
      appearance='primary-action-button'
      className={`osc-resource-overview-map-button osc-first-button`}
        >
        <section className="resource-counter">
        {resources?.metadata?.totalCount}
      </section>
        <section
      className="resource-label">
        {countButton.label || 'plannen'}
      </section>

        </Button>
    );
    buttons.push(countbutton)
  }
  if (ctaButton?.show) {
    let countbutton = (
      <Button
      appearance='primary-action-button'
      onClick={(e) => document.location.href = ctaButton.href}
      className={`osc-resource-overview-map-button ${buttons.length ? 'osc-second-button' : 'osc-first-button'}`}
        >
        <section
      className="resource-label">
        {ctaButton.label}
      </section>

        </Button>
    );
    buttons.push(countbutton)
  }

  return (
    <>
      <BaseMap
        {...props}
        categorize={{ categories, categorizeByField }}
        markers={currentMarkers}
      >
      {buttons}
    </BaseMap>
    </>
  );
};

ResourceOverviewMap.loadWidget = loadWidget;
export { ResourceOverviewMap };
