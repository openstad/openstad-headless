import { Spacer } from '@openstad-headless/ui/src';
import React from 'react';

import "@utrecht/component-library-css";
import "@utrecht/design-tokens/dist/root.css";
import { Heading5, Paragraph, Button } from "@utrecht/component-library-react";

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
      <Heading5>Controleer stemcode</Heading5>
      <Paragraph>{step3}</Paragraph>
      <Spacer size={2} />
      <Button
        appearance='primary-action-button'
        onClick={(e) => {
          const loginUrl = new URL(props.loginUrl);
          document.location.href = loginUrl.toString();
        }}>
        Vul je stemcode in
      </Button>
    </>
  );
};
