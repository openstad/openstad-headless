import './widget.css';
import { Stepper } from '@openstad-headless/ui/src/stepper';
import { Button, SecondaryButton } from '@openstad-headless/ui/src/button';
import { useState } from 'react';
import { DesignPicker } from './parts/designpicker.js';
import { Verify } from './parts/verify.js';
import { Finish } from './parts/finish.js';

function Widget({ config }: { config: {} }) {
  const steps = ['Kies', 'Verificatie', 'Bevestig'];
  const [step, setStep] = useState<number>(0);
  const [chosenDesign, setDesign] = useState<string>();

  const [showDone, show] = useState<boolean>(false);

  return (
    <>
      <section className="voting-module">
        <section className="stepper-section">
          <Stepper steps={steps} currentStep={step} />
        </section>
        <section className="voting-module-content">
          {!showDone ? (
            <>
              {step === 0 ? (
                <DesignPicker
                  onImageSelected={(imgUrl) => setDesign(imgUrl)}
                  imageSources={['test', 'test', 'test']}
                />
              ) : null}
              {step === 1 && chosenDesign ? (
                <Verify designUrl={chosenDesign} />
              ) : null}
              {step === 2 ? <Finish /> : null}
            </>
          ) : null}

          <div className="voting-module-footer">
            {step > 0 && step < steps.length - 1 ? (
              <Button disabled={step === 0} onClick={() => setStep(step - 1)}>
                Vorige
              </Button>
            ) : null}

            {step < steps.length - 1 ? (
              <SecondaryButton
                disabled={!chosenDesign}
                onClick={() => setStep(step + 1)}>
                Volgende
              </SecondaryButton>
            ) : null}

            {step === steps.length - 1 ? (
              <SecondaryButton onClick={() => setStep(step + 1)}>
                Klaar
              </SecondaryButton>
            ) : null}
          </div>
        </section>
      </section>
    </>
  );
}

export { Widget as default, Widget };
