import React from 'react';
import * as DropdownMenu from '@radix-ui/react-dropdown-menu';
import { PropsWithChildren } from 'react';
import './index.css';

type Props = {
  items: Array<{ label: string; onClick: () => void }>;
};

export const DropDownMenu = ({
  children,
  items = [],
}: PropsWithChildren & Props) => (
  <DropdownMenu.Root>
    <DropdownMenu.Trigger asChild>{children}</DropdownMenu.Trigger>

    <DropdownMenu.Portal>
      <DropdownMenu.Content className="Osc-DropdownMenuContent" sideOffset={5}>
        {items.map((item) => (
          <DropdownMenu.Item
            key={`dialog-option-${item.label}`}
            className="Osc-DropdownMenuItem"
            onClick={() => item.onClick()}>
            {item.label}
          </DropdownMenu.Item>
        ))}
      </DropdownMenu.Content>
    </DropdownMenu.Portal>
  </DropdownMenu.Root>
);
