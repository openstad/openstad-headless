import { Button } from '@/components/ui/button';
import {
  Dialog,
  DialogContent,
  DialogFooter,
  DialogTrigger,
} from '@/components/ui/dialog';
import { Heading, Paragraph } from '@/components/ui/typography';
import { DialogClose } from '@radix-ui/react-dialog';
import { ReactNode, useState } from 'react';

type Props = {
  buttonText?: string;
  /**
   * The element that opens the dialog. Prefer this over `buttonText`: a real
   * button keeps the dialog reachable with the keyboard, while the plain
   * `buttonText` div only reacts to a click on the text itself.
   */
  trigger?: ReactNode;
  header: string;
  message: string;
  confirmButtonText?: string;
  cancelButtonText?: string;
  confirmButtonVariant?:
    | 'link'
    | 'default'
    | 'destructive'
    | 'outline'
    | 'secondary'
    | 'ghost'
    | null
    | undefined;
  onConfirmAccepted: () => void;
};

export function ConfirmActionDialog({
  buttonText,
  trigger,
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
      {trigger ? (
        <DialogTrigger asChild>{trigger}</DialogTrigger>
      ) : (
        <div
          className="flex items-center"
          onClick={(e) => {
            e.preventDefault();
            setOpen(true);
          }}>
          {buttonText}
        </div>
      )}
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
