import { SecondaryButton, Spacer } from '@openstad-headless/ui/src';
import React, { ReactNode } from 'react';

type Props = {
  loginUrl: string;
  step3success: string;
  header: React.JSX.Element;
};
export const Step3Success = ({ step3success, header, ...props }: Props) => {
  return (
    <>
      {header}
      <Spacer size={1.5} />
      <h5>{step3success}</h5>
      <Spacer size={1.5} />

      <SecondaryButton
        onClick={() => {
          const loginUrl = new URL(`${props.loginUrl}`);
          document.location.href = loginUrl.toString();
        }}>
        Vul een andere stemcode in
      </SecondaryButton>
    </>
  );
};
