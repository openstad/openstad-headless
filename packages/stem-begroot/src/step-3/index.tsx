import { Spacer } from '@openstad-headless/ui/src';
import RenderContent from '@openstad-headless/ui/src/rte-formatting/rte-formatting';
import '@utrecht/component-library-css';
import { Button, Heading3 } from '@utrecht/component-library-react';
import '@utrecht/design-tokens/dist/root.css';
import React from 'react';

import { createVotePendingStorage } from '../utils/vote-pending-storage';

type Props = {
  loginUrl: string;
  step3: string;
  stemCodeTitle: string;
  step3Title: string;
  projectId?: string | number;
  voteType?: string;
  apiUrl: string;
};
export const Step3 = ({
  step3,
  stemCodeTitle,
  step3Title,
  projectId,
  voteType,
  apiUrl,
  ...props
}: Props) => {
  const votePendingStorage = React.useMemo(
    () => createVotePendingStorage(projectId),
    [projectId]
  );

  return (
    <>
      <Heading3>{step3Title}</Heading3>
      <div
        className="rte"
        dangerouslySetInnerHTML={{ __html: RenderContent(step3) }}
      />
      <Spacer size={2} />
      <Button
        appearance="primary-action-button"
        onClick={async (e) => {
          const loginUrl = new URL(props.loginUrl);

          const redirectUri = loginUrl.searchParams.get('redirectUri');

          // Pass along the current pending vote to the API
          let pendingVoteData = null;

          if (voteType === 'countPerTag' || voteType === 'budgetingPerTag') {
            pendingVoteData = votePendingStorage.getVotePendingPerTag();
          } else {
            pendingVoteData = votePendingStorage.getVotePending();
          }

          if (pendingVoteData) {
            let pendingBudgetVoteApiUrl = `${apiUrl}/api/pending-budget-vote`;

            // post pendingVoteData to apiUrl
            const response = await fetch(pendingBudgetVoteApiUrl, {
              method: 'POST',
              headers: {
                'Content-Type': 'application/json',
              },
              body: JSON.stringify({
                ...pendingVoteData,
              }),
            });

            if (response.ok && redirectUri) {
              const responseData = await response.json();
              const { id } = responseData;
              if (id) {
                const newRedirectUri = new URL(redirectUri);
                newRedirectUri.searchParams.set('pendingBudgetVote', id);

                loginUrl.searchParams.set(
                  'redirectUri',
                  encodeURIComponent(newRedirectUri.toString())
                );
              }
            }
          }

          document.location.href = loginUrl.toString();
        }}>
        {stemCodeTitle}
      </Button>
    </>
  );
};
