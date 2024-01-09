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
import { LikeWidgetProps, Likes } from '@openstad/likes/src/likes';

export type ResourceDetailWidgetProps = BaseProps &
  ProjectSettingProps & {
    projectId?: string;
  } & {
    renderHeader?: (resources?: Array<any>) => React.JSX.Element;
    renderItem?: (
      resource: any,
      props: ResourceDetailWidgetProps
    ) => React.JSX.Element;
    resourceId: string;
    displayTitle?: boolean;
    titleMaxLength?: number;
    displayLabel?: boolean;
    displaySummary?: boolean;
    displayDescription?: boolean;
    displayUser?: boolean;
    displayDate?: boolean;
    displayLocation?: boolean;
    displayCaption?: boolean;
    textActiveSearch?: string;
    sorting: Array<{ value: string; label: string }>;

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
      {/* <section className="osc-resource-detail-title-container">
        <Spacer size={2} />
        <h4>Plannen</h4>
      </section> */}
    </>
  );
};

const defaultItemRenderer = (
  resource: any,
  props: ResourceDetailWidgetProps
) => {
  const dateString = resource.publishDate;
  const date = new Date(dateString);
  const formattedDate = format(date, 'd MMMM yyyy', { locale: nl });
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
      {props.displayTitle && (
        <h4>{elipsize(resource.title, props.titleMaxLength || 20)}</h4>
      )}
      <div>
        {props.displayUser && (
          <h5 className="osc-resource-detail-content-item-user">
            {resource.userId}
          </h5>
        )}
        {props.displayDate && (
          <h6 className="osc-resource-detail-content-item-date">
            {formattedDate}
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
      {props.displayLocation && (
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
  renderHeader = defaultHeaderRenderer,
  renderItem = defaultItemRenderer,
  ...props
}: ResourceDetailWidgetProps) {
  const datastore = new DataStore({
    projectId: props.projectId,
    resourceId: props.resourceId,
    config: { api: props.api },
  });
  const [resources] = datastore.useResources({ ...props });
  const resource = resources.find(
    (resource: any) => resource.id.toString() === props.resourceId
  );

  return (
    <div className="osc">
      {renderHeader()}

      <Spacer size={2} />
      <section className="osc-resource-detail-container">
        <section className="osc-resource-detail-content osc-resource-detail-content--span-2">
          {resource ? (
            <React.Fragment>{renderItem(resource, props)}</React.Fragment>
          ) : (
            <span>resource niet gevonden..</span>
          )}
        </section>
        <section className="osc-resource-detail-content">
          Like widget komt hier
        </section>
      </section>
      <section className="osc-resource-detail-container">
        Argumenten widget komt hier
      </section>
    </div>
  );
}

ResourceDetail.loadWidget = loadWidget;
export { ResourceDetail };
