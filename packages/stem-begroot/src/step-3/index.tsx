import { SecondaryButton, Spacer } from '@openstad-headless/ui/src';
import React from 'react';

type Props = {
  loginUrl: string;
  step3: string;
  header: React.JSX.Element;
};
export const Step3 = ({ step3, header, ...props }: Props) => {
  return (
    <>
      {header}
      <Spacer size={1.5} />
      <h5>Controleer stemcode</h5>
      <p>{step3}</p>
      <SecondaryButton
        onClick={(e) => {
          const loginUrl = new URL(props.loginUrl);
          document.location.href = loginUrl.toString();
        }}>
        Vul je stemcode in
      </SecondaryButton>
    </>
  );
};
