import './resource-overview.css';
import React, { useCallback, useEffect, useRef, useState } from 'react';
import { Carousel, Icon, Paginator } from '@openstad-headless/ui/src';
//@ts-ignore D.type def missing, will disappear when datastore is ts
import DataStore from '@openstad-headless/data-store/src';
import { Spacer } from '@openstad-headless/ui/src';
import { Image } from '@openstad-headless/ui/src';
import { Dialog } from '@openstad-headless/ui/src';
import { BaseProps, ProjectSettingProps } from '@openstad-headless/types';
import {Filters, PostcodeAutoFillLocation} from '@openstad-headless/ui/src/stem-begroot-and-resource-overview/filter';
import { loadWidget } from '@openstad-headless/lib/load-widget';
import {elipsizeHTML} from '../../lib/ui-helpers';
import { GridderResourceDetail } from './gridder-resource-detail';
import { hasRole } from '@openstad-headless/lib';
import { ResourceOverviewMap } from '@openstad-headless/leaflet-map/src/resource-overview-map';

import '@utrecht/component-library-css';
import '@utrecht/design-tokens/dist/root.css';
import {
  Heading4,
  Paragraph,
  Button,
} from '@utrecht/component-library-react';
import { ResourceOverviewMapWidgetProps, dataLayerArray } from '@openstad-headless/leaflet-map/src/types/resource-overview-map-widget-props';
import { renderRawTemplate } from '@openstad-headless/raw-resource/includes/template-render';
import {TabsContent, TabsList, TabsTrigger, Tabs} from "@openstad-headless/admin-server/src/components/ui/tabs";

// This function takes in latitude and longitude of two locations
// and returns the distance between them as the crow flies (in kilometers)
function calcCrow(coords1: PostcodeAutoFillLocation, coords2: PostcodeAutoFillLocation)
{
  if (!coords1 || !coords2) {
    return 0;
  }

  const coords1Lat = parseFloat(coords1.lat), coords1Lng = parseFloat(coords1.lng), coords2Lat = parseFloat(coords2.lat), coords2Lng = parseFloat(coords2.lng);
  const toRad = (Value: number) => { return Value * Math.PI / 180; };

  var R = 6371;
  var dLat = toRad(coords2Lat-coords1Lat);
  var dLon = toRad(coords2Lng-coords1Lng);
  var lat1 = toRad(coords1Lat);
  var lat2 = toRad(coords2Lat);

  var a = Math.sin(dLat/2) * Math.sin(dLat/2) +
    Math.sin(dLon/2) * Math.sin(dLon/2) * Math.cos(lat1) * Math.cos(lat2);
  var c = 2 * Math.atan2(Math.sqrt(a), Math.sqrt(1-a));
  var d = R * c;
  return d;
}

