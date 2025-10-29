import { Spacer } from '@openstad-headless/ui/src';
import React from 'react';
import { Heading3 } from "@utrecht/component-library-react";

type Props = {
  loginUrl: string;
  voteMessage: string;
  thankMessage: string;
};
export const Step4 = ({
  thankMessage,
  voteMessage,
}: Props) => {
  return (
    <>
      <Spacer size={1.5} />
      <Heading3>{voteMessage}</Heading3>
      <div dangerouslySetInnerHTML={{__html: thankMessage}} />
    </>
  );
};
