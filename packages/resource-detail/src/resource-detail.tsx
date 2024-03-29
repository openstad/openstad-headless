import './resource-detail.css';
//@ts-ignore D.type def missing, will disappear when datastore is ts
import DataStore from '@openstad-headless/data-store/src';
import { loadWidget } from '@openstad-headless/lib/load-widget';
import {
  Carousel,
  Image,
  Spacer,
  Pill,
  IconButton,
} from '@openstad-headless/ui/src';
import { BaseProps, ProjectSettingProps } from '@openstad-headless/types';
import '@utrecht/component-library-css';
import '@utrecht/design-tokens/dist/root.css';
import {
  Paragraph,
  Heading4,
  Heading5,
  Heading6,
} from '@utrecht/component-library-react';
import React from 'react';
import { Likes, LikeWidgetProps } from '@openstad-headless/likes/src/likes';
import {
  Comments,
  CommentsWidgetProps,
} from '@openstad-headless/comments/src/comments';
import { ResourceDetailMapWidgetProps } from '@openstad-headless/leaflet-map/src/types/resource-detail-map-widget-props';

import { ResourceDetailMap } from '@openstad-headless/leaflet-map/src/resource-detail-map';

import { RiFlag2Fill } from '@remixicon/react';
import { divIcon as LeafletDivIcon } from 'leaflet';

type booleanProps = {
  [K in
    | 'displayComments'
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
    | 'displayLocation'
    | 'displaySocials']: boolean | undefined;
};

