import { Spacer } from '@openstad-headless/ui/src';
import { Heading } from '@utrecht/component-library-react';
import React from 'react';

type Props = {
  headingLevel?: number;
  step3success: string;
};
export const Step3Success = ({
  headingLevel = 3,
  step3success,
  ...props
}: Props) => {
  return (
    <>
      <Spacer size={1.5} />
      <Heading level={headingLevel} appearance="utrecht-heading-3">
        {step3success}
      </Heading>
      <Spacer size={4} />
    </>
  );
};
