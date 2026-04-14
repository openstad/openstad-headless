import '@utrecht/component-library-css';
import { Paragraph } from '@utrecht/component-library-react';
import '@utrecht/design-tokens/dist/root.css';
import React from 'react';

import '../index.css';
import './index.css';

type Props = {
  steps: Array<string>;
  currentStep?: number;
  isSimpleView?: boolean;
} & React.HTMLAttributes<HTMLDivElement>;
const Stepper = (props: Props) => {
  const { steps, currentStep = 0, isSimpleView = false, ...rest } = props;

  const renderStep = (step: string, index: number, displayNumber: number) => (
    <li
      key={index}
      className="step-container"
      aria-current={currentStep === index ? 'step' : undefined}>
      <div
        className={`step-icon ${currentStep === index ? 'active' : ''} ${
          currentStep > index ? 'done' : ''
        }`}>
        <Paragraph>{displayNumber}</Paragraph>
      </div>
      <Paragraph> {step}</Paragraph>
    </li>
  );

  return (
    <nav
      {...rest}
      className={`stepper ${props.className ?? ''}`}
      aria-label="Stappen">
      <ol className="stepper-list">
        {steps.map((step, index) => {
          if (isSimpleView === true && index === 1) return null;
          const displayNumber = isSimpleView && index >= 1 ? index : index + 1;
          const isLast =
            index === steps.length - 1 ||
            (isSimpleView && index === steps.length - 1);
          return (
            <React.Fragment key={index}>
              {renderStep(step, index, displayNumber)}
              {!isLast && (
                <li
                  className="step-divider"
                  role="presentation"
                  aria-hidden="true"
                />
              )}
            </React.Fragment>
          );
        })}
      </ol>
    </nav>
  );
};

export { Stepper };
