import './resource-overview.css';
import React, { useCallback, useEffect, useMemo, useRef, useState } from 'react';
import { Carousel, Icon, Paginator, Pill } from '@openstad-headless/ui/src';
//@ts-ignore D.type def missing, will disappear when datastore is ts
import DataStore from '@openstad-headless/data-store/src';
import { Spacer } from '@openstad-headless/ui/src';
import { Image } from '@openstad-headless/ui/src';
import { Dialog } from '@openstad-headless/ui/src';
import { BaseProps, ProjectSettingProps } from '@openstad-headless/types';
import { Filters, PostcodeAutoFillLocation } from '@openstad-headless/ui/src/stem-begroot-and-resource-overview/filter';
import { loadWidget } from '@openstad-headless/lib/load-widget';
import { elipsizeHTML } from '../../lib/ui-helpers';
import { GridderResourceDetail } from './gridder-resource-detail';
import { deterministicRandomSort, getScopedSessionRandomSortSeed, canLikeResource, hasRole } from '@openstad-headless/lib';
import { ResourceOverviewMap } from '@openstad-headless/leaflet-map/src/resource-overview-map';

import '@utrecht/component-library-css';
import '@utrecht/design-tokens/dist/root.css';
import {
  Heading,
  Heading4,
  Paragraph,
  Button,
} from '@utrecht/component-library-react';
import { ResourceOverviewMapWidgetProps, dataLayerArray } from '@openstad-headless/leaflet-map/src/types/resource-overview-map-widget-props';
import { renderRawTemplate } from '@openstad-headless/raw-resource/includes/template-render';
import { TabsContent, TabsList, TabsTrigger, Tabs } from "@openstad-headless/admin-server/src/components/ui/tabs";
import {Likes, LikeWidgetProps } from '@openstad-headless/likes/src/likes';

// This function takes in latitude and longitude of two locations
// and returns the distance between them as the crow flies (in kilometers)
function calcCrow(coords1: PostcodeAutoFillLocation, coords2: PostcodeAutoFillLocation) {
  if (!coords1 || !coords2) {
    return 0;
  }

  const coords1Lat = parseFloat(coords1.lat), coords1Lng = parseFloat(coords1.lng), coords2Lat = parseFloat(coords2.lat), coords2Lng = parseFloat(coords2.lng);
  const toRad = (Value: number) => { return Value * Math.PI / 180; };

  var R = 6371;
  var dLat = toRad(coords2Lat - coords1Lat);
  var dLon = toRad(coords2Lng - coords1Lng);
  var lat1 = toRad(coords1Lat);
  var lat2 = toRad(coords2Lat);

  var a = Math.sin(dLat / 2) * Math.sin(dLat / 2) +
    Math.sin(dLon / 2) * Math.sin(dLon / 2) * Math.cos(lat1) * Math.cos(lat2);
  var c = 2 * Math.atan2(Math.sqrt(a), Math.sqrt(1 - a));
  var d = R * c;
  return d;
}

