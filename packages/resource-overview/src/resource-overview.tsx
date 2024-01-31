import './resource-overview.css';
import React, { useRef, useCallback, useState } from 'react';
import { Banner, Carousel, Icon } from '@openstad-headless/ui/src';
//@ts-ignore D.type def missing, will disappear when datastore is ts
import DataStore from '@openstad-headless/data-store/src';
import { Spacer } from '@openstad-headless/ui/src';
import { Image } from '@openstad-headless/ui/src';
import { Dialog } from '@openstad-headless/ui/src';
import { BaseProps } from '../../types/base-props';
import { ProjectSettingProps } from '../../types/project-setting-props';
import { Filters } from './filters/filters';
import { loadWidget } from '@openstad-headless/lib/load-widget';
import { elipsize } from '../../lib/ui-helpers';
import { GridderResourceDetail } from './gridder-resource-detail';
import { hasRole } from '@openstad-headless/lib';

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
    resourceType?:
      | 'resource'
      | 'article'
      | 'activeUser'
      | 'resourceUser'
      | 'submission';
    displayType?: 'cardrow' | 'cardgrid' | 'raw';
    allowFiltering?: boolean;
    displayTitle?: boolean;
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
    textActiveSearch?: string;
    itemLink?: string;
    sorting: Array<{ value: string; label: string }>;
    displayTagFilters?: boolean;
    tagGroups?: Array<{ type: string; label?: string; multiple: boolean }>;
    displayTagGroupName?: boolean;
  };

//Temp: Header can only be made when the map works so for now a banner
// If you dont want a banner pas <></> into the renderHeader prop
const defaultHeaderRenderer = (resources?: any) => {
  return (
    <>
      <Banner>
        <Spacer size={12} />
      </Banner>
      <section className="osc-resource-overview-title-container">
        <Spacer size={2} />
        <h4>Plannen</h4>
      </section>
    </>
  );
};

const defaultItemRenderer = (
  resource: any,
  props: ResourceOverviewWidgetProps,
  onItemClick?: () => void
) => {
  return (
    <article onClick={() => onItemClick && onItemClick()}>
      <Image
        src={resource.images?.at(0)?.src || ''}
        imageFooter={
          <div>
            <p className="osc-resource-overview-content-item-status">
              {resource.status === 'OPEN' ? 'Open' : 'Gesloten'}
            </p>
          </div>
        }
      />

      <div>
        <Spacer size={1} />
        {props.displayTitle ? (
          <h6>{elipsize(resource.title, props.titleMaxLength || 20)}</h6>
        ) : null}

        {props.displaySummary ? (
          <h6>{elipsize(resource.summary, props.summaryMaxLength || 20)}</h6>
        ) : null}

        {props.displayDescription ? (
          <p className="osc-resource-overview-content-item-description">
            {elipsize(resource.description, props.descriptionMaxLength || 30)}
          </p>
        ) : null}
      </div>

      <div className="osc-resource-overview-content-item-footer">
        {props.displayVote ? (
          <>
            <Icon icon="ri-thumb-up-line" variant="big" text={resource.yes} />
            <Icon icon="ri-thumb-down-line" variant="big" text={resource.yes} />
          </>
        ) : null}

        {props.displayArguments ? (
          <Icon icon="ri-message-line" variant="big" text="0" />
        ) : null}
      </div>
    </article>
  );
};

function ResourceOverview({
  renderHeader = defaultHeaderRenderer,
  renderItem = defaultItemRenderer,
  allowFiltering = true,
  displayType = 'cardrow',
  ...props
}: ResourceOverviewWidgetProps) {
  const datastore = new DataStore({
    projectId: props.projectId,
    api: props.api,
  });
  const [open, setOpen] = React.useState(false);
  const [resources] = datastore.useResources({ ...props });
  const [resourceDetailIndex, setResourceDetailIndex] = useState<number>(0);
  
  const [currentUser, currentUserError, currentUserIsLoading] =
  datastore.useCurrentUser({ ...props });
  const isModerator = hasRole(currentUser, 'moderator')

  const onResourceClick = useCallback(
    (resource: any, index: number) => {
      if (displayType === 'cardrow') {
        if (!props.itemLink) {
          console.error('Link to child resource is not set');
        } else {
          console.log('Test');
          location.href = props.itemLink.replace('[id]', resource.id);
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
                onRemoveClick={(resource) => {
                  try {
                    resource
                      .delete(resource.id)
                      .then(() => {
                        setOpen(false);
                      })
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
        {renderHeader()}

        <Spacer size={2} />

        <section
          className={`osc-resource-overview-content ${
            !filterNeccesary ? 'full' : ''
          }`}>
          {filterNeccesary && datastore ? (
            <Filters
              {...props}
              projectId={props.projectId}
              resources={resources}
              onUpdateFilter={resources.filter}
            />
          ) : null}

          <section className="osc-resource-overview-resource-collection">
            {resources &&
              resources.map((resource: any, index: number) => {
                return (
                  <React.Fragment key={`resource-item-${resource.title}`}>
                    {renderItem(resource, props, () => {
                      onResourceClick(resource, index);
                    })}
                  </React.Fragment>
                );
              })}
          </section>
        </section>
      </div>
    </>
  );
}

ResourceOverview.loadWidget = loadWidget;
export { ResourceOverview };
