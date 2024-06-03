import './resource-detail.css';
//@ts-ignore D.type def missing, will disappear when datastore is ts
import DataStore from '@openstad-headless/data-store/src';
import { loadWidget } from '@openstad-headless/lib/load-widget';
import { getResourceId } from '@openstad-headless/lib/get-resource-id';
import {
  Carousel,
  Image,
  Spacer,
  Pill,
  IconButton, Icon,
} from '@openstad-headless/ui/src';
import { BaseProps, ProjectSettingProps } from '@openstad-headless/types';
import '@utrecht/component-library-css';
import '@utrecht/design-tokens/dist/root.css';
import {
  Paragraph,
  Heading, Heading2, ButtonGroup, ButtonLink,
} from '@utrecht/component-library-react';
import React from 'react';
import { Likes, LikeWidgetProps } from '@openstad-headless/likes/src/likes';
import { Comments, CommentsWidgetProps } from '@openstad-headless/comments/src/comments';
import { ResourceDetailMapWidgetProps } from '@openstad-headless/leaflet-map/src/types/resource-detail-map-widget-props';

import { ResourceDetailMap } from '@openstad-headless/leaflet-map/src/resource-detail-map';
import { ShareLinks } from '../../apostrophe-widgets/share-links/src/share-links';
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
  displayDocuments = true,
  documentsTitle = '',
  documentsDesc = '',
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

  if (!resource) return null;
  const shouldHaveSideColumn =
    displayLikes || displayTags || displayStatus || displaySocials;
  return (
    <section>
      <div
        className={`osc ${shouldHaveSideColumn
          ? 'osc-resource-detail-column-container'
          : 'osc-resource-detail-container'
          }`}>
        <section className="osc-resource-detail-content osc-resource-detail-content--span-2">
          {resource ? (
            <article className="osc-resource-detail-content-items">
              {displayImage  && (
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
                <Heading level={1} appearance="utrecht-heading-2">{resource.title}</Heading>
              )}
              <div className="osc-resource-detail-content-item-row">
                {displayUser && resource?.user?.displayName && (
                  <div>
                    <Heading level={2} appearance='utrecht-heading-6' className="osc-resource-detail-content-item-title">
                      Gemaakt door
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
                {displaySummary && <Heading level={2} appearance='utrecht-heading-4'>{resource.summary}</Heading>}
                {displayDescription && (
                  <Paragraph>{resource.description}</Paragraph>
                )}
              </div>
              {displayLocation && resource.location && (
                <>
                  <Heading level={2} appearance="utrecht-heading-2">Plaats</Heading>
                  <ResourceDetailMap
                    resourceId={props.resourceId || '0'}
                    {...props}
                    center={resource.location}
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
                <Heading level={3} appearance="utrecht-heading-4">Status</Heading>
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
                <Heading level={3} appearance="utrecht-heading-4">Tags</Heading>

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
                <ShareLinks title={'Deel dit'} />
              </div>
            ) : null}

            { (!!displayDocuments && !!resource && Array.isArray(resource.documents) && resource.documents.length > 0 ) && (
              <>
                <Spacer size={2} />
                <div>
                  {!!documentsTitle && (<Heading2>{documentsTitle}</Heading2>)}
                  {!!documentsDesc && (<Paragraph>{documentsDesc}</Paragraph>)}
                  <ButtonGroup>
                    {resource.documents?.map((document, index) => (
                      <ButtonLink
                        appearance="secondary-action-button"
                        className="osc counter-container"
                        download
                        href={document.url}
                        key={index}
                      >
                        <Icon
                          variant="ri-download-2-fill"
                        />
                        {document.name}
                      </ButtonLink>
                    ))}
                  </ButtonGroup>
                </div>
              </>
            )}

          </aside>
        ) : null}
      </div>

      <Spacer size={2} />

      {Array.isArray(props.commentsWidget?.useSentiments) && props.commentsWidget?.useSentiments?.length ? (
        <section className="resource-detail-comments-container">
          {props.commentsWidget?.useSentiments?.map(sentiment => (
            <Comments
              {...props}
              resourceId={resourceId || ''}
              title={props.commentsWidget?.title}
              emptyListText={props.commentsWidget?.emptyListText}
              formIntro={props.commentsWidget?.formIntro}
              placeholder={props.commentsWidget?.placeholder}
              sentiment={sentiment}
            />
          ))}
        </section>
      ) : null}
    </section>
  );
}

ResourceDetail.loadWidget = loadWidget;
export { ResourceDetail };
