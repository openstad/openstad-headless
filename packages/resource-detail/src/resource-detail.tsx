import './resource-detail.css';
import React from 'react';
import { Banner, Icon } from '@openstad-headless/ui/src';
//@ts-ignore D.type def missing, will disappear when datastore is ts
import DataStore from '@openstad-headless/data-store/src';
import { Spacer } from '@openstad-headless/ui/src';
import { Image } from '@openstad-headless/ui/src';
import { BaseProps } from '../../types/base-props';
import { ProjectSettingProps } from '../../types/project-setting-props';
import loadWidget from '@openstad-headless/lib/load-widget';
import { elipsize } from '@openstad-headless/lib/ui-helpers';
import format from 'date-fns/format';
import { nl } from 'date-fns/locale';

export type ResourceDetailWidgetProps = BaseProps &
  ProjectSettingProps & {
    projectId?: string;
    resourceId?: string;
  } & {
    renderHeader?: (resources?: Array<any>) => React.JSX.Element;
    renderItem?: (
      resource: any,
      props: ResourceDetailWidgetProps
    ) => React.JSX.Element;
    displayTitle?: boolean;
    titleMaxLength?: number;
    displaySummary?: boolean;
    displayDescription?: boolean;
    displayUser?: boolean;
    displayDate?: boolean;
    displayLocation?: boolean;
  };

const defaultItemRenderer = (
  resource: any,
  props: ResourceDetailWidgetProps
) => {
  return (
    <article className="osc-resource-detail-content-items">
      <Image
        src={resource.images?.at(0)?.src || ''}
        onClick={() => console.log({ resource })}
        imageFooter={
          <div>
            <p className="osc-resource-detail-content-item-status">
              {resource.status === 'OPEN' ? 'Open' : 'Gesloten'}
            </p>
          </div>
        }
      />
      {props.displayTitle && resource.title && (
        <h4>{elipsize(resource.title, props.titleMaxLength || 20)}</h4>
      )}
      <div>
        {props.displayUser && resource?.user?.name && (
          <h5 className="osc-resource-detail-content-item-user">
            {resource.user.name}
          </h5>
        )}
        {props.displayDate && resource.publishDateHumanized && (
          <h6 className="osc-resource-detail-content-item-date">
            {resource.publishDateHumanized}
          </h6>
        )}
      </div>
      <div>
        {props.displaySummary && <h5>{resource.summary}</h5>}
        {props.displayDescription && (
          <p className="osc-resource-detail-content-item-description">
            {resource.description}
          </p>
        )}
      </div>
      {props.displayLocation && resource.location && (
        <>
          <h4>Plaats</h4>
          <p className="osc-resource-detail-content-item-location">
            {resource.location.toString()}
          </p>
        </>
      )}
    </article>
  );
};

function ResourceDetail({
  renderItem = defaultItemRenderer,
  ...props
}: ResourceDetailWidgetProps) {
  const datastore = new DataStore({
    projectId: props.projectId,
    resourceId: props.resourceId,
    config: { api: props.api },
  });
  const [resource] = datastore.useResource({ ...props });
  if (!resource) return null;

  return (
    <div className="osc">
      <Spacer size={2} />
      <section className="osc-resource-detail-content osc-resource-detail-content--span-2">
        {resource ? (
          <React.Fragment>{renderItem(resource, props)}</React.Fragment>
        ) : (
          <span>resource niet gevonden..</span>
        )}
      </section>
    </div>
  );
}

ResourceDetail.loadWidget = loadWidget;
export { ResourceDetail };
