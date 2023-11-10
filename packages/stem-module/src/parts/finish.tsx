import { Spacer } from '@openstad-headless/ui/src/spacer/index.js';

export function Finish({}: {}) {
  return (
    <>
      <h5>Gelukt, je stem is opgeslagen!</h5>
      <Spacer size={2} />
      <p>
        Bedankt voor het stemmen! Hou deze site in de gaten voor de uitslag.
      </p>
    </>
  );
}