const getResourceStableKey = (resource: any) => {
  return String(
    resource?.uniqueId ||
    resource?.id ||
    `${resource?.projectId || ''}:${resource?.title || ''}:${resource?.createdAt || ''}`
  );
};

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
      headingLevel?: string,
      displayAsTabs?: boolean,
    ) => React.JSX.Element; renderItem?: (
      resource: any,
      props: ResourceOverviewWidgetProps,
      onItemClick?: () => void,
      refreshLikes?: () => void,
    ) => React.JSX.Element;
    resourceType?: 'resource';
    displayPagination?: boolean;
    displayType?: 'cardrow' | 'cardgrid' | 'raw';
    allowFiltering?: boolean;
    displayTitle?: boolean;
    headingLevel?: string;
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
    autoApply?: boolean;
    defaultSorting?: string;
    displaySearch?: boolean;
    displaySearchText?: boolean;
    textActiveSearch?: string;
    searchPlaceholder?: string;
    itemLink?: string;
    sorting: Array<{ value: string; label: string }>;
    displayTagFilters?: boolean;
    tagGroups?: Array<{ type: string; label?: string; multiple: boolean; projectId?: any, inlineOptions?: boolean }>;
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
    onMarkerResourceClick?: (resource: any, index: number) => void;
    displayLikeButton?: boolean;
    displayDislike?: boolean;
    clickableImage?: boolean;
    displayBudget?: boolean;
    displayTags?: boolean;
    displayTagIcon?: boolean;
    displayOverviewTagGroups?: boolean;
    overviewTagGroups?: string[];
    dialogTagGroups?: string[];
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
      overviewMarkerIcon?: string;
      projectLat?: string;
      projectLng?: string;
      includeProjectsInOverview?: boolean;
      excludeResourcesInOverview?: boolean;
    }[];
    multiProjectResources?: any[];
    includeOrExcludeTagIds?: string;
    includeOrExcludeStatusIds?: string;
    includeProjectsInOverview?: boolean;
    displayLocationFilter?: boolean;
    excludeResourcesInOverview?: boolean;
    filterBehavior?: string;
    filterBehaviorInclude?: string;
    onlyShowTheseTagIds?: string;
    displayCollapsibleFilter?: boolean;
    displayUser?: boolean;
    displayCreatedAt?: boolean;
    allowLikingInOverview?: boolean;
    likeWidget?: Omit<
      LikeWidgetProps,
      keyof BaseProps | keyof ProjectSettingProps | 'resourceId'
    >;
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
  location?: PostcodeAutoFillLocation,
  headingLevel?: string,
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
          onMarkerClick={
            widgetProps.displayType === 'cardgrid'
              ? (resource, index) => {
                  widgetProps.onMarkerResourceClick?.(resource, index);
                }
              : undefined
          }
        />
      }
      {displayHeader &&
        <section className="osc-resource-overview-title-container">
            <Heading level={Number(headingLevel) || 4} appearance="utrecht-heading-4">{title}</Heading>
        </section>
      }
    </>
  );
};

