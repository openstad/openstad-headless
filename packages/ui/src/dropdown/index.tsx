import React, {ReactNode, useState} from 'react';
import * as DropdownMenu from '@radix-ui/react-dropdown-menu';
import { PropsWithChildren } from 'react';
import './index.css';

import "@utrecht/component-library-css";
import "@utrecht/design-tokens/dist/root.css";
import { Button, ActionGroup } from "@utrecht/component-library-react";

type Props = {
  items: Array<{ label: string; onClick: () => void }>;
};

export const DropDownMenu = ({
    children,
    items = [],
}: PropsWithChildren & Props) => {
    const [isOpen, setIsOpen] = useState(false);

    return (
        <DropdownMenu.Root open={isOpen} onOpenChange={setIsOpen}>
            <DropdownMenu.Trigger asChild>
                {children ? (
                    children
                ) : (
                    <Button appearance="subtle-button" onClick={() => setIsOpen(!isOpen)}>
                        <div>
                            <i className={isOpen ? "ri-close-fill" : "ri-more-fill"}></i>
                            <span className="sr-only">Bewerken</span>
                        </div>
                    </Button>
                )}
            </DropdownMenu.Trigger>

            <DropdownMenu.Portal>
                <DropdownMenu.Content className="DropdownMenuContent" sideOffset={5}>
                    <ActionGroup direction='column'>
                        {items.map((item) => (
                            <Button
                                appearance='secondary-action-button'
                                key={`dialog-option-${item.label}`}
                                className="DropdownMenuItem"
                                onClick={() => item.onClick()}>
                                {item.label}
                            </Button>
                        ))}
                    </ActionGroup>
                </DropdownMenu.Content>
            </DropdownMenu.Portal>
        </DropdownMenu.Root>
    );
};