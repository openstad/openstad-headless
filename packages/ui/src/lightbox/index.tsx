import * as RadixDialog from '@radix-ui/react-dialog';
import React from 'react';

import './index.css';

type LightboxProps = {
  src: string;
  alt?: string;
  onClose: () => void;
};

export const Lightbox = ({ src, alt = '', onClose }: LightboxProps) => {
  return (
    <RadixDialog.Root open onOpenChange={(open) => !open && onClose()}>
      <RadixDialog.Portal>
        <div className="openstad">
          <RadixDialog.Overlay className="osc-lightbox-overlay" />
          <RadixDialog.Content className="osc-lightbox-content">
            <RadixDialog.Title className="osc-lightbox-title">
              Afbeelding uitvergroot
            </RadixDialog.Title>
            <RadixDialog.Close
              className="osc-lightbox-close"
              aria-label="Sluiten">
              ✕
            </RadixDialog.Close>
            <img className="osc-lightbox-image" src={src} alt={alt} />
          </RadixDialog.Content>
        </div>
      </RadixDialog.Portal>
    </RadixDialog.Root>
  );
};