const defaultItemRenderer = (
  resource: any,
  props: ResourceOverviewWidgetProps,
  onItemClick?: () => void,
  refreshLikes?: () => void,
) => {
  const canLike = canLikeResource(resource);
  const allowLikingInOverview = !!props.allowLikingInOverview;

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

    if (!!props.selectedProjects && props.selectedProjects.length > 0) {
      const project = props.selectedProjects.find(project => project.id === resource.projectId);

      if (resource?.id && project) {
        urlToUse = project.detailPageLink;
      } else if (!resource?.id && project?.overviewUrl) {
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

  let resourceFilteredStatuses = Array.isArray(resource?.statuses)
    ? resource.statuses.sort((a: { seqnr?: number }, b: { seqnr?: number }) => {
        if (a.seqnr === undefined || a.seqnr === null) return 1;
        if (b.seqnr === undefined || b.seqnr === null) return -1;
        return a.seqnr - b.seqnr;
      })
    : [];

  const firstStatus = resourceFilteredStatuses && resourceFilteredStatuses.length > 0 ? resourceFilteredStatuses[0] : null;

  const colorClass = firstStatus && firstStatus.color ? `color-${firstStatus.color}` : '';
  const backgroundColorClass = firstStatus && firstStatus.backgroundColor ? `bgColor-${firstStatus.backgroundColor}` : '';

  const statusClasses = `${colorClass} ${backgroundColorClass}`.trim();

  const multiProjectLabel = props.selectedProjects && props.selectedProjects.length > 1
    ? props.selectedProjects.find(project => project.id === resource.projectId)?.label
    : '';

  const isProjectCard = !resource?.id ? 'project-card' : '';

  const overviewTagGroups = props.overviewTagGroups || [];
  const displayOverviewTagGroups = props.displayOverviewTagGroups || [];

  let resourceFilteredTags = (overviewTagGroups && Array.isArray(overviewTagGroups) && Array.isArray(resource?.tags))
    ? resource?.tags.filter((tag: { type: string }) => overviewTagGroups.includes(tag.type))
    : (Array.isArray(resource?.tags) ? resource.tags : []);

  resourceFilteredTags = resourceFilteredTags?.length
    ? resourceFilteredTags?.sort((a: { seqnr?: number }, b: { seqnr?: number }) => {
      if (a.seqnr === undefined || a.seqnr === null) return 1;
      if (b.seqnr === undefined || b.seqnr === null) return -1;
      return a.seqnr - b.seqnr;
    })
    : [];

  const firstTag = resourceFilteredTags && resourceFilteredTags.length > 0 ? resourceFilteredTags[0] : null;
  const MapIconImage = firstTag && firstTag.mapIcon ? firstTag.mapIcon : false;

  const TileFooter = (
    { doVote }: { doVote?: (value: string) => any }
  ) => {
    const vote = async (sentiment: string) => {
      if (doVote) {
        await doVote(sentiment)
        refreshLikes && await refreshLikes();
      }
    }

    return (
      <div className={`osc-resource-overview-content-item-footer ${doVote ? 'liking-allowed' : ''}`}>
        {props.likeWidget?.variant != 'micro-score' && props.displayVote && (
          <>
            <Icon icon="ri-thumb-up-line" variant="big" text={resource.yes} description='Stemmen voor' onClick={() => vote('yes')}/>

            {props.likeWidget?.displayDislike &&
              <Icon icon="ri-thumb-down-line" variant="big" text={resource.no} description='Stemmen tegen' onClick={() => vote('no')}/>}
          </>
        )}

        {props.likeWidget?.variant == 'micro-score' && props.displayVote && (
          <div className="micro-score-container">
            <Icon icon="ri-thumb-up-line" variant="big" description='Stemmen voor' onClick={() => vote('yes')}/>
            <Paragraph className="votes-score">{resource.netPositiveVotes}</Paragraph>
            {props.likeWidget?.displayDislike &&
              <Icon icon="ri-thumb-down-line" variant="big" description='Stemmen tegen' onClick={() => vote('no')}/>}
          </div>
        )}

        {props.displayArguments ? (
          <Icon
            icon="ri-message-line"
            variant="big"
            text={resource.commentCount}
            description='Aantal reacties'
          />
        ) : null}
      </div>
    );
  }

  return (
    <>
      {props.displayType === 'cardrow' ? (
        <div
          className={`resource-card--link ${hasImages} ${isProjectCard}`} data-projectid={resource.projectId || ''} >

          <div>
            <Spacer size={1} />
            {props.displayTitle ? (
              <Heading level={Number(props.headingLevel) || 4} appearance="utrecht-heading-4">
                <a href={getUrl()} className="resource-card--link_trigger" dangerouslySetInnerHTML={{ __html: elipsizeHTML(resource.title, props.titleMaxLength || 20) }} />
              </Heading>
            ) : null}

            {(displayOverviewTagGroups && resourceFilteredTags.length > 0) && (
              <>
                <Spacer size={.5} />
                <div className="pill-grid">
                  {(resourceFilteredTags as Array<{ type: string; name: string }>)
                    ?.filter((t) => t.type !== 'status')
                    ?.map((t) => <Pill text={t.name} />)}
                </div>
              </>
            )}

            {props.displaySummary ? (
              <Paragraph dangerouslySetInnerHTML={{ __html: elipsizeHTML(resource.summary, props.summaryMaxLength || 20) }} />
            ) : null}

            {props.displayDescription ? (
              <Paragraph
                className="osc-resource-overview-content-item-description"
                dangerouslySetInnerHTML={{ __html: elipsizeHTML(resource.description, props.descriptionMaxLength || 30) }}
              />
            ) : null}
          </div>

          <div className="osc-resource-overview-content-date-user">
            <Paragraph className="data-user-container">
              {props.displayUser && resource.user && (
                <span className="created-by">
                  {resource.user.displayName}
                </span>
              )}

              { props.displayCreatedAt && props.displayUser && (
                <span className="join-text">{props.displayCreatedAt && (` op `)}</span>
              )}

              {props.displayCreatedAt && resource.createdAt && (
                <span className="created-at">
                  {new Date(resource.createdAt).toLocaleDateString('nl-NL', {
                    year: 'numeric',
                    month: 'long',
                    day: 'numeric',
                  })}
                </span>
              )}
            </Paragraph>
          </div>

          { allowLikingInOverview ? (
            <Likes
              {...props.likeWidget}
              resourceId={resource.id}
              projectId={props.projectId}
              {...props}
              disabled={!canLike}
              refreshResourceLikes={refreshLikes}
            >
              {(doVote) => (
                <TileFooter
                  doVote={doVote}
                />
              )}
            </Likes>
          ) : (
            <TileFooter />
          )}

          <Carousel
            items={resourceImages}
            buttonText={{ next: 'Volgende afbeelding', previous: 'Vorige afbeelding' }}
            className="osc-carousel-container"
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
                          resourceFilteredStatuses?.map((statusTag: any) => (
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

          {props.displayTagIcon && firstTag && MapIconImage && (
            <div className="resource-card--link_tagicon">
              <Image
                src={MapIconImage}
                alt={firstTag.name ? `Icoon voor ${firstTag.name}` : 'Tag icoon'}
              />
            </div>
          )}

        </div>

      ) : (
        <div className={`resource-card--link ${hasImages} ${isProjectCard}`} data-projectid={resource.projectId || ''}>

          <div>
            <Spacer size={1} />
            {props.displayTitle ? (
              <Heading level={Number(props.headingLevel) || 4} appearance="utrecht-heading-4">
                <button className="resource-card--link_trigger" onClick={() => onItemClick && onItemClick()} dangerouslySetInnerHTML={{ __html: elipsizeHTML(resource.title, props.titleMaxLength || 20) }}></button>
              </Heading>
            ) : null}

            {(displayOverviewTagGroups && resourceFilteredTags.length > 0) && (
              <>
                <Spacer size={.5} />
                <div className="pill-grid">
                  {(resourceFilteredTags as Array<{ type: string; name: string }>)
                    ?.filter((t) => t.type !== 'status')
                    ?.map((t) => <Pill text={t.name} />)}
                </div>
              </>
            )}

            {props.displaySummary ? (
              <Paragraph dangerouslySetInnerHTML={{ __html: elipsizeHTML(resource.summary, props.summaryMaxLength || 20) }} />
            ) : null}

            {props.displayDescription ? (
              <Paragraph className="osc-resource-overview-content-item-description" dangerouslySetInnerHTML={{ __html: elipsizeHTML(resource.description, props.descriptionMaxLength || 30) }} />
            ) : null}
          </div>

          <div className="osc-resource-overview-content-item-footer">

            {props.likeWidget?.variant != 'micro-score' && props.displayVote && (
              <>
                <Icon icon="ri-thumb-up-line" variant="big" text={resource.yes} />
                {props.likeWidget?.displayDislike && <Icon icon="ri-thumb-down-line" variant="big" text={resource.no} />}
              </>
            )}

            {props.likeWidget?.variant == 'micro-score' && props.displayVote && (
              <>
                <Icon icon="ri-thumb-up-line" variant="big" />
                <Paragraph className="votes-score">{resource.netPositiveVotes}</Paragraph>
                {props.likeWidget?.displayDislike && <Icon icon="ri-thumb-down-line" variant="big"  />}
              </>
            )}

            {props.displayArguments ? (
              <Icon
                icon="ri-message-line"
                variant="big"
                text={resource.commentCount}
              />
            ) : null}
          </div>

          <Carousel
            items={resourceImages}
            buttonText={{ next: 'Volgende afbeelding', previous: 'Vorige afbeelding' }}
            className="osc-carousel-container"
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
                          resourceFilteredStatuses?.map((statusTag: any) => (
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

          {props.displayTagIcon && firstTag && MapIconImage && (
            <div className="resource-card--link_tagicon">
              <Image
                src={MapIconImage}
                alt={firstTag.name ? `Icoon voor ${firstTag.name}` : 'Tag icoon'}
              />
            </div>
          )}

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
  displayDislike = false,
  clickableImage = false,
  displayBudget = true,
  documentsTitle = '',
  documentsDesc = '',
  displayVariant = '',
  onFilteredResourcesChange,
  onLocationChange,
  selectedProjects = [],
  includeOrExcludeTagIds = 'include',
  includeOrExcludeStatusIds = 'include',
  includeProjectsInOverview = false,
  excludeResourcesInOverview = false,
  displayAsTabs = false,
  listTabTitle = 'Lijst',
  mapTabTitle = 'Kaart',
  filterBehavior = 'or',
  displayTags = true,
  displayOverviewTagGroups = false,
  overviewTagGroups = [],
  dialogTagGroups = undefined,
  filterBehaviorInclude = 'or',
  onlyShowTheseTagIds = '',
  displayCollapsibleFilter = false,
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
  const tagIdsToLimitResourcesTo = stringToArray(onlyIncludeTagIds);
  const tagsLimitationArray = stringToArray(onlyShowTheseTagIds);

  const { data: allTags, isLoading: tagsLoading } = datastore.useTags({
    projectId: props.projectId,
    type: ''
  });

  // Order limitation tags by their type so it can be directly used to filter shown tags in their type
  const groupedTagsForLimitation: { [key: string]: number[] } = useMemo(() => {
    const tagsMap: { [key: string]: number[] } = {};
    tagsLimitationArray.forEach((tagId: number) => {
      const foundTag = allTags.find((t: { id: number }) => t.id === tagId);
      if (foundTag) {
        const tagType = foundTag.type;
        if (!tagsMap[tagType]) {
          tagsMap[tagType] = [];
        }

        tagsMap[tagType].push(tagId);
      }
    });
    return tagsMap;
  }, [allTags]);

  const urlParams = new URLSearchParams(window.location.search);
  const urlTagIds = urlParams.get('tagIds');
  const urlStatusIds = urlParams.get('statusIds');

  const urlTagIdsArray = urlTagIds ? stringToArray(urlTagIds) : undefined;
  const urlStatusIdsArray = urlStatusIds ? stringToArray(urlStatusIds) : undefined;

  const [open, setOpen] = React.useState(false);
  const initStatuses = urlStatusIdsArray && urlStatusIdsArray.length > 0 ? urlStatusIdsArray : statusIdsToLimitResourcesTo || [];

  const prefilterTagObj = urlTagIdsArray && allTags
    ? allTags.filter((tag: { id: number }) => urlTagIdsArray.includes(tag.id))
    : [];

  useEffect(() => {
    const includeTags = includeOrExcludeTagIds === 'include' ? tagIdsToLimitResourcesTo : [];
    const excludeTags = includeOrExcludeTagIds === 'exclude' ? tagIdsToLimitResourcesTo : [];

    setExcludeTags(excludeTags);
    setIncludeTags(includeTags);
    setTags(urlTagIdsArray || []);
  }, [onlyIncludeTagIds, urlTagIds]);

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

  const [resources, setResources] = useState<Array<any>>([]);
  const [filteredResources, setFilteredResources] = useState<Array<any>>([]);
  const randomSortSeed = useMemo(() => {
    const pathname = typeof window !== 'undefined' ? window.location.pathname : '';
    const search = typeof window !== 'undefined' ? window.location.search : '';
    const seedScope = `${props.projectId || 'project'}:${pathname}:${search}`;
    return getScopedSessionRandomSortSeed(seedScope, 'resourceOverviewRandomSortSeed');
  }, [props.projectId]);

  const projectIds = selectedProjects
    ?.filter(project => !project?.excludeResourcesInOverview)
    .map(project => project.id) || [];

  // Order tags by their type so it can be directly used in the resource filter
  const groupedTags: { [key: string]: number[] } = useMemo(() => {
    const tagsMap: { [key: string]: number[] } = {};
    allTags.forEach((tag: { type: string; id: string | number }) => {
      const tagType = tag.type;
      if (!tagsMap[tagType]) {
        tagsMap[tagType] = [];
      }

      const tagId = typeof tag.id === 'string' ? parseInt(tag.id, 10) : tag.id;
      tagsMap[tagType].push(tagId);
    });
    return tagsMap;
  }, [allTags]);

  const { data: resourcesWithPagination, isLoading } = datastore.useResources({
    pageSize: 999999,
    ...props,
    search,
    tags: [],
    sort: undefined,
    projectIds: projectIds || [],
    allowMultipleProjects: selectedProjects && selectedProjects.length > 1
  });

  const [resourceDetailIndex, setResourceDetailIndex] = useState<number>(0);

  useEffect(() => {
    if (resourcesWithPagination && !(selectedProjects.length > 0 && projectIds.length === 0)) {
      setResources(resourcesWithPagination.records || []);
    }
  }, [resourcesWithPagination, pageSize]);

  useEffect(() => {
    const allResources: any = [];

    if (selectedProjects && selectedProjects.length > 0) {
      selectedProjects.forEach((project) => {
        if (project.includeProjectsInOverview === false) return;

        const tagsArray = project?.tags ? project.tags.split(',').map(tag => tag.trim()) : [];
        const tags = tagsArray.map(tag => {
          const foundTag = allTags.find((t: { id: number }) => t.id === parseInt(tag));
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

    // Filtering is always 'or' inside their own types and depending on filterBehavior it's 'and' or 'or' between types
    // This logic is for both includeTags (that sets the base resources based on widget settings) and tags (the user selected tags for filtering)
    // excludeTags are always excluded first and have no further logic
    const tagIntegers = tags?.map((tag: any) => parseInt(tag, 10));
    const filtered = combinedResources?.filter((resource: any) => {
        const hasExcludedTag = resource.tags?.some((tag: { id: number }) =>
          excludeTags.includes(tag.id)
        );
        if (hasExcludedTag) return false;

        if (includeTags.length > 0) {
          if (filterBehaviorInclude === 'and') {
            const relevantTagTypes = Object.keys(groupedTags).filter(tagType =>
              includeTags.some(tagId => groupedTags[tagType].includes(tagId))
            );

            return relevantTagTypes.every(tagType => {
              const tagsOfType = groupedTags[tagType];
              const includeTagsOfType = includeTags.filter(tagId => tagsOfType.includes(tagId));
              return resource.tags?.some((tag: { id: number }) => includeTagsOfType.includes(tag.id));
            });

          } else {
            return resource.tags?.some((tag: { id: number }) =>
              includeTags.includes(tag.id)
            );
          }
        }

        return true;
      })
      ?.filter((resource: any) => {
        if (tagIntegers.length > 0) {
          if (filterBehavior === 'and') {
            const relevantTagTypes = Object.keys(groupedTags).filter(tagType =>
              tagIntegers.some(tagId => groupedTags[tagType].includes(tagId))
            );

            return relevantTagTypes.every(tagType => {
              const tagsOfType = groupedTags[tagType];
              const includeTagsOfType = tagIntegers.filter(tagId => tagsOfType.includes(tagId));
              return resource.tags?.some((tag: { id: number }) => includeTagsOfType.includes(tag.id));
            });

          } else {
            return resource.tags?.some((tag: { id: number }) =>
              tagIntegers.includes(tag.id)
            );
          }
        }

        return true;
      })
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
          return deterministicRandomSort(a, b, randomSortSeed, getResourceStableKey);
        }
        if (sort === 'score') {
          return (b.score || 0) - (a.score || 0);
        }

        return 0;
      });

    setFilteredResources(filtered);
  }, [resources, tags, statuses, search, sort, allTags, excludeTags, includeTags, location, groupedTags, randomSortSeed]);

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
  }, [ JSON.stringify(filteredResources) ]);

  const { data: currentUser } = datastore.useCurrentUser({ ...props });

  const onResourceClick = useCallback(
    (resource: any, index: number) => {
      if (displayType === 'cardrow') {
        let urlToUse = props.itemLink;

        if (selectedProjects.length > 0) {
          const project = selectedProjects.find(project => project.id === resource.projectId);

          if (resource?.id && project) {
            urlToUse = project.detailPageLink;
          } else if (!resource?.id && project?.overviewUrl) {
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

  const refreshLikes = () => {
    datastore.refresh()
  }

  const overviewSection = (
    <section className="osc-resource-overview-resource-collection" id={randomId}>
      {filteredResources?.length === 0 ? (
        isLoading ? (
          <Paragraph className="osc-loading-results-text">Laden...</Paragraph>
        ) : (
          <Paragraph className="osc-no-results-text">
            {search ? `Er zijn geen resultaten gevonden voor "${search}".` : 'Geen resultaten gevonden.'}
          </Paragraph>
        )
      ) :
        filteredResources
          ?.slice(page * pageSize, (page + 1) * pageSize)
          ?.map((resource: any, index: number) => {
            return (
              <React.Fragment key={`resource-item-${resource?.id || resource?.uniqueId}`}>
                {renderItem(resource, { ...props, displayType, selectedProjects, displayOverviewTagGroups, overviewTagGroups }, () => {
                  onResourceClick(resource, index);
                }, refreshLikes )}
              </React.Fragment>
            );
          })
      }
    </section>
  );
const validFilteredResources = filteredResources?.filter(
  r => r && (r.id || r.uniqueId) // only real resources or projects
) || [];
  return tagsLoading ? (
      <Paragraph className="osc-loading-results-text">Laden...</Paragraph>
    ) : (
    <>
      <Dialog
        open={open}
        onOpenChange={setOpen}
        children={
          <Carousel
            startIndex={resourceDetailIndex}
            items={validFilteredResources}
            buttonText={{ next: 'Volgende afbeelding', previous: 'Vorige afbeelding' }}
            itemRenderer={(item) => (
              <GridderResourceDetail
                resource={item}
                currentUser={currentUser}
                displayDocuments={displayDocuments}
                documentsTitle={documentsTitle}
                documentsDesc={documentsDesc}
                displayTags={displayTags}
                dialogTagGroups={dialogTagGroups}
                displayBudget={displayBudget}
                displayLikeButton={displayLikeButton}
                displayDislike={displayDislike}
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
      {displayBanner || displayMap
        ? renderHeader(
            {
              ...props,
              displayType,
              onMarkerResourceClick: onResourceClick,
            },
            filteredResources || [],
            bannerText,
            displayBanner,
            displayMap && !displayAsTabs,
            selectedProjects,
            location,
            props.headingLevel || '4'
          )
        : null}

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
              tagsLimitation={groupedTagsForLimitation}
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
                setTags( f.tags.length > 0 ? f.tags : []);
                if (['createdAt_desc', 'createdAt_asc', 'title', 'votes_desc', 'votes_asc', 'ranking', 'random', 'score'].includes(f.sort)) {
                  setSort(f.sort);
                }
                setSearch(f.search.text);
                setLocation(f.location)
              }}
              preFilterTags={prefilterTagObj}
              displayCollapsibleFilter={displayCollapsibleFilter}
              autoApply={props?.autoApply || false}
            />
          ) : null}

          {displayAsTabs ? (
            <div className="osc-resource-overview-tabs-container">
              <TabsList>
                <TabsTrigger value="list"><Icon icon="ri-list-unordered" />{listTabTitle}</TabsTrigger>
                <TabsTrigger value="map"><Icon icon="ri-map-pin-line" />{mapTabTitle}</TabsTrigger>
              </TabsList>
              <TabsContent value="list">
                {overviewSection}
              </TabsContent>
              <TabsContent value="map">
                {renderHeader(props, (filteredResources || []), bannerText, false, true, selectedProjects, location, props.headingLevel || '4')}
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
      <ResourceOverviewInner {...props} {...props.likeWidget}/>
    </Tabs>
  ) : (
    <ResourceOverviewInner {...props} {...props.likeWidget}/>
  );
}

ResourceOverview.loadWidget = loadWidget;
export { ResourceOverview };
