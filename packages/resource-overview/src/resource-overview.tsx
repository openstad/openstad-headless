import './resource-overview.css';
import React, { useCallback, useState } from 'react';
import { Banner, Carousel, Icon, Paginator } from '@openstad-headless/ui/src';
//@ts-ignore D.type def missing, will disappear when datastore is ts
import DataStore from '@openstad-headless/data-store/src';
import { Spacer } from '@openstad-headless/ui/src';
import { Image } from '@openstad-headless/ui/src';
import { Dialog } from '@openstad-headless/ui/src';
import { BaseProps, ProjectSettingProps } from '@openstad-headless/types';
import { Filters } from '@openstad-headless/ui/src/stem-begroot-and-resource-overview/filter';
import { loadWidget } from '@openstad-headless/lib/load-widget';
import { elipsize } from '../../lib/ui-helpers';
import { GridderResourceDetail } from './gridder-resource-detail';
import { hasRole } from '@openstad-headless/lib';
import nunjucks from 'nunjucks';

import "@utrecht/component-library-css";
import "@utrecht/design-tokens/dist/root.css";
import { Heading4, Paragraph, Button } from "@utrecht/component-library-react";

export type ResourceOverviewWidgetProps = BaseProps &
  ProjectSettingProps & {
    projectId?: string;
  } & {
    renderHeader?: (resources?: Array<any>) => React.JSX.Element;
    renderItem?: (
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
    itemLink?: string;
    sorting: Array<{ value: string; label: string }>;
    displayTagFilters?: boolean;
    tagGroups?: Array<{ type: string; label?: string; multiple: boolean }>;
    displayTagGroupName?: boolean;
    displayBanner?: boolean;
    itemsPerPage?: number;
    textResults?: string;
    onlyIncludeTagIds?: string;
    rawInput?: string;
  };

//Temp: Header can only be made when the map works so for now a banner
// If you dont want a banner pas <></> into the renderHeader prop
const defaultHeaderRenderer = (resources?: any) => {
  return (
    <>
      <Banner></Banner>
      <section className="osc-resource-overview-title-container">
        <Heading4>Plannen</Heading4>
      </section>
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
      const render = nunjucks.renderString(props.rawInput, {
        // here you can add variables that are available in the template
        projectId: props.projectId,
        user: resource.user,
        startDateHumanized: resource.startDateHumanized,
        status: resource.status,
        title: resource.title,
        summary: resource.summary,
        description: resource.description,
        images: resource.images,
        budget: resource.budget,
        extraData: resource.extraData,
        location: resource.location,
        modBreak: resource.modBreak,
        modBreakDateHumanized: resource.modBreakDateHumanized,
        progress: resource.progress,
        createDateHumanized: resource.createDateHumanized,
        publishDateHumanized: resource.publishDateHumanized,
      });
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

  return (
    <Button appearance="subtle-button" className="resource-card--link" onClick={() => onItemClick && onItemClick()}>
      <Image
        src={resource.images?.at(0)?.url || ''}
        imageFooter={
          props.displayStatusLabel && (
            <div>
              <Paragraph className="osc-resource-overview-content-item-status">
                {resource.statuses?.map((statusTag: any) => (
                  <span className="status-label">{statusTag.label}</span>
                ))}
              </Paragraph>
            </div>
          )
        }
      />

      <div>
        <Spacer size={1} />
        {props.displayTitle ? (
          <Heading4>{elipsize(resource.title, props.titleMaxLength || 20)}</Heading4>
        ) : null}

        {props.displaySummary ? (
          <Paragraph>{elipsize(resource.summary, props.summaryMaxLength || 20)}</Paragraph>
        ) : null}

        {props.displayDescription ? (
          <Paragraph className="osc-resource-overview-content-item-description">
            {elipsize(resource.description, props.descriptionMaxLength || 30)}
          </Paragraph>
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
          <Icon icon="ri-message-line" variant="big" text={resource.commentCount} />
        ) : null}
      </div>
    </Button>
  );
};

function ResourceOverview({
  renderItem = defaultItemRenderer,
  allowFiltering = true,
  displayType = 'cardrow',
  displayBanner = false,
  renderHeader = defaultHeaderRenderer,
  itemsPerPage = 20,
  textResults = 'Dit zijn de zoekresultaten voor [search]',
  onlyIncludeTagIds = '',
  ...props
}: ResourceOverviewWidgetProps) {
  const datastore = new DataStore({
    projectId: props.projectId,
    api: props.api,
  });

  // const recourceTagsInclude = only
  const tagIdsToLimitResourcesTo = onlyIncludeTagIds
    .trim()
    .split(',')
    .filter((t) => t && !isNaN(+t.trim()))
    .map((t) => Number.parseInt(t));

  const [open, setOpen] = React.useState(false);

  // Filters that when changed reupdate the useResources value automatically
  const [search, setSearch] = useState<string>('');
  const [tags, setTags] = useState<number[]>(tagIdsToLimitResourcesTo || []);
  const [page, setPage] = useState<number>(0);
  const [pageSize, setPageSize] = useState<number>(itemsPerPage || 10);
  const [sort, setSort] = useState<string | undefined>(
    props.defaultSorting || undefined
  );

  const { data: resourcesWithPagination } = datastore.useResources({
    ...props,
    page,
    pageSize,
    search,
    tags,
    sort,
  });

  const [resourceDetailIndex, setResourceDetailIndex] = useState<number>(0);
  const resources = resourcesWithPagination.records || [];

  const { data: currentUser } = datastore.useCurrentUser({ ...props });
  const isModerator = hasRole(currentUser, 'moderator');

  const onResourceClick = useCallback(
    (resource: any, index: number) => {
      if (displayType === 'cardrow') {
        if (!props.itemLink) {
          console.error('Link to child resource is not set');
        } else {
          let location = document.location;
          let newUrl = props.itemLink.replace('[id]', resource.id);
          if (!newUrl.startsWith('http')) {
            if (!newUrl.startsWith('/')) {
              newUrl = `${location.pathname}${location.pathname.endsWith('/') ? '' : '/'}${newUrl}`;
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
    (props.displaySearch || props.displaySorting || props.displayTagFilters);

  return (
    <>
      <Dialog
        open={open}
        onOpenChange={setOpen}
        children={
          <Carousel
            startIndex={resourceDetailIndex}
            items={resources && resources.length > 0 ? resources : []}
            itemRenderer={(item) => (
              <GridderResourceDetail
                resource={item}
                isModerator={isModerator}
                loginUrl={props.login?.url}
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
              />
            )}></Carousel>
        }
      />

      <div className="osc">
        {displayBanner ? renderHeader() : null}

        <section
          className={`osc-resource-overview-content ${!filterNeccesary ? 'full' : ''
            }`}>
          {props.displaySearchText ? (
            <div className="osc-resourceoverview-search-container col-span-full">
              {props.textActiveSearch && search && (
                <Paragraph className="osc-searchtext">
                  {props.textActiveSearch
                    .replace('[search]', search)
                    .replace('[zoekterm]', search)}
                </Paragraph>
              )}
            </div>
          ) : null}

          {filterNeccesary && datastore ? (
            <Filters
              className="osc-flex-columned"
              tagsLimitation={tagIdsToLimitResourcesTo}
              dataStore={datastore}
              sorting={props.sorting || []}
              displaySorting={props.displaySorting || false}
              defaultSorting={props.defaultSorting || ''}
              displayTagFilters={props.displayTagFilters || false}
              displaySearch={props.displaySearch || false}
              tagGroups={props.tagGroups || []}
              itemsPerPage={itemsPerPage}
              resources={resources}
              onUpdateFilter={(f) => {
                if (f.tags.length === 0) {
                  setTags(tagIdsToLimitResourcesTo);
                } else {
                  setTags(f.tags);
                }
                setSort(f.sort);
                setSearch(f.search.text);
              }}
            />
          ) : null}

          <section className="osc-resource-overview-resource-collection">
            {resources &&
              resources.map((resource: any, index: number) => {
                return (
                  <React.Fragment key={`resource-item-${resource.title}`}>
                    {renderItem(resource, { ...props, displayType }, () => {
                      onResourceClick(resource, index);
                    })}
                  </React.Fragment>
                );
              })}
          </section>
        </section>
        {props.displayPagination && (
          <>
            <Spacer size={4} />
            <div className="osc-resource-overview-paginator col-span-full">
              <Paginator
                page={resourcesWithPagination?.metadata?.page || 0}
                totalPages={resourcesWithPagination?.metadata?.pageCount || 1}
                onPageChange={(page) => setPage(page)}
              />
            </div>
          </>
        )}
      </div>
    </>
  );
}

ResourceOverview.loadWidget = loadWidget;
export { ResourceOverview };
