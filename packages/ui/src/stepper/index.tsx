import React from 'react';
import '../index.css';
import './index.css';

import "@utrecht/component-library-css";
import "@utrecht/design-tokens/dist/root.css";
import { Paragraph } from "@utrecht/component-library-react";

type Props = {
  steps: Array<string>;
  currentStep?: number;
  isSimpleView?: boolean;
} & React.HTMLAttributes<HTMLDivElement>;
const Stepper = (props: Props) => {
  const { steps, currentStep = 0, isSimpleView } = props;

  return (
    <div {...props} className={`stepper ${props.className}`} aria-hidden="true">
      {steps.map((step, index) => (
        <React.Fragment key={step}>
          {isSimpleView === true && index !== 1 && (
            <>
              <div className="step-container">
                <div
                  className={`step-icon ${currentStep === index ? 'active' : ''} ${
                    currentStep > index ? 'done' : ''
                  }`}>
                  <Paragraph>{index >= 1 ? index : 1}</Paragraph>
                </div>
                <Paragraph> {step}</Paragraph>
              </div>
              <div className="step-divider"></div>
            </>
          )}

          {isSimpleView === false && (
            <>
              <div className="step-container">
                <div
                  className={`step-icon ${currentStep === index ? 'active' : ''} ${
                    currentStep > index ? 'done' : ''
                  }`}>
                  <Paragraph>{index + 1}</Paragraph>
                </div>
                <Paragraph> {step}</Paragraph>
              </div>
              <div className="step-divider"></div>
            </>
          )}
        </React.Fragment>
      ))}
    </div>
  );
};

export { Stepper };