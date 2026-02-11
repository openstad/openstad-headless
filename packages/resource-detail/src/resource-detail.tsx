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
  Paragraph, Link, Heading, Heading2, ActionGroup, ButtonLink,
} from '@utrecht/component-library-react';
import React, { useEffect, useState, useId } from 'react';
import { Likes, LikeWidgetProps } from '@openstad-headless/likes/src/likes';
import {
  Comments,
  CommentsWidgetProps,
} from '@openstad-headless/comments/src/comments';
import { ResourceDetailMapWidgetProps } from '@openstad-headless/leaflet-map/src/types/resource-detail-map-widget-props';

import { ResourceDetailMap } from '@openstad-headless/leaflet-map/src/resource-detail-map';
import { ShareLinks } from '../../apostrophe-widgets/share-links/src/share-links';
import { Button } from '@utrecht/component-library-react';
import { hasRole } from '../../lib';
import { MapPropsType } from '@openstad-headless/leaflet-map/src/types';
import { ResourceOverviewMapWidgetProps } from '@openstad-headless/leaflet-map/src/types/resource-overview-map-widget-props';
import RenderContent from '@openstad-headless/ui/src/rte-formatting/rte-formatting'

type booleanProps = {
  [K in
  | 'displayImage'
  | 'displayImageDescription'
  | 'displayTitle'
  | 'displayModBreak'
  | 'displaySummary'
  | 'displayDescription'
  | 'displayDescriptionExpandable'
  | 'displayUser'
  | 'displayDate'
  | 'displayBudget'
  | 'displayLocation'
  | 'displayBudgetDocuments'
  | 'displayLikes'
  | 'displayTags'
  | 'displayStatus'
  | 'displayDocuments'
  | 'clickableImage'
  | 'displayStatusBar'
  | 'displayEditResourceButton'
  | 'displayDeleteButton'
  | 'displayDeleteEditButtonOnTop'
  | 'displaySocials']: boolean | undefined;
};

