import { SecondaryButton, Spacer } from '@openstad-headless/ui/src';
import React from 'react';

type Props = {
  loginUrl: string;
  voteMessage: string;
  thankMessage: string;
  showNewsletterButton: boolean;
  header: React.JSX.Element;
};
export const Step4 = ({
  showNewsletterButton,
  thankMessage,
  voteMessage,
  header,
}: Props) => {
  return (
    <>
      {header}
      <Spacer size={1.5} />
      <h5>{voteMessage}</h5>
      <p>{thankMessage}</p>

      {showNewsletterButton ? (
        <SecondaryButton
          onClick={() => {
            // What should happen here?
          }}>
          Hou mij op de hoogte
        </SecondaryButton>
      ) : null}
    </>
  );
};
