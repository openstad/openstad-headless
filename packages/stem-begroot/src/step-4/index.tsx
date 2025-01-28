import { SecondaryButton, Spacer } from '@openstad-headless/ui/src';
import React from 'react';
import { Heading3, Paragraph, Button } from "@utrecht/component-library-react";

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
      <Paragraph>{thankMessage}</Paragraph>
    </>
  );
};
