import './resource-overview.css';
import React from 'react';
import { Banner, Icon } from '@openstad-headless/ui/src';
//@ts-ignore D.type def missing, will disappear when datastore is ts
import DataStore from '@openstad-headless/data-store/src';
import { Spacer } from '@openstad-headless/ui/src';
import { Image } from '@openstad-headless/ui/src';
import { BaseProps } from '../../types/base-props';
import { ProjectSettingProps } from '../../types/project-setting-props';
import { Filters } from './filters/filters';
import loadWidget from '@openstad-headless/lib/load-widget';
import { elipsize } from '../../lib/ui-helpers';

export type ResourceOverviewWidgetProps = BaseProps &
  ProjectSettingProps & {
    projectId?: string;
  } & {
    renderHeader?: (resources?: Array<any>) => React.JSX.Element;
    renderItem?: (
      resource: any,
      props: ResourceOverviewWidgetProps
    ) => React.JSX.Element;
    allowFiltering?: boolean;
    tagTypes?: Array<{
      type: string;
      placeholder: string;
      multiple?: boolean;
    }>;
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
    sorting: Array<{ value: string; label: string }>;
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
  props: ResourceOverviewWidgetProps
) => {
  return (
    <article>
      <Image
        src={resource.images?.at(0)?.src || ''}
        onClick={() => console.log({ resource })}
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
  tagTypes = [],
  ...props
}: ResourceOverviewWidgetProps) {
  const datastore = new DataStore({
    projectId: props.projectId,
    config: { api: props.api },
  });
  const [resources] = datastore.useResources({ ...props });

  return (
    <div className="osc">
      {renderHeader()}

      <Spacer size={2} />

      <section
        className={`osc-resource-overview-content ${
          !allowFiltering ? 'full' : ''
        }`}>
        {allowFiltering && datastore ? (
          <Filters
            {...props}
            projectId={props.projectId}
            dataStore={datastore}
            resources={resources}
            onUpdateFilter={resources.filter}
            tagTypes={tagTypes}
          />
        ) : null}

        <section className="osc-resource-overview-resource-collection">
          {resources &&
            resources.map((resource: any) => {
              return (
                <React.Fragment key={`resource-item-${resource.title}`}>
                  {renderItem(resource, props)}
                </React.Fragment>
              );
            })}
        </section>
      </section>
    </div>
  );
}

ResourceOverview.loadWidget = loadWidget;
export { ResourceOverview };
