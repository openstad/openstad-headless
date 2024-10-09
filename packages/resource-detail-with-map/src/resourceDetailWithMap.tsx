import './resourceDetailWithMap.css';
//@ts-ignore D.type def missing, will disappear when datastore is ts
import DataStore from '@openstad-headless/data-store/src';
import { loadWidget } from '@openstad-headless/lib/load-widget';
import { getResourceId } from '@openstad-headless/lib/get-resource-id';
import {
  Carousel,
  Image,
} from '@openstad-headless/ui/src';
import { BaseProps, ProjectSettingProps } from '@openstad-headless/types';
import '@utrecht/component-library-css';
import '@utrecht/design-tokens/dist/root.css';
import {
  Paragraph,
  Heading,
} from '@utrecht/component-library-react';
import React from 'react';
import { LikeWidgetProps } from '@openstad-headless/likes/src/likes';
import { CommentsWidgetProps } from '@openstad-headless/comments/src/comments';
import { ResourceDetailMapWidgetProps } from '@openstad-headless/leaflet-map/src/types/resource-detail-map-widget-props';
import { Button, ButtonLink } from '@utrecht/component-library-react';
import { ShareLinks } from '../../apostrophe-widgets/share-links/src/share-links';

import { ResourceDetailMap } from '@openstad-headless/leaflet-map/src/resource-detail-map';
type booleanProps = {
  [K in
  | 'displayImage'
  | 'displayTitle'
  | 'displaySummary'
  | 'displayDescription'
  | 'displayUser'
  | 'displayDate'
  | 'displayBudget'
  | 'displayLocation'
  | 'displayBudgetDocuments'
  | 'displayLikes'
  | 'displayTags'
  | 'displayStatus'
  | 'displayDocuments'
  | 'displaySocials']: boolean | undefined;
};

export type ResourceDetailWidgetProps = {
  documentsTitle?: string;
  documentsDesc?: string;
} & BaseProps &
  ProjectSettingProps & {
    projectId?: string;
    resourceId?: string;
    resourceIdRelativePath?: string;
    backUrl?: string;
    countButton?: {
      show: boolean;
      label?: string;
    }
    ctaButton?: {
      show: boolean;
      label?: string;
      href?: string;
    }
  } & booleanProps & {
    likeWidget?: Omit<
      LikeWidgetProps,
      keyof BaseProps | keyof ProjectSettingProps | 'resourceId'
    >;
    commentsWidget?: Omit<
      CommentsWidgetProps,
      keyof BaseProps | keyof ProjectSettingProps | 'resourceId'
    >;
    resourceDetailMap?: Omit<
      ResourceDetailMapWidgetProps,
      keyof BaseProps | keyof ProjectSettingProps | 'resourceId'
    >;
  };

