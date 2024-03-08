import { SecondaryButton, Spacer } from '@openstad-headless/ui/src';
import React, { ReactNode } from 'react';
import { Heading5, Button } from "@utrecht/component-library-react";

type Props = {
  loginUrl: string;
  step3success: string;
};
export const Step3Success = ({ step3success, ...props }: Props) => {
  return (
    <>
      <Spacer size={1.5} />
      <Heading5>{step3success}</Heading5>
      <Spacer size={2} />

      <Button
        appearance='primary-action-button'
        onClick={() => {
          const loginUrl = new URL(`${props.loginUrl}`);
          document.location.href = loginUrl.toString();
        }}>
        Vul een andere stemcode in
      </Button>
    </>
  );
};
