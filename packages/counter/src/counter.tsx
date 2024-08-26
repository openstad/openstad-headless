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
  | 'submission';
  label?: string;
  url?: string;
  opinion?: string;
  amount?: number;
  choiceGuideId?: string;
  includeOrExclude?: string;
  onlyIncludeOrExcludeTagIds?: string;
};

function Counter({
  counterType = 'resource',
  label = 'Hoeveelheid',
  url = '',
  opinion = '',
  amount = 0,
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

  const {data: allTags} = datastore.useTags({
    projectId: props.projectId,
    type: ''
  });

  const tagIdsArray = tagIds.split(',').map(id => parseInt(id.trim(), 10)).filter(id => !isNaN(id));

  function determineTags(includeOrExclude: string, allTags: any, tagIdsArray: Array<number>) {
    let filteredTagIdsArray: Array<number> = [];
    try {
      if (includeOrExclude === 'exclude' && tagIdsArray.length > 0 ) {
        filteredTagIdsArray = allTags.filter((tag: {id: number}) => !tagIdsArray.includes((tag.id))).map((tag: {id: number}) => tag.id);
      } else if (includeOrExclude === 'include') {
        filteredTagIdsArray = tagIdsArray;
      }

      return {
        tags: filteredTagIdsArray || []
      };

    } catch (error) {
      console.error('Error processing tags:', error);

      return {
        tags: []
      };
    }
  }

  const { tags: filteredTagIdsArray } = determineTags(includeOrExclude, allTags, tagIdsArray);

  const { data: resources } = datastore.useResources({
    projectId: counterType === 'resource' ? props.projectId : undefined,
    pageSize: 999999,
    includeTags: '',
  });

  const filteredResources = resources && resources?.records && filteredTagIdsArray && Array.isArray(filteredTagIdsArray) && filteredTagIdsArray.length > 0
      ? resources?.records?.filter((resource: any) => {
        if (includeOrExclude === 'exclude') {
          if (!resource.tags || !Array.isArray(resource.tags) || resource.tags.length === 0) {
            return true;
          }
          return !filteredTagIdsArray.some((tag) => resource.tags.find((o: { id: number }) => o.id === tag));
        } else {
          return filteredTagIdsArray.some((tag) => resource.tags && Array.isArray(resource.tags) && resource.tags.find((o: { id: number }) => o.id === tag));
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

  const {
    data: results,
    error,
    isLoading,
  } = datastore.useChoiceGuideResults({
    projectId: props.projectId,
    choiceGuideId:
      counterType === 'submission' ? props.choiceGuideId : undefined,
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
    amountDisplayed = (resource.yes || 0) + (resource.no || 0);
  }

  if (counterType === 'static') {
    amountDisplayed = amount;
  }

  if (counterType === 'argument') {
    amountDisplayed = comments?.length || 0;
  }

  if (counterType === 'submission') {
    amountDisplayed = results?.length || 0;
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