export type ResourceOverviewWidgetProps = BaseProps &
  ProjectSettingProps & {
    projectId?: string;
  } & {
    resourceOverviewMapWidget?: Omit<
      ResourceOverviewMapWidgetProps,
      keyof BaseProps | keyof ProjectSettingProps | 'projectId'
    > & dataLayerArray;
    renderHeader?: (
      widgetProps: ResourceOverviewWidgetProps,
      resources?: any,
      title?: string,
      displayHeader?: boolean,
      displayMap?: boolean,
      selectedProjects?: any[],
      location?: PostcodeAutoFillLocation,
      displayAsTabs?: boolean,
    ) => React.JSX.Element; renderItem?: (
      resource: any,
      props: ResourceOverviewWidgetProps,
      onItemClick?: () => void
    ) => React.JSX.Element;
    resourceType?: 'resource';
    displayPagination?: boolean;
    displayType?: 'cardrow' | 'cardgrid' | 'raw';
    allowFiltering?: boolean;
    displayTitle?: boolean;
    displayStatusLabel?: boolean;
    titleMaxLength?: number;
    displayRanking?: boolean;
    displayLabel?: boolean;
    displaySummary?: boolean;
    summaryMaxLength?: number;
    displayDescription?: boolean;
    descriptionMaxLength?: number;
    displayArguments?: boolean;
    displayVote?: boolean;
    displayShareButtons?: boolean;
    displayEditLink?: boolean;
    displayCaption?: boolean;
    summaryCharLength?: number;
    displaySorting?: boolean;
    defaultSorting?: string;
    displaySearch?: boolean;
    displaySearchText?: boolean;
    textActiveSearch?: string;
    searchPlaceholder?: string;
    itemLink?: string;
    sorting: Array<{ value: string; label: string }>;
    displayTagFilters?: boolean;
    tagGroups?: Array<{ type: string; label?: string; multiple: boolean; projectId?: any }>;
    displayTagGroupName?: boolean;
    displayBanner?: boolean;
    displayMap?: boolean;
    displayAsTabs?: boolean;
    listTabTitle?: string;
    mapTabTitle?: string;
    itemsPerPage?: number;
    textResults?: string;
    onlyIncludeTagIds?: string;
    onlyIncludeStatusIds?: string;
    rawInput?: string;
    bannerText?: string;
    displayDocuments?: boolean;
    showActiveTags?: boolean;
    documentsTitle?: string;
    documentsDesc?: string;
    displayVariant?: string;
    resetText?: string;
    applyText?: string;
    onFilteredResourcesChange?: (filteredResources: any[]) => void;
    onLocationChange?: (location: PostcodeAutoFillLocation) => void;
    displayLikeButton?: boolean;
    clickableImage?: boolean;
    displayBudget?: boolean;
    displayTags?: boolean;
    selectedProjects?: {
      id: string;
      name: string;
      detailPageLink?: string;
      label?: string;
      tags?: string;
      createdAt?: string;
      overviewTitle?: string;
      overviewSummary?: string;
      overviewDescription?: string;
      overviewImage?: string;
      overviewUrl?: string;
    }[];
    multiProjectResources?: any[];
    includeOrExcludeTagIds?: string;
    includeOrExcludeStatusIds?: string;
    includeProjectsInOverview?: boolean;
    displayLocationFilter?: boolean;
  };

//Temp: Header can only be made when the map works so for now a banner
// If you dont want a banner pas <></> into the renderHeader prop
const defaultHeaderRenderer = (
  widgetProps: ResourceOverviewWidgetProps,
  resources?: any,
  title?: string,
  displayHeader?: boolean,
  displayMap?: boolean,
  selectedProjects?: any[],
  location?: PostcodeAutoFillLocation
) => {
  return (
    <>
      {displayMap &&
        <ResourceOverviewMap
          {...widgetProps}
          {...widgetProps.resourceOverviewMapWidget}
          givenResources={resources}
          selectedProjects={selectedProjects}
          locationProx={location}
        />
      }
      {displayHeader &&
        <section className="osc-resource-overview-title-container">
          <Heading4>{title}</Heading4>
        </section>
      }
    </>
  );
};

