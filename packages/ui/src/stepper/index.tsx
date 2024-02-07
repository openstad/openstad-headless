import React from 'react';
import '../index.css';
import './index.css';

type Props = {
  steps: Array<string>;
  currentStep?: number;
} & React.HTMLAttributes<HTMLDivElement>;
const Stepper = (props: Props) => {
  const { steps, currentStep = 0 } = props;

  return (
    <div {...props} className={`stepper ${props.className}`}>
      {steps.map((step, index) => (
        <React.Fragment key={step}>
          <div className="step-container">
            <div
              className={`step-icon ${currentStep === index ? 'active' : ''} ${
                currentStep > index ? 'done' : ''
              }`}>
              <p>{index + 1}</p>
            </div>
            <p> {step}</p>
          </div>
          <div className="step-divider"></div>
        </React.Fragment>
      ))}
    </div>
  );
};

export { Stepper };