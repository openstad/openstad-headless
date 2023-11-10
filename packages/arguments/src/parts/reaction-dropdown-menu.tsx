import * as DropdownMenu from '@radix-ui/react-dropdown-menu';
import { PropsWithChildren } from 'react';
import '../dropdown.css';

export default ({ children }: PropsWithChildren) => (
  <DropdownMenu.Root>
    <DropdownMenu.Trigger asChild>{children}</DropdownMenu.Trigger>

    <DropdownMenu.Portal>
      <DropdownMenu.Content className="DropdownMenuContent" sideOffset={5}>
        <DropdownMenu.Item className="DropdownMenuItem">
          Bewerken
        </DropdownMenu.Item>
        <DropdownMenu.Item className="DropdownMenuItem">
          Verwijderen
        </DropdownMenu.Item>
      </DropdownMenu.Content>
    </DropdownMenu.Portal>
  </DropdownMenu.Root>
);
