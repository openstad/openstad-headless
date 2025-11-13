import { loadWidget } from '@openstad-headless/lib/load-widget';
import {
  ResourceOverview,
  ResourceOverviewWidgetProps,
} from '@openstad-headless/resource-overview/src/resource-overview';
import React, { useEffect, useState } from 'react';

import '../../resource-overview/src/resource-overview.css';

export type MultiProjectResourceOverviewProps = ResourceOverviewWidgetProps & {
  widgetName?: string;
  selectedProjects?: {
    id: string;
    name: string;
    tags?: string;
    detailPageLink?: string;
    label?: string;
    overviewTitle?: string;
    overviewSummary?: string;
    overviewDescription?: string;
    overviewImage?: string;
    overviewUrl?: string;
    overviewMarkerIcon?: string;
    projectLat?: string;
    projectLng?: string;
    includeProjectsInOverview?: boolean;
    excludeResourcesInOverview?: boolean;
  }[];
  includeProjectsInOverview?: boolean;
  excludeResourcesInOverview?: boolean;
};

function MultiProjectResourceOverview({
  ...props
}: MultiProjectResourceOverviewProps) {
  const [selectedProjectsState, setSelectedProjectsState] = useState(
    props.selectedProjects || []
  );

  const fetchResource = async (url: string) => {
    const response = await fetch(url);
    return response.json();
  };

  useEffect(() => {
    if (props.selectedProjects && props.selectedProjects.length > 0) {
      const updateSelectedProjects = async (selectedProjects: any = []) => {
        const url = `${props?.api?.url}/api/project?includeConfig=1&getBasicInformation=1`;
        const data = await fetchResource(url);

        const updatedProjects = selectedProjects?.map(
          (selectedProject: any) => {
            const project =
              Array.isArray(data) &&
              data.find((p: any) => p.id === selectedProject.id);
            if (project) {
              return {
                ...selectedProject,
                tags: project?.tags || '',
                createdAt: project?.createdAt,
              };
            }
            return selectedProject;
          }
        );

        setSelectedProjectsState(updatedProjects);
      };

      updateSelectedProjects(props.selectedProjects);
    }
  }, [props.selectedProjects]);

  const initFinished = selectedProjectsState.some(
    (project) => typeof project?.createdAt === 'string'
  );

  return !initFinished ? null : (
    <ResourceOverview
      {...props}
      selectedProjects={selectedProjectsState}
      includeProjectsInOverview={props.includeProjectsInOverview}
      excludeResourcesInOverview={props.excludeResourcesInOverview}
    />
  );
}

MultiProjectResourceOverview.loadWidget = loadWidget;
export { MultiProjectResourceOverview };
