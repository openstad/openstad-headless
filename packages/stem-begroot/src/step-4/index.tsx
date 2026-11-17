import { Spacer } from '@openstad-headless/ui/src';
import RenderContent from '@openstad-headless/ui/src/rte-formatting/rte-formatting';
import { Heading } from '@utrecht/component-library-react';
import React from 'react';

type Props = {
  headingLevel?: number;
  loginUrl: string;
  voteMessage: string;
  thankMessage: string;
};
export const Step4 = ({
  headingLevel = 3,
  thankMessage,
  voteMessage,
}: Props) => {
  return (
    <>
      <Spacer size={1.5} />
      <Heading level={headingLevel} appearance="utrecht-heading-3">
        {voteMessage}
      </Heading>
      <div
        className="rte"
        dangerouslySetInnerHTML={{ __html: RenderContent(thankMessage) }}
      />
    </>
  );
};
