import { useState } from 'react';
import { DialogClose } from '@radix-ui/react-dialog';
import { MoreHorizontal, Trash } from 'lucide-react';

import { Button } from '@/components/ui/button';
import { Heading, Paragraph } from '@/components/ui/typography';
import {
  DropdownMenu,
  DropdownMenuContent,
  DropdownMenuItem,
  DropdownMenuTrigger,
} from '@/components/ui/dropdown-menu';

import {
  Dialog,
  DialogContent,
  DialogFooter,
} from '@/components/ui/dialog';

type Props = {
  buttonText: string;
  header: string;
  message: string;
  confirmButtonText?: string;
  cancelButtonText?: string;
  confirmButtonVariant?: "link" | "default" | "destructive" | "outline" | "secondary" | "ghost" | null | undefined;
  onConfirmAccepted: () => void;
};

export function ConfirmActionDialog({
  buttonText,
  header,
  message,
  confirmButtonText = 'Verwijderen',
  cancelButtonText = 'Annuleren',
  confirmButtonVariant = 'default',
  onConfirmAccepted,
}: Props) {
  const [open, setOpen] = useState<boolean>(false);

  return (
    <Dialog open={open} modal={true} onOpenChange={setOpen}>
      <div className="flex items-center" onClick={(e) => {
        e.preventDefault();
        setOpen(true);
      }}>
        {buttonText}
      </div>
      <DialogContent
        onEscapeKeyDown={(e: KeyboardEvent) => {
          e.stopPropagation();
        }}
        onInteractOutside={(e: Event) => {
          e.stopPropagation();
          setOpen(false);
        }}>
        <div>
          <Heading size={'lg'}>{header}</Heading>
          <Paragraph className="mb-8">{message}</Paragraph>
          <DialogFooter>
            <DialogClose asChild>
              <Button
                onClick={(e) => {
                  e.preventDefault();
                  setOpen(false);
                }}
                type="button"
                variant="ghost">
                {cancelButtonText}
              </Button>
            </DialogClose>

            <Button
              type="button"
              variant={confirmButtonVariant}
              onClick={(e) => {
                e.preventDefault();
                onConfirmAccepted && onConfirmAccepted();
                setOpen(false);
              }}>
              {confirmButtonText}
            </Button>
          </DialogFooter>
        </div>
      </DialogContent>
    </Dialog>
  );
}
