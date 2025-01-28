import { Spacer } from '@openstad-headless/ui/src';
import React from 'react';
import { Heading3 } from "@utrecht/component-library-react";

type Props = {
  step3success: string;
};
export const Step3Success = ({ step3success, ...props }: Props) => {
  return (
    <>
      <Spacer size={1.5} />
      <Heading3>{step3success}</Heading3>
      <Spacer size={4} />
    </>
  );
};
