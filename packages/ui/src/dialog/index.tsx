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
  className,
  ...props
}: PropsWithChildren<RadixDialog.DialogProps & {
  className?: string;
}>) => {
  useEffect(() => {
    if (!open) {
      focusActiveResource();
    }
  }, [open]);

  return (
    <RadixDialog.Root open={open} onOpenChange={onOpenChange} {...props}>
      <RadixDialog.Portal>
        <div className="openstad">
          <RadixDialog.Overlay className="osc-DialogOverlay" />
          <RadixDialog.Content className={`osc osc-DialogContent ${className}`}>
            <div>
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
        </div>
      </RadixDialog.Portal>
    </RadixDialog.Root>
  );
};
