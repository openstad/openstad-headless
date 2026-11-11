import DataStore from '@openstad-headless/data-store/src';
import { ResourceOverviewMap } from '@openstad-headless/leaflet-map/src/resource-overview-map.js';
import { ResourceOverviewMapWidgetProps } from '@openstad-headless/leaflet-map/src/types/resource-overview-map-widget-props';
import { loadWidget } from '@openstad-headless/lib/load-widget';
import { PostcodeAutoFillLocation } from '@openstad-headless/ui/src/stem-begroot-and-resource-overview/filter';
import '@utrecht/component-library-css';
import '@utrecht/design-tokens/dist/root.css';
import React, { useCallback, useEffect, useRef, useState } from 'react';

import { buildResourceDetailUrl } from '../../resource-overview/src/lib/resource-detail-url';
import { MapPreviewCard } from '../../resource-overview/src/parts/map-preview-card';
import {
  ResourceOverview,
  ResourceOverviewWidgetProps,
} from '../../resource-overview/src/resource-overview.js';
import './resourceOverviewWithMap.css';

export type ResourceOverviewWithMapWidgetProps = ResourceOverviewWidgetProps &
  ResourceOverviewMapWidgetProps;

const ResourceOverviewWithMap = (props: ResourceOverviewWithMapWidgetProps) => {
  const [filteredResources, setFilteredResources] = useState<any[]>([]);
  const [location, setLocation] = useState<PostcodeAutoFillLocation>(undefined);
  const resourceClickHandlerRef = useRef<
    ((resource: any, index?: number) => void) | null
  >(null);

  const opensInDialog = props.displayType === 'cardgrid';

  const handleMarkerClick = useCallback((resource: any, index: number) => {
    resourceClickHandlerRef.current?.(resource, index);
  }, []);

  const datastore = new DataStore({
    projectId: props.projectId,
    api: props.api,
    config: { api: props.api },
  });
  const previewEnabled =
    !opensInDialog && !!props.resourceOverviewMapWidget?.markerPreviewCard;
  const [selectedMapResource, setSelectedMapResource] = useState<
    { id: number | string; projectId?: number | string } | undefined
  >(undefined);

  useEffect(() => {
    if (!selectedMapResource) return;
    const isStillListed = filteredResources.some(
      (resource: any) => String(resource.id) === String(selectedMapResource.id)
    );
    if (!isStillListed) setSelectedMapResource(undefined);
  }, [filteredResources, selectedMapResource]);

  const mapElement = (
    <ResourceOverviewMap
      {...props}
      {...props.resourceOverviewMapWidget}
      givenResources={
        filteredResources.length > 0 ? filteredResources : undefined
      }
      noFetch={true}
      locationProx={location}
      selectedResourceId={previewEnabled ? selectedMapResource?.id : undefined}
      onMarkerClick={
        opensInDialog
          ? handleMarkerClick
          : previewEnabled
            ? (resource: any) =>
                setSelectedMapResource({
                  id: resource.id,
                  projectId: resource.projectId,
                })
            : undefined
      }
    />
  );

  return (
    <div className="map-wrapper">
      <div className="resourceOverviewWithMap-container">
        <div className="detail-container">
          <ResourceOverview
            {...props}
            onFilteredResourcesChange={setFilteredResources}
            onLocationChange={setLocation}
            onResourceClickHandlerRegister={
              opensInDialog
                ? (handler) => {
                    resourceClickHandlerRef.current = handler;
                  }
                : undefined
            }
            displayMap={false}
          />
        </div>
        {previewEnabled ? (
          <div className="osc-map-preview-wrapper">
            {mapElement}
            {selectedMapResource ? (
              <MapPreviewCard
                datastore={datastore}
                projectId={selectedMapResource.projectId || props.projectId}
                resourceId={selectedMapResource.id}
                detailUrl={buildResourceDetailUrl(
                  props.itemLink,
                  selectedMapResource,
                  props.selectedProjects,
                  document.location
                )}
                summaryMaxLength={props.summaryMaxLength}
                headingLevel={props.headingLevel}
                buttonText={
                  props.resourceOverviewMapWidget?.markerPreviewButtonText
                }
                onClose={() => setSelectedMapResource(undefined)}
              />
            ) : null}
          </div>
        ) : (
          mapElement
        )}
      </div>
    </div>
  );
};

ResourceOverviewWithMap.loadWidget = loadWidget;

export { ResourceOverviewWithMap };
