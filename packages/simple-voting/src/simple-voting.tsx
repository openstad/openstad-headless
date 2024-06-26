import './simple-voting.css';
import React from 'react';
import { loadWidget } from '@openstad-headless/lib/load-widget';
import { BaseProps, ProjectSettingProps } from '@openstad-headless/types';
import { StemBegroot, StemBegrootWidgetProps } from '@openstad-headless/stem-begroot/src/stem-begroot';

import '@utrecht/component-library-css';
import '@utrecht/design-tokens/dist/root.css';

export type SimpleVotingWidgetProps = BaseProps &
  ProjectSettingProps & {
    step1: string;
    step2: string;
    step3: string;
    step3success: string;
    voteMessage: string;
    thankMessage: string;
    showNewsletterButton: boolean;
    notEnoughBudgetText?: string;
    displayPagination?: boolean;
    displayRanking: boolean;
    displayPriceLabel: boolean;
    showVoteCount: boolean;
    showOriginalResource: boolean;
    originalResourceUrl?: string;
    displayTagFilters?: boolean;
    tagGroups?: Array<{ type: string; label?: string; multiple: boolean }>;
    displayTagGroupName?: boolean;
    defaultSorting?: string;
    sorting?: Array<{ label: string; value: string }>;
    displaySorting?: boolean;
    displaySearch?: boolean;
    displaySearchText?: boolean;
    textActiveSearch?: string;
    itemsPerPage?: number;
    onlyIncludeTagIds: string;
    resourceListColumns?: number;
  };

function SimpleVoting({ ...props }: SimpleVotingWidgetProps) {

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
    showInfoMenu: false,
    isSimpleView: true,
  }

  return (
    <>
      <StemBegroot
        {...config}
      />
    </>
  )
}

SimpleVoting.loadWidget = loadWidget;
export { SimpleVoting };
