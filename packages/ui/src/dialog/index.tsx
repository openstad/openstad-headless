import * as RadixDialog from '@radix-ui/react-dialog';
import '../index.css';
import './index.css';
import React, { PropsWithChildren } from 'react';
import { GhostButton } from '../button';
import { Icon } from '../icon';

export const Dialog = ({ children, ...props }: PropsWithChildren<RadixDialog.DialogProps>) => (
  <RadixDialog.Root {...props}>
    {/* <RadixDialog.Trigger asChild>
      <button className="Button violet">Edit profile</button>
    </RadixDialog.Trigger> */}
    <RadixDialog.Portal>
      <RadixDialog.Overlay className="osc-DialogOverlay" />
      <RadixDialog.Content className="osc osc-DialogContent">
      <RadixDialog.Close asChild>
          <GhostButton className="osc-IconButton" aria-label="Close">
          <Icon icon="ri-thumb-down-line" variant="small" />
          </GhostButton>
        </RadixDialog.Close>
        {children}
    
      </RadixDialog.Content>
    </RadixDialog.Portal>
  </RadixDialog.Root>
);

// export const RadixDialog = ({children, ...props}: PropsWithChildren<RadixDialog.DialogProps & RadixDialog.PortalProps>) => {
//     return <RadixDialog.Root {...props}>
//       <RadixDialog.Trigger>Open</RadixDialog.Trigger>
//         <RadixDialog.Portal {...props} >
//             <RadixDialog.Overlay />
//             <RadixDialog.Content>
//             <RadixDialog.Title title='sdffdsf'/>
//             <RadixDialog.Description />
//             {children}
//             <RadixDialog.Close />
//             </RadixDialog.Content>
//         </RadixDialog.Portal>
//   </RadixDialog.Root>
// }
