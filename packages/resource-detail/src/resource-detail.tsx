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
  Paragraph, Link, Heading, Heading2, ButtonGroup, ButtonLink,
} from '@utrecht/component-library-react';
import React, { useState } from 'react';
import { Likes, LikeWidgetProps } from '@openstad-headless/likes/src/likes';
import {
  Comments,
  CommentsWidgetProps,
} from '@openstad-headless/comments/src/comments';
import { ResourceDetailMapWidgetProps } from '@openstad-headless/leaflet-map/src/types/resource-detail-map-widget-props';

import { ResourceDetailMap } from '@openstad-headless/leaflet-map/src/resource-detail-map';
import { ShareLinks } from '../../apostrophe-widgets/share-links/src/share-links';
type booleanProps = {
  [K in
  | 'displayImage'
  | 'displayTitle'
  | 'displayModBreak'
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
} &
  BaseProps &
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
    commentsWidget_multiple?: Omit<
    CommentsWidgetProps,
    keyof BaseProps | keyof ProjectSettingProps | 'resourceId'
  >;
    resourceDetailMap?: Omit<
      ResourceDetailMapWidgetProps,
      keyof BaseProps | keyof ProjectSettingProps | 'resourceId'
    >;
  };

type DocumentType = {
  name?: string;
  url?: string;
}

function ResourceDetail({
  displayImage = true,
  displayTitle = true,
  displayModBreak = true,
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
  const [refreshComments, setRefreshComments] = useState(false);

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
    displayLikes || displayTags || displayStatus || displaySocials || displayDocuments;

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

  const getPageHash = () => {
    if (window.location.hash.includes('#doc')) {
      const url = '/' + window.location.hash.split('=')[1] + (window.location.hash.split('=')[2] !== undefined ? '=' + window.location.hash.split('=')[2] : '');

      return <div className="back-url"><Link href={url}>Terug naar het document</Link></div>
    }
  };

  // props.commentsWidget?.useSentiments can be undefined, an array or a string with an arrayß
  let useSentiments = props.commentsWidget?.useSentiments;
  if (!!useSentiments && typeof useSentiments === 'string') {
    useSentiments = JSON.parse(useSentiments);
  }

  const firstStatus = resource.statuses && resource.statuses.length > 0 ? resource.statuses[0] : null;
  const colorClass = firstStatus && firstStatus.color ? `color-${firstStatus.color}` : '';
  const backgroundColorClass = firstStatus && firstStatus.backgroundColor ? `bgColor-${firstStatus.backgroundColor}` : '';

  const statusClasses = `${colorClass} ${backgroundColorClass}`.trim();

  return (
    <section>
      <div
        className={`osc ${shouldHaveSideColumn
          ? 'osc-resource-detail-column-container'
          : 'osc-resource-detail-container'
          }`}>
        <section className="osc-resource-detail-content osc-resource-detail-content--span-2">
          {getPageHash()}
          {resource ? (
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
                          <Paragraph className={`osc-resource-detail-content-item-status ${statusClasses}`}>
                            {resource.statuses
                              ?.map((s: { name: string }) => s.name)
                              ?.join(', ')}
                          </Paragraph>
                        </div>
                      }
                    />
                  )}
                />
              )}

              {displayTitle && resource.title && (
                <Heading level={1} appearance="utrecht-heading-2" dangerouslySetInnerHTML={{__html: resource.title}}></Heading>
              )}

              {displayModBreak && resource.modBreak && (
                <div className="resource-detail-modbreak-banner">
                  <section>
                    <Heading level={2} appearance='utrecht-heading-6'>{props.resources.modbreakTitle}</Heading>
                    <Heading level={2} appearance='utrecht-heading-6'>{resource.modBreakDateHumanized}</Heading>
                  </section>
                  <Spacer size={1} />
                  <Heading level={2} appearance='utrecht-heading-6'>{resource.modBreak}</Heading>
                </div>
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
                {displaySummary && <Heading level={2} appearance='utrecht-heading-4' dangerouslySetInnerHTML={{__html: resource.summary}}></Heading>}
                {displayDescription && (
                  <Paragraph dangerouslySetInnerHTML={{__html: resource.description}}></Paragraph>
                )}
              </div>
              {displayLocation && resource.location && (
                <>
                  <Heading level={2} appearance="utrecht-heading-2">Plaats</Heading>
                  <ResourceDetailMap
                    resourceId={resource.id || resourceId || '0'}
                    resourceIdRelativePath={props.resourceIdRelativePath || 'openstadResourceId'}
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
            <div className="aside--content">
              {displayLikes ? (
                <>
                  <Likes
                    {...props}
                    title={props.likeWidget?.title}
                    yesLabel={props.likeWidget?.yesLabel}
                    noLabel={props.likeWidget?.noLabel}
                    displayDislike={props.likeWidget?.displayDislike}
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
                    {resource.statuses?.map((s: { name: string }) => (
                      <Pill light rounded text={s.name}></Pill>
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
            </div>
            {(!!displayDocuments && !!resource && Array.isArray(resource.documents) && resource.documents.length > 0) && (
              <div className="aside--content">
                <Spacer size={2} />
                <div className='document-download-container'>
                  {!!documentsTitle && (<Heading level={2} appearance="utrecht-heading-4">{documentsTitle}</Heading>)}
                  {!!documentsDesc && (<Paragraph>{documentsDesc}</Paragraph>)}
                  <ButtonGroup>
                    {resource.documents?.map((document: DocumentType, index: number) => (
                      <ButtonLink
                        appearance="primary-action-button"
                        className="osc counter-container"
                        download
                        href={document.url}
                        key={index}
                      >
                        <Icon
                          icon="ri-download-2-fill"
                        />
                        {document.name}
                      </ButtonLink>
                    ))}
                  </ButtonGroup>
                </div>
              </div>
            )}

          </aside>
        ) : null}
      </div>

      <Spacer size={2} />

      {Array.isArray(useSentiments) &&
        useSentiments?.length ? (
        <section className="resource-detail-comments-container">
          <Comments
            {...props}
            key={refreshComments ? 'refresh1' : 'no-refresh1'}
            setRefreshComments={setRefreshComments}
            resourceId={resourceId || ''}
            title={props.commentsWidget?.title}
            emptyListText={props.commentsWidget?.emptyListText}
            formIntro={props.commentsWidget?.formIntro}
            placeholder={props.commentsWidget?.placeholder}
            loginText={props.commentsWidget?.loginText}
            closedText={props.commentsWidget?.closedText}
            sentiment={useSentiments[0]}
          />

          {useSentiments?.length > 1 && (
            <Comments
              {...props}
              key={refreshComments ? 'refresh2' : 'no-refresh2'}
              setRefreshComments={setRefreshComments}
              resourceId={resourceId || ''}
              title={props.commentsWidget_multiple?.title}
              emptyListText={props.commentsWidget_multiple?.emptyListText}
              formIntro={props.commentsWidget_multiple?.formIntro}
              placeholder={props.commentsWidget_multiple?.placeholder}
              loginText={props.commentsWidget_multiple?.loginText}
              closedText={props.commentsWidget_multiple?.closedText}
              sentiment={useSentiments[1]}
            />
          )}


        </section>
      ) : null}
    </section>
  );
}

ResourceDetail.loadWidget = loadWidget;
export { ResourceDetail };
