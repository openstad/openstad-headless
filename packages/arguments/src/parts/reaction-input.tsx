import { Input, Spacer } from '@openstad-headless/ui/src';
import { SecondaryButton } from '@openstad-headless/ui/src/button';
import { useState } from 'react';

export default function ({
  text = '',
}: {
  text?: string;
  resourceId: string;
  parentCommentId?: string;
}) {
  const [showButton, setShowButton] = useState<boolean>(false);
  const [value, setValue] = useState<string>(text);
  return (
    <div className="reaction-input-container">
      <Input
        onFocus={() => setShowButton(true)}
        onBlur={() => !value && setShowButton(false)}
        placeholder="Type hier uw reactie"
        onChange={(e) => setValue(e.target.value)}
        defaultValue={value}
      />
      <Spacer size={0.5} />
      {showButton ? (
        <SecondaryButton
          disabled={!value}
          onClick={() => {
            // Do stuffs here
            setShowButton(false);
          }}>
          Submit
        </SecondaryButton>
      ) : null}
    </div>
  );
}