export type ResourceDetailWidgetProps = {
  documentsTitle?: string;
  documentsDesc?: string;
  displayDescriptionExpandable_expandBeforeText?: string;
  displayDescriptionExpandable_expandAfterText?: string;
  displayDescriptionExpandable_visibleLines?: string;
} &
  BaseProps &
  ProjectSettingProps & {
    projectId?: string;
    resourceId?: string;
    resourceIdRelativePath?: string;
    backUrlIdRelativePath?: string;
    pageTitle?: boolean;
    backUrlText?: string;
    urlWithResourceFormForEditing?: string;
    displayDeleteButton?: boolean;
  } & MapPropsType & booleanProps & {
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
    resourceOverviewMapWidget?: Omit<
      ResourceOverviewMapWidgetProps,
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
  displayImageDescription = true,
  displayTitle = true,
  displayModBreak = true,
  displaySummary = true,
  displayDescription = true,
  displayDescriptionExpandable = false,
  displayDescriptionExpandable_expandBeforeText = 'Lees meer',
  displayDescriptionExpandable_expandAfterText = 'Lees minder',
  displayDescriptionExpandable_visibleLines = '4',
  displayUser = true,
  displayDate = true,
  displayBudget = true,
  displayLocation = true,
  displayBudgetDocuments = true,
  displayLikes = true,
  displayTags = true,
  displayStatus = true,
  displayStatusBar = true,
  displaySocials = true,
  displayDocuments = true,
  clickableImage = false,
  documentsTitle = '',
  documentsDesc = '',
  backUrlText = 'Terug naar het document',
  backUrlIdRelativePath = '',
  resourceOverviewMapWidget = {},
  displayEditResourceButton = false,
  urlWithResourceFormForEditing = '',
  displayDeleteButton = true,
  displayDeleteEditButtonOnTop = false,
  ...props
}: ResourceDetailWidgetProps) {
  const [refreshComments, setRefreshComments] = useState(false);
  const [expanded, setExpanded] = useState(false);
  const [showAccordion, setShowAccordion] = useState(false);
  const descriptionRef = React.useRef<HTMLDivElement>(null);
  const id = useId();

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
  const { data: resource, canEdit, canDelete } = datastore.useResource({
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

  const getIdFromHash = () => {
    try {
      const hash = window.location.hash;

      if (hash && hash.includes('#doc=')) {
        const docParams = hash.split('#doc=')[1];

        const cleanDocParams = docParams.split('#')[0];

        if (cleanDocParams && cleanDocParams.includes('?')) {
          const queryParams = cleanDocParams.split('?')[1];

          if (queryParams) {
            const params = queryParams.split('&');

            for (const param of params) {
              const [key, value] = param.split('=');

              if (value && !isNaN(Number(value))) {
                return value;
              }
            }
          }
        }
      }
    } catch (error) {
      console.error('Error while parsing the hash:', error);
    }

    return null;
  };

  const getPageHash = () => {
    if (window.location.hash.includes('#doc')) {
      let url = '/' + window.location.hash.split('=')[1] + (window.location.hash.split('=')[2] !== undefined ? '=' + window.location.hash.split('=')[2] : '');

      if (backUrlIdRelativePath) {
        const backUrlId = getIdFromHash();

        if (backUrlId) {
          url = backUrlIdRelativePath.replace('[id]', backUrlId);
        }
      }

      return <div className="back-url"><Link href={url}>{backUrlText}</Link></div>
    }
  };

  // props.commentsWidget?.useSentiments can be undefined, an array or a string with an arrayß
  let useSentiments = props.commentsWidget?.useSentiments;
  if (!!useSentiments && typeof useSentiments === 'string') {
    useSentiments = JSON.parse(useSentiments);
  }

  const statuses = (resource?.statuses || []).length ? resource.statuses
    ?.sort((a: { seqnr?: number }, b: { seqnr?: number }) => {
      if (a.seqnr === undefined || a.seqnr === null) return 1;
      if (b.seqnr === undefined || b.seqnr === null) return -1;
      return a.seqnr - b.seqnr;
    })
  : [];

  const firstStatus = statuses && statuses.length > 0 ? statuses[0] : false;

  const colorClass = firstStatus && firstStatus.color ? `color-${firstStatus.color}` : '';
  const backgroundColorClass = firstStatus && firstStatus.backgroundColor ? `bgColor-${firstStatus.backgroundColor}` : '';

  const statusClasses = `${colorClass} ${backgroundColorClass}`.trim();

  const renderImage = (src: string, clickableImage: boolean, imageDescription?: string) => {
    const imageElement = (
      <>
        <Image
          src={src}
          imageFooter={
            (displayStatusBar && resource.statuses && resource.statuses.length > 0) && (
              <div>
                <Paragraph className={`osc-resource-detail-content-item-status ${statusClasses}`}>
                  {resource.statuses
                    ?.map((s: { name: string }) => s.name)
                    ?.sort((a: { seqnr?: number }, b: { seqnr?: number }) => {
                      if (a.seqnr === undefined || a.seqnr === null) return 1;
                      if (b.seqnr === undefined || b.seqnr === null) return -1;
                      return a.seqnr - b.seqnr;
                    })
                    ?.join(', ')}
                </Paragraph>
              </div>
            )
          }
        />

        {(displayImageDescription && imageDescription) && (
          <p
            className="carousel-image-description"
          >
            {imageDescription}
          </p>
        )}
      </>
    );

    return clickableImage ? (
      <a href={src} target="_blank" rel="noreferrer">
        {imageElement}
      </a>
    ) : (
      imageElement
    );
  };

  const onRemoveClick = async (resource: any) => {
    try {
      if (typeof resource.delete === 'function') {
        await resource.delete(resource.id);
        setTimeout(() => {
          window.history.back();
        }, 1000);
      } else {
        console.error('Delete method not found on resource');
      }
    } catch (e) {
      console.error(e);
    }
  };


  useEffect(() => {
    if (props.pageTitle === true && resource.title !== undefined) {
      const current = document.title.includes(' - ') && document.title.split(' - ')[0].length ? ' - ' + document.title.split(' - ')[0] : '';
      document.title = resource.title + current;
    }
  }, [resource]);

  useEffect(() => {
    if (displayDescriptionExpandable && descriptionRef.current) {
      const lineHeight = parseFloat(getComputedStyle(descriptionRef.current).lineHeight || '1.65');
      const visibleLines = parseInt(displayDescriptionExpandable_visibleLines, 10) || 4;
      const maxHeight = lineHeight * visibleLines;
      const contentHeight = descriptionRef.current.scrollHeight;
      setShowAccordion(contentHeight > maxHeight);
    }
  }, [resource?.description, displayDescriptionExpandable, displayDescriptionExpandable_visibleLines, expanded]);

  const dataLayerSettings = !!resourceOverviewMapWidget?.datalayer ? {
    datalayer: resourceOverviewMapWidget?.datalayer || [],
    enableOnOffSwitching: resourceOverviewMapWidget?.enableOnOffSwitching || false,
  } : {};

  const GroupButtonDeleteEdit = () => (
    <ActionGroup>
      {(canDelete && displayDeleteButton) && (
        <>
          <Spacer size={2} />
          <Button
            appearance="primary-action-button"
            onClick={() => {
              if (confirm("De inzending wordt verwijderd. Dit kan niet teruggedraaid worden. Doorgaan?"))
                onRemoveClick(resource);
            }}
          >
            <Icon icon="ri-delete-bin-line"></Icon>
            Verwijder de inzending
          </Button>
        </>
      )}

      {(canEdit && displayEditResourceButton && urlWithResourceFormForEditing) && (
        <>
          <Spacer size={2} />
          <Button
            appearance="primary-action-button"
            onClick={() => {
              const hrefUrl = `${urlWithResourceFormForEditing}?openstadResourceId=${resource.id}`;
              document.location.href = hrefUrl;
            }}
          >
            <Icon icon="ri-edit-box-line"></Icon>
            Bewerk de inzending
          </Button>
        </>
      )}
    </ActionGroup>
  )

  return (
    <section className="osc-resource-detail-widget-container">
      {displayDeleteEditButtonOnTop && <GroupButtonDeleteEdit />}
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
                    renderImage(i.url, clickableImage, i.description)
                  )}
                />
              )}

              {displayTitle && resource.title && (
                <Heading level={1} appearance="utrecht-heading-2" dangerouslySetInnerHTML={{ __html: resource.title }}></Heading>
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
                {displaySummary && <Heading level={2} appearance='utrecht-heading-4' dangerouslySetInnerHTML={{ __html: resource.summary }}></Heading>}
                {displayDescription && (
                  !displayDescriptionExpandable ? (
                    <div className="resource-detail-description">
                      <Paragraph dangerouslySetInnerHTML={{ __html: RenderContent(resource.description) }}></Paragraph>
                    </div>
                  ) : (
                    showAccordion ? (
                      <div className="resource-detail-description --expandable">
                        <div className="dd-accordion ">
                          <div id={id} className="dd-accordion-container" role="region" aria-hidden={!expanded}>
                            <div className="dd-accordion-content-wrapper" data-visible-lines={displayDescriptionExpandable_visibleLines}>
                              <div className="dd-accordion-content" ref={descriptionRef}>
                                <Paragraph dangerouslySetInnerHTML={{ __html: RenderContent(resource.description) }}></Paragraph>
                              </div>
                            </div>
                          </div>
                          <Button
                            appearance="primary-action-button"
                            type="button"
                            className="dd-accordion-trigger"
                            aria-expanded={expanded}
                            aria-controls={id} onClick={() => setExpanded(!expanded)}>
                            <span>{expanded ? displayDescriptionExpandable_expandAfterText : displayDescriptionExpandable_expandBeforeText}</span>
                            <i className="ri-arrow-drop-down-line icon"></i>
                          </Button>
                        </div>
                      </div>
                    ) : (
                      <div className="resource-detail-description">
                        <div ref={descriptionRef}>
                          <Paragraph dangerouslySetInnerHTML={{ __html: RenderContent(resource.description) }}></Paragraph>
                        </div>
                      </div>
                    )
                  )
                )}
              </div>
              {displayLocation && resource.location && (
                <>
                  <Heading level={2} appearance="utrecht-heading-2">Plaats</Heading>
                  <ResourceDetailMap
                    resourceId={resource.id || resourceId || '0'}
                    resourceIdRelativePath={props.resourceIdRelativePath || 'openstadResourceId'}
                    {...resourceOverviewMapWidget}
                    {...props}
                    dataLayerSettings={dataLayerSettings}
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
                    {statuses?.map((s: { name: string }) => (
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
                    {(resource.tags as Array<{ type: string; name: string, seqnr?: number }>)
                      ?.filter((t) => t.type !== 'status')
                      ?.sort((a: { seqnr?: number }, b: { seqnr?: number }) => {
                        if (a.seqnr === undefined || a.seqnr === null) return 1;
                        if (b.seqnr === undefined || b.seqnr === null) return -1;
                        return a.seqnr - b.seqnr;
                      })
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
                  <ActionGroup>
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
                  </ActionGroup>
                </div>
              </div>
            )}

          </aside>
        ) : null}
      </div>

      {!displayDeleteEditButtonOnTop && <GroupButtonDeleteEdit />}

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
            itemsPerPage={props.commentsWidget?.itemsPerPage}
            displayPagination={props.commentsWidget?.displayPagination}
            confirmation={ props.commentsWidget?.confirmation }
            overwriteEmailAddress={ props.commentsWidget?.overwriteEmailAddress }
            confirmationReplies={ props.commentsWidget?.confirmationReplies }
            extraFieldsTagGroups={props.commentsWidget?.extraFieldsTagGroups}
            defaultTags={props.commentsWidget?.defaultTags}
            includeOrExclude={props.commentsWidget?.includeOrExclude}
            onlyIncludeOrExcludeTagIds={props.commentsWidget?.onlyIncludeOrExcludeTagIds}
            displaySearchBar={props.commentsWidget?.displaySearchBar}
            variant={props.commentsWidget?.variant}
            extraReplyButton={ props.commentsWidget?.extraReplyButton }
            defaultSorting={ props.commentsWidget?.defaultSorting }
            sorting={ props.commentsWidget?.sorting }
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
              itemsPerPage={props.commentsWidget?.itemsPerPage}
              displayPagination={props.commentsWidget?.displayPagination}
              confirmation={ props.commentsWidget?.confirmation }
              overwriteEmailAddress={ props.commentsWidget?.overwriteEmailAddress }
              confirmationReplies={ props.commentsWidget?.confirmationReplies }
              extraFieldsTagGroups={props.commentsWidget?.extraFieldsTagGroups}
              defaultTags={props.commentsWidget?.defaultTags}
              includeOrExclude={props.commentsWidget?.includeOrExclude}
              onlyIncludeOrExcludeTagIds={props.commentsWidget?.onlyIncludeOrExcludeTagIds}
              displaySearchBar={props.commentsWidget?.displaySearchBar}
              variant={props.commentsWidget?.variant}
              extraReplyButton={ props.commentsWidget?.extraReplyButton }
              sorting={ props.commentsWidget?.sorting }
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