const defaultItemRenderer = (
  resource: any,
  props: ResourceOverviewWidgetProps,
  onItemClick?: () => void
) => {
  if (props.displayType === 'raw') {
    if (!props.rawInput) {
      return <Paragraph>Template is nog niet ingesteld</Paragraph>;
    }

    try {
      let render = renderRawTemplate(props, resource, '', false);
      render = render.replace(/&amp;amp;/g, '&');

      return (
        <div
          dangerouslySetInnerHTML={{
            __html: render,
          }}></div>
      );
    } catch (e) {
      console.error('De template kon niet worden geparsed: ', e);
    }

    return <Paragraph>Er is een fout in de template</Paragraph>;
  }

  let defaultImage = '';

  interface Tag {
    name: string;
    defaultResourceImage?: string;
  }

  if (Array.isArray(resource?.tags)) {
    const sortedTags = resource.tags.sort((a: Tag, b: Tag) => a.name.localeCompare(b.name));

    const tagWithImage = sortedTags.find((tag: Tag) => tag.defaultResourceImage);
    defaultImage = tagWithImage?.defaultResourceImage || '';
  }

  const getUrl = () => {
    let location = document.location;

    let urlToUse = props?.itemLink;

    if ( !!props.selectedProjects && props.selectedProjects.length > 0 ) {
      const project = props.selectedProjects.find(project => project.id === resource.projectId);

      if (resource?.id && project) {
        urlToUse = project.detailPageLink;
      } else if ( !resource?.id && project?.overviewUrl) {
        urlToUse = project.overviewUrl;
      }
    }

    let newUrl = urlToUse?.replace('[id]', resource.id);
    if (!newUrl?.startsWith('http')) {
      if (!newUrl?.startsWith('/')) {
        newUrl = `${location.pathname}${location.pathname.endsWith('/') ? '' : '/'
          }${newUrl}`;
      }
      newUrl = `${location.protocol}//${location.host}${newUrl}`;
    }
    return newUrl
  }

  const resourceImages = (Array.isArray(resource.images) && resource.images.length > 0) ? resource.images : [{ url: defaultImage }];
  const hasImages = (Array.isArray(resourceImages) && resourceImages.length > 0 && resourceImages[0].url !== '') ? '' : 'resource-has-no-images';

  const firstStatus = resource.statuses
    ? resource.statuses
    .filter((status: { seqnr: number }) => status.seqnr !== undefined && status.seqnr !== null)
    .sort((a: { seqnr: number }, b: { seqnr: number }) => a.seqnr - b.seqnr)[0] || resource.statuses[0]
    : false;

  const colorClass = firstStatus && firstStatus.color ? `color-${firstStatus.color}` : '';
  const backgroundColorClass = firstStatus && firstStatus.backgroundColor ? `bgColor-${firstStatus.backgroundColor}` : '';

  const statusClasses = `${colorClass} ${backgroundColorClass}`.trim();

  const multiProjectLabel = props.selectedProjects && props.selectedProjects.length > 1
                                              ? props.selectedProjects.find(project => project.id === resource.projectId)?.label
                                              : '';

  const isProjectCard = !resource?.id ? 'project-card' : '';

  return (
    <>
      {props.displayType === 'cardrow' ? (
        <div
          className={`resource-card--link ${hasImages} ${isProjectCard}`} data-projectid={ resource.projectId || '' } >

          <Carousel
            items={resourceImages}
            buttonText={{ next: 'Volgende afbeelding', previous: 'Vorige afbeelding' }}
            itemRenderer={(i) => (
              <Image
                src={i.url}
                imageFooter={
                  props.displayStatusLabel && (
                    <div
                        className={`${hasImages} ${statusClasses}`}
                    >
                      <Paragraph className="osc-resource-overview-content-item-status">
                        {!!multiProjectLabel ? (
                          <span className="status-label">{multiProjectLabel}</span>
                        ) : (
                          resource.statuses?.map((statusTag: any) => (
                            <span className="status-label" key={statusTag.label}>{statusTag.label}</span>
                          ))
                        )}
                      </Paragraph>
                    </div>
                    )
                }
              />
            )}
          />


          <div>
            <Spacer size={1}/>
            {props.displayTitle ? (
               <Heading4>
                 <a href={getUrl()} className="resource-card--link_trigger" dangerouslySetInnerHTML={{__html: elipsizeHTML(resource.title, props.titleMaxLength || 20)}}/>
              </Heading4>
            ) : null}

            {props.displaySummary ? (
              <Paragraph dangerouslySetInnerHTML={{__html: elipsizeHTML(resource.summary, props.summaryMaxLength || 20)}}/>
            ) : null}

            {props.displayDescription ? (
              <Paragraph
                className="osc-resource-overview-content-item-description"
                dangerouslySetInnerHTML={{__html: elipsizeHTML(resource.description, props.descriptionMaxLength || 30)}}
              />
            ) : null}
          </div>

          <div className="osc-resource-overview-content-item-footer">
            {props.displayVote ? (
              <>
                <Icon icon="ri-thumb-up-line" variant="big" text={resource.yes} description='Stemmen voor'/>
                <Icon icon="ri-thumb-down-line" variant="big" text={resource.no} description='Stemmen tegen'/>
              </>
            ) : null}

            {props.displayArguments ? (
              <Icon
                icon="ri-message-line"
                variant="big"
                text={resource.commentCount}
                description='Aantal reacties'
              />
            ) : null}
          </div>
        </div>

      ) : (
        <div className={`resource-card--link ${hasImages} ${isProjectCard}`} data-projectid={ resource.projectId || '' }>
          <Carousel
            items={resourceImages}
            buttonText={{ next: 'Volgende afbeelding', previous: 'Vorige afbeelding' }}
            itemRenderer={(i) => (
              <Image
                src={i.url}
                imageFooter={
                  props.displayStatusLabel && (
                    <div
                      className={`${hasImages} ${statusClasses}`}
                    >
                      <Paragraph className="osc-resource-overview-content-item-status">
                        {!!multiProjectLabel ? (
                          <span className="status-label">{multiProjectLabel}</span>
                        ) : (
                          resource.statuses?.map((statusTag: any) => (
                            <span className="status-label">{statusTag.label}</span>
                          ))
                        )}
                      </Paragraph>
                    </div>
                  )
                }
              />
            )}
          />

          <div>
            <Spacer size={1} />
            {props.displayTitle ? (
              <Heading4>
                <button className="resource-card--link_trigger" onClick={() => onItemClick && onItemClick()} dangerouslySetInnerHTML={{__html: elipsizeHTML(resource.title, props.titleMaxLength || 20)}}></button>
              </Heading4>
            ) : null}

            {props.displaySummary ? (
              <Paragraph dangerouslySetInnerHTML={{__html: elipsizeHTML(resource.summary, props.summaryMaxLength || 20)}}/>
            ) : null}

            {props.displayDescription ? (
              <Paragraph className="osc-resource-overview-content-item-description" dangerouslySetInnerHTML={{__html: elipsizeHTML(resource.description, props.descriptionMaxLength || 30)}}/>
            ) : null}
          </div>

          <div className="osc-resource-overview-content-item-footer">
            {props.displayVote ? (
              <>
                <Icon icon="ri-thumb-up-line" variant="big" text={resource.yes} />
                <Icon icon="ri-thumb-down-line" variant="big" text={resource.no} />
              </>
            ) : null}

            {props.displayArguments ? (
              <Icon
                icon="ri-message-line"
                variant="big"
                text={resource.commentCount}
              />
            ) : null}
          </div>
        </div>
      )}

    </>
  );
};

