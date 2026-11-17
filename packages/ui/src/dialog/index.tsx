import * as RadixDialog from '@radix-ui/react-dialog';
import React, { PropsWithChildren, useEffect } from 'react';

import { IconButton } from '../iconbutton';
import '../index.css';
import './index.css';

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
  'aria-label': ariaLabel,
  'aria-labelledby': ariaLabelledBy,
  ...props
}: PropsWithChildren<
  RadixDialog.DialogProps & {
    className?: string;
    'aria-label'?: string;
    'aria-labelledby'?: string;
  }
>) => {
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
          <RadixDialog.Content
            className={`osc osc-DialogContent ${className}`}
            {...(ariaLabelledBy
              ? { 'aria-labelledby': ariaLabelledBy }
              : ariaLabel
                ? { 'aria-label': ariaLabel }
                : {})}>
            <div>
              <RadixDialog.Close asChild>
                <IconButton
                  className="subtle-button"
                  icon="ri-close-line"
                  aria-label="Sluiten"
                  test-id="dialog-close-button"
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

export const DialogTitle = ({
  children,
  className = '',
}: PropsWithChildren<{ className?: string }>) => (
  <RadixDialog.Title className={`osc-DialogTitle ${className}`.trim()}>
    {children}
  </RadixDialog.Title>
);

export const DialogDescription = ({
  children,
  className = '',
}: PropsWithChildren<{ className?: string }>) => (
  <RadixDialog.Description
    asChild
    className={`osc-DialogDescription ${className}`.trim()}>
    <div>{children}</div>
  </RadixDialog.Description>
);
