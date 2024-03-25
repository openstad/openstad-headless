import './resource-detail.css';
//@ts-ignore D.type def missing, will disappear when datastore is ts
import DataStore from '@openstad-headless/data-store/src';
import { loadWidget } from '@openstad-headless/lib/load-widget';
import {
  Carousel,
  Image,
} from '@openstad-headless/ui/src';
import { BaseProps } from '../../types/base-props';
import { ProjectSettingProps } from '../../types/project-setting-props';

import '@utrecht/component-library-css';
import '@utrecht/design-tokens/dist/root.css';
import {
  Paragraph,
  Heading4,
  Heading5,
  Heading6,
} from '@utrecht/component-library-react';
import React from 'react';

export type ResourceDetailWidgetProps = BaseProps &
  ProjectSettingProps & {
    projectId?: string;
    resourceId?: string;
    resourceIdRelativePath?: string;
  } & {
    displayImage?: boolean;
    displayTitle?: boolean;
    displaySummary?: boolean;
    displayDescription?: boolean;
    displayUser?: boolean;
    displayDate?: boolean;
    displayBudget?: boolean;
    displayLocation?: boolean;
    displayBudgetDocuments?: boolean;
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
  ...props
}: ResourceDetailWidgetProps) {
  const urlParams = new URLSearchParams(window.location.search);
  let resourceId = props.resourceId;

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
        ? parseInt(urlParams.get('openstadResourceId') as string)
        : 0
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

  if (!resource) return null;

  return (
    <div className={`osc ${'osc-resource-detail-column-container'}`}>
      <section className="osc-resource-detail-content osc-resource-detail-content--span-2">
        {resource ? (
          <article className="osc-resource-detail-content-items">
            {displayImage && (
              <Carousel
                items={resource.images}
                itemRenderer={(i) => (
                  <Image
                    src={resource.images?.at(0)?.url || ''}
                    imageFooter={
                      <div>
                        <Paragraph className="osc-resource-detail-content-item-status">
                          {resource.statuses
                            ?.map((s: { label: string }) => s.label)
                            ?.join(',')}
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
            {displayLocation && resource.position && (
              <>
                <Heading4>Plaats</Heading4>
                <Paragraph className="osc-resource-detail-content-item-location">
                  {`${resource.position.lat}, ${resource.position.lng}`}
                </Paragraph>
              </>
            )}
          </article>
        ) : (
          <span>resource niet gevonden..</span>
        )}
      </section>
    </div>
  );
}

ResourceDetail.loadWidget = loadWidget;
export { ResourceDetail };