function ResourceOverviewInner({
  renderItem = defaultItemRenderer,
  allowFiltering = true,
  displayType = 'cardrow',
  displayBanner = false,
  displayMap = false,
  bannerText = 'Plannen',
  renderHeader = defaultHeaderRenderer,
  itemsPerPage = 20,
  textResults = 'Dit zijn de zoekresultaten voor [search]',
  onlyIncludeTagIds = '',
  onlyIncludeStatusIds = '',
  displayDocuments = false,
  showActiveTags = false,
  displayLikeButton = false,
  clickableImage = false,
  displayTags = true,
  displayBudget= true,
  documentsTitle = '',
  documentsDesc = '',
  displayVariant = '',
  onFilteredResourcesChange,
  onLocationChange,
  selectedProjects = [],
  includeOrExcludeTagIds = 'include',
  includeOrExcludeStatusIds = 'include',
  includeProjectsInOverview = false,
  displayAsTabs = false,
  listTabTitle = 'Lijst',
  mapTabTitle = 'Kaart',
  ...props
}: ResourceOverviewWidgetProps) {
  const datastore = new DataStore({
    projectId: props.projectId,
    api: props.api,
  });

  const stringToArray = (str: string) => {
    return str
      .trim()
      .split(',')
      .filter((t) => t && !isNaN(+t.trim()))
      .map((t) => Number.parseInt(t));
  }

  const statusIdsToLimitResourcesTo = stringToArray(onlyIncludeStatusIds);

  const {data: allTags} = datastore.useTags({
    projectId: props.projectId,
    type: ''
  });

  function determineTags(includeOrExclude: string, allTags: any, tagIdsArray: Array<number>) {
    let filteredTagIdsArray: Array<number> = [];
    try {
      if (includeOrExclude === 'exclude' && tagIdsArray.length > 0) {
        const filteredTags = allTags.filter((tag: { id: number }) => !tagIdsArray.includes((tag.id)));
        const filteredTagIds = filteredTags.map((tag: { id: number }) => tag.id);

        filteredTagIdsArray = filteredTagIds;
      } else if (includeOrExclude === 'include') {
        filteredTagIdsArray = tagIdsArray;
      }

      const filteredTagsIdsString = filteredTagIdsArray.join(',');

      return {
        tagsString: filteredTagsIdsString || '',
        tags: filteredTagIdsArray || []
      };

    } catch (error) {
      console.error('Error processing tags:', error);

      return {
        tagsString: '',
        tags: []
      };
    }
  }

  useEffect(() => {
    const {
      tags: filteredTagIdsArray
    } = determineTags(includeOrExcludeTagIds, allTags, stringToArray(onlyIncludeTagIds));

    setTagIdsToLimitResourcesTo(filteredTagIdsArray);
  }, [allTags]);

  const [tagIdsToLimitResourcesTo, setTagIdsToLimitResourcesTo] = useState< Array<number> >([]);

  const urlParams = new URLSearchParams(window.location.search);
  const urlTagIds = urlParams.get('tagIds');
  const urlStatusIds = urlParams.get('statusIds');

  const urlTagIdsArray = urlTagIds ? stringToArray(urlTagIds) : undefined;
  const urlStatusIdsArray = urlStatusIds ? stringToArray(urlStatusIds) : undefined;

  const [open, setOpen] = React.useState(false);
  const initStatuses = urlStatusIdsArray && urlStatusIdsArray.length > 0 ? urlStatusIdsArray : statusIdsToLimitResourcesTo || [];

  useEffect(() => {
    const initTags = Array.from(new Set([...(urlTagIdsArray || []), ...tagIdsToLimitResourcesTo]) )

    const includeTags = includeOrExcludeTagIds === 'include'
      ? initTags
      : urlTagIdsArray || [];

    const excludeTags = includeOrExcludeTagIds === 'exclude' ? stringToArray(onlyIncludeTagIds) : [];

    setIncludeTags(includeTags);
    setTags(includeTags);

    setExcludeTags(excludeTags);
  }, [tagIdsToLimitResourcesTo.length]);

  const [includeTags, setIncludeTags] = useState<number[]>([]);
  const [excludeTags, setExcludeTags] = useState<number[]>([]);

  // Filters that when changed reupdate the useResources value automatically
  const [search, setSearch] = useState<string>('');
  const [statuses, setStatuses] = useState<number[]>(initStatuses);
  const [tags, setTags] = useState<number[]>([]);
  const [page, setPage] = useState<number>(0);
  const [totalPages, setTotalPages] = useState(0);
  const [pageSize, setPageSize] = useState<number>(itemsPerPage || 10);
  const [sort, setSort] = useState<string | undefined>(
    props.defaultSorting || undefined
  );
  const [location, setLocation] = useState<PostcodeAutoFillLocation>(undefined);

  const [resources, setResources] = useState< Array<any> >([]);
  const [filteredResources, setFilteredResources] = useState< Array<any> >([]);

  const projectIds = selectedProjects?.map(project => project.id) || [];

  const { data: resourcesWithPagination } = datastore.useResources({
    pageSize: 999999,
    ...props,
    search,
    tags: [],
    sort,
    projectIds: projectIds || [],
    allowMultipleProjects: selectedProjects && selectedProjects.length > 1
  });

  useEffect(() => {
    if ( JSON.stringify(tags) !== JSON.stringify(includeTags) ) {
      const tagsForIncluding = tags.map((tag) => typeof(tag) === 'string' ? parseInt(tag, 10) : tag)
      setIncludeTags(tagsForIncluding)
    }
  }, [tags])

  const [resourceDetailIndex, setResourceDetailIndex] = useState<number>(0);

  useEffect(() => {
    if (resourcesWithPagination) {
      setResources(resourcesWithPagination.records || []);
    }
  }, [resourcesWithPagination, pageSize]);

  useEffect(() => {
    // @ts-ignore
    const intTags = tags.map(tag => parseInt(tag, 10));

    const groupedTags: { [key: string]: number[] } = {};

    intTags.forEach(tagId => {
      // @ts-ignore
      const tag = allTags.find(tag => tag.id === tagId);
      if (tag) {
        const tagType = tag.type;
        if (!groupedTags[tagType]) {
          groupedTags[tagType] = [];
        }
        groupedTags[tagType].push(tagId);
      }
    });

    const allResources: any = [];

    if ( includeProjectsInOverview && selectedProjects && selectedProjects.length > 0 ) {
      selectedProjects.forEach((project) => {
        const tagsArray = project?.tags ? project.tags.split(',').map(tag => tag.trim()) : [];
        const tags = tagsArray.map(tag => {
          const foundTag = allTags.find((t: {id: number}) => t.id === parseInt(tag));
          return foundTag ? foundTag : null;
        })
        .filter(tag => tag !== null);

        const projectObject = {
          title: project?.overviewTitle || '',
          summary: project?.overviewSummary || '',
          description: project?.overviewDescription || '',
          images: [
            {
              "url": project?.overviewImage || ''
            }
          ],
          overviewUrl: project?.overviewUrl || '',
          projectId: project.id,
          createdAt: project?.createdAt || '',
          tags: tags,
          uniqueId: `project-${project.id}`,
        }

        if (search) {
          const searchLower = search.toLowerCase();
          if (
            !projectObject.title.toLowerCase().includes(searchLower) &&
            !projectObject.summary.toLowerCase().includes(searchLower) &&
            !projectObject.description.toLowerCase().includes(searchLower)
          ) {
            return;
          }
        }

        allResources.push(projectObject);
      });
    }

    const uniqueResources = allResources?.filter((resource: any, index: number, self: any) => {
      if (resource.uniqueId) {
        return index === self.findIndex((t: any) => t.uniqueId === resource.uniqueId);
      }
      return true;
    });

    const combinedResources = [...uniqueResources, ...resources];

    const filtered = combinedResources && (
      combinedResources.filter((resource: any) => {
          const hasExcludedTag = resource.tags?.some((tag: { id: number }) =>
            excludeTags.includes(tag.id)
          );
          if (hasExcludedTag) return false;

          if (includeTags.length > 0) {
            const hasIncludedTag = resource.tags?.some((tag: { id: number }) =>
              includeTags.includes(tag.id)
            );
            return hasIncludedTag;
          }

          return true;
        })
    )
      ?.filter((resource: any) => {
        if (!location) return true;
        if (!resource?.location?.lat || !resource?.location?.lng) return false;

        const resourceLocation: PostcodeAutoFillLocation = {
          lat: resource.location.lat.toString(),
          lng: resource.location.lng.toString(),
        };
        const distance = calcCrow(location, resourceLocation);
        return distance <= (location?.proximity || 999);
      })
        ?.filter((resource: any) => {
          if (!statusIdsToLimitResourcesTo?.length) return true;

          const hasMatchingStatus = resource.statuses?.some((o: { id: number }) =>
            statusIdsToLimitResourcesTo.includes(o.id)
          );

          return includeOrExcludeStatusIds === 'include' === hasMatchingStatus;
        })
        ?.sort((a: any, b: any) => {
          if (sort === 'createdAt_desc') {
            return new Date(b.createdAt).getTime() - new Date(a.createdAt).getTime();
          }
          if (sort === 'createdAt_asc') {
            return new Date(a.createdAt).getTime() - new Date(b.createdAt).getTime();
          }
          if ( projectIds.length > 0 ) {
            if (sort === 'title') {
              return a.title.localeCompare(b.title);
            }
            if (sort === 'votes_desc') {
              return b.yes - a.yes;
            }
            if (sort === 'votes_asc' || sort === 'ranking') {
              return a.yes - b.yes;
            }
            if (sort === 'random') {
              return Math.random() - 0.5;
            }
          }
          return 0;
        });

    setFilteredResources(filtered);
  }, [resources, tags, statuses, search, sort, allTags, excludeTags, includeTags, location]);

  useEffect(() => {
    if (filteredResources) {
      const filtered: any = filteredResources || [];
      const totalPagesCalc = Math.ceil(filtered?.length / pageSize);

      if (totalPagesCalc !== totalPages) {
        setTotalPages(totalPagesCalc);
      }

      setPage(0);

      if (onFilteredResourcesChange) {
        onFilteredResourcesChange(filtered);
      }

      if (onLocationChange) {
        onLocationChange(location);
      }
    }
  }, [filteredResources]);

  const { data: currentUser } = datastore.useCurrentUser({ ...props });

  const onResourceClick = useCallback(
    (resource: any, index: number) => {
      if (displayType === 'cardrow') {
        let urlToUse = props.itemLink;

        if ( selectedProjects.length > 0 ) {
          const project = selectedProjects.find(project => project.id === resource.projectId);

          if ( resource?.id && project) {
            urlToUse = project.detailPageLink;
          } else if ( !resource?.id && project?.overviewUrl) {
            urlToUse = project.overviewUrl;
          }
        }

        if (!urlToUse) {
          console.error('Link to child resource is not set');
        } else {
          let location = document.location;
          let newUrl = urlToUse.replace('[id]', resource.id);
          if (!newUrl.startsWith('http')) {
            if (!newUrl.startsWith('/')) {
              newUrl = `${location.pathname}${location.pathname.endsWith('/') ? '' : '/'
                }${newUrl}`;
            }
            newUrl = `${location.protocol}//${location.host}${newUrl}`;
          }
          document.location.href = newUrl;
        }
      }

      if (displayType === 'cardgrid') {
        setResourceDetailIndex(index);
        setOpen(true);
      }
    },
    [displayType, props.itemLink]
  );

  const filterNeccesary =
    allowFiltering &&
    (props.displaySearch || props.displaySorting || props.displayTagFilters || props.displayLocationFilter);

  const getDisplayVariant = (variant: string) => {
    if (!variant) {
      return ' ';
    }
    return ` --${variant}`;
  }

  const randomIdRef = useRef(Math.random().toString(36).replace('0.', 'container_'));
  const randomId = randomIdRef.current;

  const scrollToTop = (randomId: string) => {
    setTimeout(() => {
      const divElement = document.getElementById(randomId);

      if (divElement) {
        divElement.scrollIntoView({ block: "start", behavior: "auto" });
      }
    }, 200);
  }

  const overviewSection = (
    <section className="osc-resource-overview-resource-collection" id={randomId}>
      {filteredResources &&
        filteredResources
          ?.slice(page * pageSize, (page + 1) * pageSize)
          ?.map((resource: any, index: number) => {
            return (
              <React.Fragment key={`resource-item-${resource?.id || resource?.uniqueId}`}>
                {renderItem(resource, { ...props, displayType, selectedProjects }, () => {
                  onResourceClick(resource, index);
                })}
              </React.Fragment>
            );
          })
      }
    </section>
  );

  return (
    <>
      <Dialog
        open={open}
        onOpenChange={setOpen}
        children={
          <Carousel
            startIndex={resourceDetailIndex}
            items={filteredResources && filteredResources?.length > 0 ? filteredResources : []}
            buttonText={{ next: 'Volgende afbeelding', previous: 'Vorige afbeelding' }}
            itemRenderer={(item) => (
              <GridderResourceDetail
                resource={item}
                currentUser={currentUser}
                displayDocuments={displayDocuments}
                documentsTitle={documentsTitle}
                documentsDesc={documentsDesc}
                displayTags={displayTags}
                displayBudget={displayBudget}
                displayLikeButton={displayLikeButton}
                clickableImage={clickableImage}
                onRemoveClick={(resource) => {
                  try {
                    resource
                      .delete(resource.id)
                      .then(() => setOpen(false))
                      .catch((e: any) => {
                        console.error(e);
                      });
                  } catch (e) {
                    console.error(e);
                  }
                }}
                {...props}
              />
            )}></Carousel>
        }
      />

      <div className={`osc ${getDisplayVariant(displayVariant)}`}>

        {displayBanner || displayMap ? renderHeader(props, (filteredResources || []), bannerText, displayBanner, (displayMap && !displayAsTabs), selectedProjects, location) : null}

        <section
          className={`osc-resource-overview-content ${!filterNeccesary ? 'full' : ''
            }`}>
          {props.displaySearchText ? (
            <div className="osc-resourceoverview-search-container col-span-full">
              {props.textActiveSearch && search && (
                <Paragraph className="osc-searchtext" role="status">
                  {props.textActiveSearch
                    .replace('[search]', search)
                    .replace('[zoekterm]', search)}
                </Paragraph>
              )}
            </div>
          ) : null}

          {filterNeccesary && datastore ? (
            <Filters
              {...props}
              className="osc-flex-columned"
              tagsLimitation={tagIdsToLimitResourcesTo}
              dataStore={datastore}
              sorting={props.sorting || []}
              displaySorting={props.displaySorting || false}
              defaultSorting={props.defaultSorting || ''}
              displayTagFilters={props.displayTagFilters || false}
              displaySearch={props.displaySearch || false}
              displayLocationFilter={props.displayLocationFilter || false}
              searchPlaceholder={props.searchPlaceholder || 'Zoeken'}
              resetText={props.resetText || 'Reset'}
              applyText={props.applyText || 'Toepassen'}
              tagGroups={props.tagGroups || []}
              itemsPerPage={itemsPerPage}
              resources={resources}
              showActiveTags={showActiveTags}
              onUpdateFilter={(f) => {
                if (f.tags.length === 0) {
                  setTags(includeOrExcludeTagIds === 'include' ? tagIdsToLimitResourcesTo : []);
                } else {
                  setTags(f.tags);
                }
                if (['createdAt_desc', 'createdAt_asc'].includes(f.sort)) {
                  setSort(f.sort);
                }
                setSearch(f.search.text);
                setLocation(f.location)
              }}
              preFilterTags={urlTagIdsArray}
            />
          ) : null}

          { displayAsTabs ? (
            <div className="osc-resource-overview-tabs-container">
              <TabsList>
                <TabsTrigger value="list"><Icon icon="ri-list-unordered" />{listTabTitle}</TabsTrigger>
                <TabsTrigger value="map"><Icon icon="ri-map-pin-line" />{mapTabTitle}</TabsTrigger>
              </TabsList>
              <TabsContent value="list">
                {overviewSection}
              </TabsContent>
              <TabsContent value="map">
                {renderHeader(props, (filteredResources || []), bannerText, false, true, selectedProjects, location)}
              </TabsContent>
            </div>
          ) : (
            overviewSection
          )}

        </section>
        {props.displayPagination && (
          <>
            <Spacer size={4} />
            <div className="osc-resource-overview-paginator col-span-full">
              <Paginator
                page={page || 0}
                totalPages={totalPages || 1}
                onPageChange={(newPage) => {
                  setPage(newPage);
                  scrollToTop(randomId);
                }}
              />
            </div>
          </>
        )}
      </div>
    </>
  );
}

function ResourceOverview(props: ResourceOverviewWidgetProps) {
  const { displayAsTabs } = props;

  return displayAsTabs ? (
    <Tabs defaultValue="list">
      <ResourceOverviewInner {...props} />
    </Tabs>
    ) : (
    <ResourceOverviewInner {...props} />
  );
}

ResourceOverview.loadWidget = loadWidget;
export { ResourceOverview };
