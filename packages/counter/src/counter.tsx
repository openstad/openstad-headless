import { loadWidget } from '@openstad-headless/lib/load-widget'
import React, { useEffect, useState } from 'react'
import './counter.css'

export type CounterWidgetProps = {
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
  id = 0
}: CounterWidgetProps) {
  let amountDisplayed = 0;

  if (counterType === 'resource') {
    amountDisplayed = 10;
  }

  if (counterType === 'vote') {
    if (opinion === 'for') {
      amountDisplayed = 21;
    } else if (opinion === 'against') {
      amountDisplayed = 22;
    } else {
      amountDisplayed = 20;
    }
  }

  if (counterType === 'votedUsers') {
    amountDisplayed = 30;
  }

  if (counterType === 'static') {
    amountDisplayed = amount;
  }

  if (counterType === 'argument') {
    if (opinion === 'for') {
      amountDisplayed = 51;
    } else if (opinion === 'against') {
      amountDisplayed = 52;
    } else {
      amountDisplayed = 50;
    }
  }

  if (counterType === 'submission') {
    amountDisplayed = 60;
  }

  return (
    <div className='osc counter-container'>
      <p>{amountDisplayed}</p>
      <p>{label}</p>
    </div>
  )
}

Counter.loadWidget = loadWidget;
export { Counter }