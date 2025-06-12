import React, { useEffect, useState, useRef } from 'react';
import { loadWidget } from '@openstad-headless/lib/load-widget';
import { ResourceOverviewWidgetProps, ResourceOverview } from '@openstad-headless/resource-overview/src/resource-overview';
import '../../resource-overview/src/resource-overview.css';
import DataStore from "@openstad-headless/data-store/src";

export type MultiProjectResourceOverviewProps = ResourceOverviewWidgetProps & {
  widgetName?: string;
  selectedProjects?: {
    id: string;
    name: string;
    detailPageLink?: string;
    label?: string;
    overviewTitle?: string;
    overviewSummary?: string;
    overviewDescription?: string;
    overviewImage?: string;
    overviewUrl?: string;
  }[];
  includeProjectsInOverview?: boolean;
};

function MultiProjectResourceOverview({
  ...props
}: MultiProjectResourceOverviewProps) {
  const [resources, setResources] = useState<Array<any>>([]);
  const [tags, setTags] = useState<Array<any>>([]);

  const resourceCache = useRef(new Map());
  const tagsCache = useRef(new Map());

  const fetchResource = async (url: string) => {
    const response = await fetch(url);
    return response.json();
  };

  useEffect(() => {
    const fetchResources = async () => {
      try {
        const newProjects = props.selectedProjects && props.selectedProjects.filter(project => !resourceCache.current.has(project.id)) || [];

        if (newProjects.length === 0) return;

        const projectResources = await Promise.all(
          newProjects.map(async (project) => {
            const url = `${props?.api?.url}/api/project/${project.id}/resource?includeConfig=1&includeUserVote=1&includeVoteCount=1`;
            const data = await fetchResource(url);

            resourceCache.current.set(project.id, data);

            return data;
          })
        );

        const allResources = [
          ...Array.from(resourceCache.current.values()).flat()
        ];

        const uniqueResources = allResources.filter((resource, index, self) =>
          index === self.findIndex((t) => t.id === resource.id)
        );

        setResources(uniqueResources);
      } catch (error) {
        console.error("Error fetching resources:", error);
      }
    };

    fetchResources();
  }, [props.selectedProjects]);

  useEffect(() => {
    const fetchTags = async () => {
      try {
        const newTagGroups =
          props.tagGroups?.filter(
            tagGroup => !tagsCache.current.has(`${tagGroup.projectId}-${tagGroup.type}`)
          ) || [];

        if (newTagGroups.length === 0) return;

        const fetchedTags = await Promise.all(
          newTagGroups.map(async (tagGroup) => {
            const url = `${props?.api?.url}/api/project/${tagGroup.projectId}/tag?type=${tagGroup.type}`;
            const data = await fetchResource(url);

            tagsCache.current.set(`${tagGroup.projectId}-${tagGroup.type}`, data);
            return data;
          })
        );

        const allTags = [...Array.from(tagsCache.current.values()).flat()];

        setTags(allTags);
      } catch (error) {
        console.error("Error fetching tags:", error);
      }
    };

    fetchTags();
  }, [props.tagGroups]);

  return (
    <ResourceOverview
      {...props}
      selectedProjects={props.selectedProjects}
      includeProjectsInOverview={props.includeProjectsInOverview}
    />
  );
}

MultiProjectResourceOverview.loadWidget = loadWidget;
export { MultiProjectResourceOverview };
