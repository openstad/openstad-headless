import { loadWidget } from '@openstad-headless/lib/load-widget';
import {
  StemBegroot,
  StemBegrootWidgetProps,
} from '@openstad-headless/stem-begroot/src/stem-begroot';
import { BaseProps, ProjectSettingProps } from '@openstad-headless/types';
import '@utrecht/component-library-css';
import '@utrecht/design-tokens/dist/root.css';
import React from 'react';

import './simple-voting.css';

function SimpleVoting({ ...props }: StemBegrootWidgetProps) {
  const config = {
    ...props,
    votes: {
      isViewable: true,
      mustConfirm: false,
      requiredUserRole: 'member',
      voteValues: [],
      maxResources: 1,
      minResources: 1,
      minBudget: 1,
      maxBudget: 1,
      isActive: true,
      voteType: 'count',
      withExisting: 'error',
    },
    isSimpleView: true,
  };
  return (
    <>
      <StemBegroot {...config} />
    </>
  );
}

SimpleVoting.loadWidget = loadWidget;
export { SimpleVoting };
