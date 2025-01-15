import { Spacer } from '@openstad-headless/ui/src';
import React from 'react';
import { Heading5 } from "@utrecht/component-library-react";

type Props = {
  step3success: string;
};
export const Step3Success = ({ step3success, ...props }: Props) => {
  return (
    <>
      <Spacer size={1.5} />
      <Heading5>{step3success}</Heading5>
      <Spacer size={4} />
    </>
  );
};