export type ResourceDetailWidgetProps = BaseProps &
  ProjectSettingProps & {
    projectId?: string;
    resourceId?: string;
    resourceIdRelativePath?: string;
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

function ResourceDetail({
  displayComments = true,
  displayImage = true,
  displayTitle = true,
  displaySummary = true,
  displayDescription = true,
  displayUser = true,
  displayDate = true,
  displayBudget = true,
  displayLocation = true,
  displayBudgetDocuments = true,
  displayLikes = true,
  displayTags = true,
  displayStatus = true,
  displaySocials = true,
  ...props
}: ResourceDetailWidgetProps) {
  const urlParams = new URLSearchParams(window.location.search);
  let resourceId = props.resourceId || '0';

  if (!resourceId && props.resourceIdRelativePath) {
    const currentUrl = location.pathname;
    const currentUrlSegments = currentUrl.split('/');

    const relativePathSegments = (
      props.resourceIdRelativePath.startsWith('/')
        ? props.resourceIdRelativePath
        : `/${props.resourceIdRelativePath}`
    ).split('/');
    const indexContainingSegment = relativePathSegments.findIndex((segment) =>
      segment.includes('[id]')
    );

    if (
      indexContainingSegment > -1 &&
      currentUrlSegments.at(indexContainingSegment)?.match(/^\d+$/)
    ) {
      resourceId = currentUrlSegments[indexContainingSegment];
    }
  } else if (!resourceId) {
    resourceId = `${
      urlParams.get('openstadResourceId')
        ? `${parseInt(urlParams.get('openstadResourceId') as string)}`
        : '0'
    }`;
  }

  const datastore = new DataStore({
    projectId: props.projectId,
    resourceId: resourceId,
    api: props.api,
  });
  const { data: resource } = datastore.useResource({
    projectId: props.projectId,
    resourceId: resourceId,
  });

  const icon = LeafletDivIcon({
    iconSize: [24, 24],
    html: `<?xml version="1.0" encoding="UTF-8"?><svg width="34px" height="45px" viewBox="0 0 34 45" version="1.1" xmlns="http://www.w3.org/2000/svg" xmlns:xlink="http://www.w3.org/1999/xlink"><path d="M17,0 C26.3917,0 34,7.53433 34,16.8347 C34,29.5249 19.3587,42.4714 18.7259,42.9841 L17,44.4938 L15.2741,42.9841 C14.6413,42.4714 0,29.5249 0,16.8347 C0,7.53575 7.60829,0 17,0 Z" id="Path" fill="red" fill-rule="nonzero"></path></svg>`,
  });

  if (!resource) return null;
  const shouldHaveSideColumn =
    displayLikes || displayTags || displayStatus || displaySocials;
  return (
    <section>
      <div
        className={`osc ${
          shouldHaveSideColumn
            ? 'osc-resource-detail-column-container'
            : 'osc-resource-detail-container'
        }`}>
        <section className="osc-resource-detail-content osc-resource-detail-content--span-2">
          {resource ? (
            <article className="osc-resource-detail-content-items">
              {displayImage && (
                <Carousel
                  items={resource.images}
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
                <Heading4>{resource.title}</Heading4>
              )}
              <div className="osc-resource-detail-content-item-row">
                {displayUser && resource?.user?.displayName && (
                  <div>
                    <Heading6 className="osc-resource-detail-content-item-title">
                      Gemaakt door
                    </Heading6>
                    <span className="osc-resource-detail-content-item-text">
                      {resource.user.displayName}
                    </span>
                  </div>
                )}
                {displayDate && resource.startDateHumanized && (
                  <div>
                    <Heading6 className="osc-resource-detail-content-item-title">
                      Datum
                    </Heading6>
                    <span className="osc-resource-detail-content-item-text">
                      {resource.startDateHumanized}
                    </span>
                  </div>
                )}
                {displayBudget && resource.budget && (
                  <div>
                    <Heading6 className="osc-resource-detail-content-item-title">
                      Budget
                    </Heading6>
                    <span className="osc-resource-detail-content-item-text">
                      {`€ ${resource.budget.toLocaleString('nl-NL')}`}
                    </span>
                  </div>
                )}
              </div>
              <div>
                {displaySummary && <Heading5>{resource.summary}</Heading5>}
                {displayDescription && (
                  <Paragraph>{resource.description}</Paragraph>
                )}
              </div>
              {displayLocation && resource.location && (
                <>
                  <Heading4>Plaats</Heading4>
                  <ResourceDetailMap
                    resourceId={props.resourceId || '0'}

                    {...props}
                    center={resource.location}
                    markerIcon={icon}
                    area={props.resourceDetailMap?.area}
                  />
                </>
              )}
            </article>
          ) : (
            <span>resource niet gevonden..</span>
          )}
        </section>

        {shouldHaveSideColumn ? (
          <aside className="resource-detail-side-column">
            {displayLikes ? (
              <>
                <Likes
                  {...props}
                  title={props.likeWidget?.title}
                  yesLabel={props.likeWidget?.yesLabel}
                  noLabel={props.likeWidget?.noLabel}
                  hideCounters={props.likeWidget?.hideCounters}
                  variant={props.likeWidget?.variant}
                  showProgressBar={props.likeWidget?.showProgressBar}
                  progressBarDescription={
                    props.likeWidget?.progressBarDescription
                  }
                />
                <Spacer size={1} />
              </>
            ) : null}

            {displayStatus ? (
              <div className="resource-detail-side-section">
                <Spacer size={1} />
                <Heading4>Status</Heading4>
                <Spacer size={0.5} />
                <div className="resource-detail-pil-list-content">
                  {resource.statuses?.map((s: { label: string }) => (
                    <Pill light rounded text={s.label}></Pill>
                  ))}
                </div>

                <Spacer size={2} />
              </div>
            ) : null}

            {displayTags ? (
              <div className="resource-detail-side-section">
                <Heading4>Tags</Heading4>
                <Spacer size={0.5} />
                <div className="resource-detail-pil-list-content">
                  {(resource.tags as Array<{ type: string; name: string }>)
                    ?.filter((t) => t.type !== 'status')
                    ?.map((t) => <Pill text={t.name} />)}
                </div>
                <Spacer size={2} />
              </div>
            ) : null}

            {displaySocials ? (
              <div className="resource-detail-side-section">
                <Heading4>Deel dit</Heading4>
                <Spacer size={0.5} />
                <div className="resource-detail-side-section-socials">
                  <IconButton
                    onClick={() => {}}
                    className="secondary-action-button"
                    icon="ri-facebook-fill"
                  />

                  <IconButton
                    onClick={() => {}}
                    className="secondary-action-button"
                    icon="ri-whatsapp-fill"
                  />

                  <IconButton
                    onClick={() => {}}
                    className="secondary-action-button"
                    icon="ri-twitter-x-fill"
                  />

                  <IconButton
                    onClick={() => {}}
                    className="secondary-action-button"
                    icon="ri-mail-fill"
                  />

                  <IconButton
                    onClick={() => {
                      navigator.clipboard.writeText(location.href);
                    }}
                    className="secondary-action-button"
                    icon="ri-link"
                  />

                  <IconButton
                    onClick={() => {}}
                    className="secondary-action-button"
                    icon="ri-linkedin-fill"
                  />
                </div>
              </div>
            ) : null}
            <Spacer size={1} />
          </aside>
        ) : null}
      </div>

      <Spacer size={2} />

      {displayComments ? (
        <section className="resource-detail-comments-container">
          <Comments
            {...props}
            resourceId={resourceId}
            title={props.commentsWidget?.title}
            emptyListText={props.commentsWidget?.emptyListText}
            formIntro={props.commentsWidget?.formIntro}
            isVotingEnabled={props.commentsWidget?.isVotingEnabled || false}
            isReplyingEnabled={props.commentsWidget?.isReplyingEnabled || false}
            sentiment="for"
          />
          <Comments
            {...props}
            resourceId={resourceId}
            title={props.commentsWidget?.title}
            emptyListText={props.commentsWidget?.emptyListText}
            formIntro={props.commentsWidget?.formIntro}
            isVotingEnabled={props.commentsWidget?.isVotingEnabled || false}
            isReplyingEnabled={props.commentsWidget?.isReplyingEnabled || false}
            sentiment="against"
          />
        </section>
      ) : null}
    </section>
  );
}

ResourceDetail.loadWidget = loadWidget;
export { ResourceDetail };
