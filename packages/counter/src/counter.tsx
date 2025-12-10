import { loadWidget } from '@openstad-headless/lib/load-widget';
import '@utrecht/component-library-css';
import '@utrecht/design-tokens/dist/root.css';
import { Paragraph, ButtonLink } from '@utrecht/component-library-react';
import React from 'react';
import './counter.css';
import DataStore from '@openstad-headless/data-store/src';
import { ProjectSettingProps, BaseProps } from '@openstad-headless/types';

export type CounterWidgetProps = BaseProps &
  CounterProps &
  ProjectSettingProps & {
    resourceId?: string;
  };

export type CounterProps = {
  counterType:
  | 'resource'
  | 'vote'
  | 'votedUsers'
  | 'static'
  | 'argument'
  | 'enqueteResults'
  | 'choiceGuideResults';
  label?: string;
  url?: string;
  opinion?: string;
  amount?: number;
  rigCounter?: string;
  widgetToFetchId?: string;
  includeOrExclude?: string;
  onlyIncludeOrExcludeTagIds?: string;
};

function Counter({
  counterType = 'resource',
  label = 'Hoeveelheid',
  url = '',
  opinion = '',
  amount = 0,
  rigCounter = '0',
  includeOrExclude = 'include',
  onlyIncludeOrExcludeTagIds = '',
  ...props
}: CounterWidgetProps) {
  let amountDisplayed = 0;
  const urlParams = new URLSearchParams(window.location.search);
  const resourceId =
    urlParams.get('openstadResourceId') || props.resourceId || '';

  const datastore: any = new DataStore({
    projectId: props.projectId,
    api: props.api,
  });

  const tagIds = !!onlyIncludeOrExcludeTagIds && onlyIncludeOrExcludeTagIds.startsWith(',') ? onlyIncludeOrExcludeTagIds.substring(1) : onlyIncludeOrExcludeTagIds;

  const tagIdsArray = tagIds.split(',').map(id => parseInt(id.trim(), 10)).filter(id => !isNaN(id));

  const { data: resources } = datastore.useResources({
    projectId: props.projectId,
    pageSize: 999999,
    includeTags: '',
  });  

  const filteredResources = resources && resources?.records && tagIdsArray && Array.isArray(tagIdsArray) && tagIdsArray.length > 0
      ? resources?.records?.filter((resource: any) => {
        if (includeOrExclude === 'exclude') {
          const hasExcludedTag = resource.tags?.some((tag: { id: number }) =>
            tagIdsArray.includes(tag.id)
          );

          return !hasExcludedTag;
        } else {
          return tagIdsArray.some((tag) => resource.tags && Array.isArray(resource.tags) && resource.tags.find((o: { id: number }) => o.id === tag));
        }
      })
      : resources?.records;

  const { data: resource } = datastore.useResource({
    projectId: props.projectId,
    resourceId,
  });

  const { data: comments } = datastore.useComments({
    projectId: props.projectId,
    resourceId: counterType === 'argument' ? resourceId : undefined,
    sentiment: opinion,
  });

  let { data: votes } = datastore.useUserVote({
    projectId: props.projectId
  });

  const {
    data: results,
    error,
    isLoading,
  } = datastore.useChoiceGuideResultCount({
    projectId: props.projectId,
    widgetToFetchId:
      counterType === 'choiceGuideResults' ? props.widgetToFetchId : undefined,
  });

  const {
    data: enqueteResults
  } = datastore.useEnqueteResultCount({
    projectId: props.projectId,
    widgetToFetchId:
      counterType === 'enqueteResults' ? props.widgetToFetchId : undefined,
  });

  if (counterType === 'resource') {
    amountDisplayed = (filteredResources || []).length;
  }

  if (counterType === 'vote') {
    if (opinion === 'for') {
      amountDisplayed = resource.yes || 0;
    } else if (opinion === 'against') {
      amountDisplayed = resource.no || 0;
    } else {
      amountDisplayed = (resource.yes || 0) + (resource.no || 0);
    }
  }

  if (counterType === 'votedUsers') {
    votes = votes || {};
    if ( votes.submitVote ) {
      delete votes.submitVote;
    }

    let uniqueUserIds = Object.values(votes).map((vote: any) => vote.userId);
    uniqueUserIds = Array.from(new Set(uniqueUserIds));

    amountDisplayed = uniqueUserIds.length || 0;
  }

  if (counterType === 'static') {
    amountDisplayed = amount;
  }

  if (counterType === 'argument') {
    amountDisplayed = comments?.length || 0;
  }

  if (counterType === 'choiceGuideResults') {
    amountDisplayed = results || 0;
  }

  if (counterType === 'enqueteResults') {
    amountDisplayed = enqueteResults || 0;
  }

  if (counterType !== 'static' && rigCounter !== '0' && amountDisplayed !== 0) {
    const currAmount = isNaN(Number(amountDisplayed)) ? 0 : Number(amountDisplayed);
    const rigCounterNumber = isNaN(Number(rigCounter)) ? 0 : Number(rigCounter);

    amountDisplayed = currAmount + rigCounterNumber;
  }

  const content = () => {
    const renderAmount = (e: number) => {
      return e.toString().split('').map((item, index) => <span className="amount-item" key={index}><span>{item}</span></span>);
    };
    return (
      <Paragraph>
        <span className="amount">
          {renderAmount(amountDisplayed || 0)}
        </span>
        {label ? <span className="label">{label}</span> : null}
      </Paragraph>
    );
  };
  return url.length > 0 ? (
    <ButtonLink
      appearance="secondary-action-button"
      className="osc counter-container --link"
      href={url}>
      {content()}
    </ButtonLink>
  ) : (
    <div className="osc counter-container">
      <>{content()}</>
    </div>
  );
}

Counter.loadWidget = loadWidget;
export { Counter };
