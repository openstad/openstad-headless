import { Button } from '@/components/ui/button';
import { Dialog, DialogContent, DialogFooter } from '@/components/ui/dialog';
import { Heading, Paragraph } from '@/components/ui/typography';
import { DialogClose } from '@radix-ui/react-dialog';
import { useState } from 'react';

type Props = {
  header: string;
  message: string;
  resetButtonText?: string;
  confirmButtonText?: string;
  cancelButtonText?: string;
  onResetAccepted: () => void;
};

export function ResetResourceDialog({
  header,
  message,
  resetButtonText = 'Reset',
  confirmButtonText = 'Bevestig',
  cancelButtonText = 'Annuleren',
  onResetAccepted,
}: Props) {
  const [open, setOpen] = useState<boolean>(false);

  return (
    <Dialog open={open} modal={true} onOpenChange={setOpen}>
      <div className="flex items-center">
        <Button
          onClick={(e) => {
            e.preventDefault();
            setOpen(true);
          }}
          className="mt-4"
          type="button"
          variant="destructive">
          {resetButtonText}
        </Button>
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
              variant={'destructive'}
              onClick={(e) => {
                e.preventDefault();
                onResetAccepted && onResetAccepted();
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
