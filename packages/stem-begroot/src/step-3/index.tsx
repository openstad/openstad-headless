import { Spacer } from '@openstad-headless/ui/src';
import React from 'react';

import "@utrecht/component-library-css";
import "@utrecht/design-tokens/dist/root.css";
import { Heading3, Paragraph, Button } from "@utrecht/component-library-react";
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
export const Step3 = ({ step3, stemCodeTitle, step3Title, projectId, voteType, apiUrl, ...props }: Props) => {
  const votePendingStorage = React.useMemo(
    () => createVotePendingStorage(projectId),
    [projectId]
  );

  return (
    <>
      <Heading3>{step3Title}</Heading3>
      <Paragraph>{step3}</Paragraph>
      <Spacer size={2} />
      <Button
        appearance='primary-action-button'
        onClick={async (e) => {
          const loginUrl = new URL(props.loginUrl);
          console.log('[pending-vote-debug][widget][step3] login click', {
            projectId,
            voteType,
            apiUrl,
            loginUrl: loginUrl.toString(),
          });

          const redirectUri = loginUrl.searchParams.get('redirectUri');

          // Pass along the current pending vote to the API
          let pendingVoteData = null;

          if (voteType === 'countPerTag' || voteType === 'budgetingPerTag') {
            pendingVoteData = votePendingStorage.getVotePendingPerTag();
          } else {
            pendingVoteData = votePendingStorage.getVotePending();
          }
          console.log('[pending-vote-debug][widget][step3] pending vote loaded', {
            hasPendingVoteData: !!pendingVoteData,
            pendingKeys: pendingVoteData && typeof pendingVoteData === 'object' ? Object.keys(pendingVoteData).length : 0,
          });

          if (pendingVoteData) {
            let pendingBudgetVoteApiUrl =`${apiUrl}/api/pending-budget-vote`;
            console.log('[pending-vote-debug][widget][step3] posting pending vote', {
              pendingBudgetVoteApiUrl,
              hasRedirectUri: !!redirectUri,
            });

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
            console.log('[pending-vote-debug][widget][step3] pending vote post response', {
              status: response.status,
              ok: response.ok,
            });

            if (response.ok && redirectUri) {
              const responseData = await response.json();
              const { id } = responseData;
              console.log('[pending-vote-debug][widget][step3] pending vote post payload', {
                id,
              });
              if (id) {

                const newRedirectUri = new URL(redirectUri);
                newRedirectUri.searchParams.set('pendingBudgetVote', id);

                loginUrl.searchParams.set('redirectUri', encodeURIComponent(newRedirectUri.toString()));
                console.log('[pending-vote-debug][widget][step3] redirectUri updated with pending uuid', {
                  pendingBudgetVote: id,
                  newRedirectUri: newRedirectUri.toString(),
                });
              }
            } else {
              console.log('[pending-vote-debug][widget][step3] pending vote post did not set redirect uuid', {
                responseOk: response.ok,
                hasRedirectUri: !!redirectUri,
              });
            }
          }

          console.log('[pending-vote-debug][widget][step3] navigating to login', {
            loginUrl: loginUrl.toString(),
          });
          document.location.href = loginUrl.toString();
        }}>
        {stemCodeTitle}
      </Button>
    </>
  );
};
