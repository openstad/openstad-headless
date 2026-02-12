import { Spacer } from '@openstad-headless/ui/src';
import RenderContent from '@openstad-headless/ui/src/rte-formatting/rte-formatting';
import { Heading3 } from '@utrecht/component-library-react';
import React from 'react';

type Props = {
  loginUrl: string;
  voteMessage: string;
  thankMessage: string;
};
export const Step4 = ({ thankMessage, voteMessage }: Props) => {
  return (
    <>
      <Spacer size={1.5} />
      <Heading3>{voteMessage}</Heading3>
      <div
        className="rte"
        dangerouslySetInnerHTML={{ __html: RenderContent(thankMessage) }}
      />
    </>
  );
};
