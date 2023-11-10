import { SecondaryButton } from '@openstad-headless/ui/src/button/index.js';
import { Image } from '@openstad-headless/ui/src/image/index.js';
import { Spacer } from '@openstad-headless/ui/src/spacer/index.js';
import { useState } from 'react';

export function Verify({
  designUrl,
  onVoteCodeAdded,
}: {
  designUrl: string;
  onVoteCodeAdded?: (code: string) => void;
}) {
  return (
    <>
      <p>
        Via onderstaande knop vul je je emailadres in. Ter controle krijg je een
        link toegestuurd om je e-mailadres te bevestigen. Als dat lukt kom je
        terug op deze pagina om je stem definitief in te sturen.
      </p>
      <Spacer size={2} />
      <SecondaryButton>Vul je stemcode in</SecondaryButton>
      <Spacer size={3} />
      <h5>Uw stem</h5>
      <Spacer size={1} />

      <div className="verify-selected-image">
        <Image src={designUrl} />
      </div>
    </>
  );
}
