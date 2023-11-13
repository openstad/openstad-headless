import { Spacer } from '@openstad-headless/ui/src/spacer/index.js';
import { Image } from '@openstad-headless/ui/src/image/index.js';
import { useState } from 'react';
import {
  Button,
  SecondaryButton,
} from '@openstad-headless/ui/src/button/index.js';

export function DesignPicker({
  imageSources,
  onImageSelected,
}: {
  imageSources: Array<string>;
  onImageSelected?: (image: string) => void;
}) {
  const [selected, setSelected] = useState<number>();

  return (
    <>
      <p>
        Kies uit onderstaand overzicht jouw favoriete ontwerp voor het kunstwerk
        voor de Aletta Jacobsbuurt, en vul in de volgende stap je gegevens in.
      </p>
      <Spacer size={2} />
      <div>
        <h5>Kies een ontwerp</h5>
        <Spacer size={1} />
        <div className="voting-module-image-container">
          {imageSources.map((value, index) => (
            <Image
              src={value}
              className={selected === index ? 'selected' : ''}
              onClick={() => {
                setSelected(index);
                onImageSelected && onImageSelected(value);
              }}
              imageFooter={
                <>
                  <Button>Lees meer</Button>
                  <SecondaryButton>Stem</SecondaryButton>
                </>
              }
            />
          ))}
        </div>
      </div>
      <Spacer size={1} />
    </>
  );
}
