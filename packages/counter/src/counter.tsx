import { loadWidget } from '@openstad-headless/lib/load-widget'
import React, { useEffect, useState } from 'react'
import './counter.css'
import DataStore from '@openstad-headless/data-store/src'
import { BaseProps } from '../../types/base-props'
import { ProjectSettingProps } from '../../types/project-setting-props'
import SessionStorage from '@openstad-headless/lib/session-storage'

export type CounterWidgetProps = BaseProps &
  CounterProps &
  ProjectSettingProps & {
    resourceId?: string;
  }

export type CounterProps = {
  counterType?: 'resource' | 'vote' | 'votedUsers' | 'static' | 'argument' | 'submission';
  label?: string;
  url?: string;
  opinion?: string;
  amount?: number;
  id?: number;
}

function Counter({
  counterType = 'vote',
  label = 'Counter 1',
  url = 'https://www.google.com',
  opinion = '',
  amount = 0,
  id = 0,
  ...props
}: CounterWidgetProps) {
  let amountDisplayed = 0;
  const urlParams = new URLSearchParams(window.location.search);
  const resourceId =
    urlParams.get('openstadResourceId') || props.resourceId || '';

  const datastore: any = new DataStore({
    projectId: props.projectId,
    api: props.api
  })

  const [resources] = datastore.useResources({
    projectId: props.projectId,
  })

  const [resource] = datastore.useResource({
    projectId: props.projectId,
    resourceId,
  });

  const [comments] = datastore.useCommentsByProject({
    projectId: props.projectId,
    sentiment: opinion
  })

  const [comment] = datastore.useComments({
    projectId: props.projectId,
    resourceId: id,
    sentiment: opinion
  })

  const [submissions] = datastore.useSubmissions({
    projectId: props.projectId
  });

  console.log(opinion)

  if (counterType === 'resource') {
    amountDisplayed = resources.length;
  }

  if (counterType === 'vote') {
    if (opinion === 'for') {
      amountDisplayed = resource.yes;
    } else if (opinion === 'against') {
      amountDisplayed = resource.no;
    } else {
      amountDisplayed = resource.yes + resource.no;
    }
  }

  if (counterType === 'votedUsers') {
    amountDisplayed = resource.yes + resource.no;
  }

  if (counterType === 'static') {
    amountDisplayed = amount;
  }

  if (counterType === 'argument') {
    if (id > 0) {
      amountDisplayed = comment.length;
    } else {
      amountDisplayed = comments.length;
    }
  }

  if (counterType === 'submission') {
    amountDisplayed = submissions.length;
  }

  return (
    <div className='osc counter-container'>
      <p>{label}:</p>
      <p className='osc counter-container-amount'>{amountDisplayed}</p>
    </div>
  )
}

Counter.loadWidget = loadWidget;
export { Counter }