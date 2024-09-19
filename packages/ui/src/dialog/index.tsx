import * as RadixDialog from '@radix-ui/react-dialog';
import '../index.css';
import './index.css';
import React, { PropsWithChildren, useEffect } from 'react';
import { IconButton } from '../iconbutton';

const focusActiveResource = () => {
  const activeResource = document.getElementsByClassName('active-resource')[0];
  if (activeResource) {
    setTimeout(() => {
      (activeResource as HTMLElement).focus();
      activeResource.classList.remove('active-resource');
    }, 100);
  }
};

export const Dialog = ({
  children,
  open,
  onOpenChange,
  ...props
}: PropsWithChildren<RadixDialog.DialogProps>) => {
  useEffect(() => {
    if (!open) {
      focusActiveResource();
    }
  }, [open]);

  return (
    <RadixDialog.Root open={open} onOpenChange={onOpenChange} {...props}>
      <RadixDialog.Portal>
        <RadixDialog.Overlay className="osc-DialogOverlay" />
        <RadixDialog.Content style={{ zIndex: 1000 }} className="osc osc-DialogContent">
          <div style={{ display: 'flex', justifyContent: 'flex-end', padding: '0 10px' }}>
            <RadixDialog.Close asChild>
              <IconButton
                className="subtle-button"
                icon="ri-close-line"
                aria-label="Sluiten"
              />
            </RadixDialog.Close>
          </div>
          {children}
        </RadixDialog.Content>
      </RadixDialog.Portal>
    </RadixDialog.Root>
  );
};