function ResourceDetailWithMap({
  displayImage = true,
  displayTitle = true,
  displaySummary = true,
  displayDescription = true,
  displayUser = true,
  displayDate = true,
  displayBudget = true,
  displayLocation = true,
  displayBudgetDocuments = true,
  displayLikes = false,
  displayTags = false,
  displayStatus = false,
  displaySocials = false,
  countButton = undefined,
  ctaButton = undefined,
  backUrl = '/',
  ...props
}: ResourceDetailWidgetProps) {

  let resourceId: string | undefined = String(getResourceId({
    resourceId: parseInt(props.resourceId || ''),
    url: document.location.href,
    targetUrl: props.resourceIdRelativePath,
  })); // todo: make it a number throughout the code

  const datastore = new DataStore({
    projectId: props.projectId,
    resourceId: resourceId,
    api: props.api,
  });
  const { data: resource } = datastore.useResource({
    projectId: props.projectId,
    resourceId: resourceId,
  });

  const showDate = (date: string) => {
    return date.split(' ').slice(0, -1).join(' ')
  };

  const { data: resources } = datastore.useResources({
    projectId: props.projectId,
  });


  let countButtonElement: React.JSX.Element = <></>;
  if (countButton?.show) {
    countButtonElement = (
      <div
        className="utrecht-button utrecht-button--secondary-action osc-resource-overview-map-button osc-first-button">
        <section className="resource-counter">
          {resources?.metadata?.totalCount}
        </section>
        <section className="resource-label">
          {countButton.label || 'plannen'}
        </section>
      </div>
    );
  }

  let ctaButtonElement: React.JSX.Element = <></>;
  if (ctaButton?.show) {
    ctaButtonElement = (
      <ButtonLink
        appearance="primary-action-button"
        href={ctaButton.href}
        className={`osc-resource-overview-map-button ${countButtonElement ? 'osc-second-button' : 'osc-first-button'
          }`}>
        <section className="resource-label">{ctaButton.label}</section>
      </ButtonLink>
    );
  }


  if (!resource) return null;

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

  const resourceImages = (Array.isArray(resource.images) && resource.images.length > 0) ? resource.images : [{ url: defaultImage }];
  const hasImages = (Array.isArray(resourceImages) && resourceImages.length > 0 && resourceImages[0].url !== '') ? '' : 'resource-has-no-images';

  return (
    <section className="osc-resource-detail-content osc-resource-detail-grid">
      {resource ? (
        <>
          <a href={backUrl} className="back-to-overview">Terug naar overzicht</a>
          <article className={`osc-resource-detail-content-items ${hasImages}`}>
            {displayImage && (
              <Carousel
                items={resourceImages}
                buttonText={{ next: 'Volgende afbeelding', previous: 'Vorige afbeelding' }}
                itemRenderer={(i) => (
                  <Image
                    src={i.url}
                    imageFooter={
                      <div>
                        <Paragraph className="osc-resource-detail-content-item-status">
                          {resource.statuses
                            ?.map((s: { label: string }) => s.label)
                            ?.join(', ')}
                        </Paragraph>
                      </div>
                    }
                  />
                )}
              />
            )}

            {displayTitle && resource.title && (
              <Heading level={1} appearance="utrecht-heading-2" dangerouslySetInnerHTML={{__html: resource.title}}/>
            )}
            <div className="osc-resource-detail-content-item-row">
              {displayUser && resource?.user?.displayName && (
                <div>
                  <Heading level={2} appearance='utrecht-heading-6' className="osc-resource-detail-content-item-title">
                  Ingediend door
                  </Heading>
                  <span className="osc-resource-detail-content-item-text">
                    {resource.user.displayName}
                  </span>
                </div>
              )}
              {displayDate && resource.startDateHumanized && (
                <div>
                  <Heading level={2} appearance='utrecht-heading-6' className="osc-resource-detail-content-item-title">
                    Datum
                  </Heading>
                  <span className="osc-resource-detail-content-item-text">
                    {showDate(resource.startDateHumanized)}
                  </span>
                </div>
              )}
              {displayBudget && resource.budget && (
                <div>
                  <Heading level={2} appearance='utrecht-heading-6' className="osc-resource-detail-content-item-title">
                    Budget
                  </Heading>
                  <span className="osc-resource-detail-content-item-text">
                    {`€ ${resource.budget.toLocaleString('nl-NL')}`}
                  </span>
                </div>
              )}
            </div>
            <div className="resource-detail-content">
              {displaySummary && <Heading level={2} appearance='utrecht-heading-4' dangerouslySetInnerHTML={{__html: resource.summary}} />}
              {displayDescription && (
                <Paragraph dangerouslySetInnerHTML={{__html: resource.description}}/>
              )}
            </div>
            {displaySocials ? (
                <div className="resource-detail-side-section">
                  <ShareLinks title={'Deel dit'} />
                </div>
              ) : null}
          </article>
          {displayLocation && resource.location && (
            <div className="map-container--buttons">
              <ResourceDetailMap
                resourceId={props.resourceId || resourceId || resource.id || '0'}
                {...props}
                center={resource.location}
                area={props.resourceDetailMap?.area}
                resourceIdRelativePath={props.resourceIdRelativePath || 'openstadResourceId'}
              >
              </ResourceDetailMap>
              <div className="map-buttons">
                {ctaButtonElement}
                {countButtonElement}
              </div>
            </div>
          )}
        </>
      ) : (
        <span>resource niet gevonden..</span>
      )}
    </section>
  );
}

ResourceDetailWithMap.loadWidget = loadWidget;
export { ResourceDetailWithMap };
