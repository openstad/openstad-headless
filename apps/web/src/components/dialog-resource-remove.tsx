import { Trash } from 'lucide-react';
import { Button } from './ui/button';
import { Heading } from '@/components/ui/typography';

import {
  Dialog,
  DialogContent,
  DialogFooter,
  DialogTrigger,
} from './ui/dialog';

import { useState } from 'react';
import { Paragraph } from './ui/typography';
import { DialogClose } from '@radix-ui/react-dialog';

type Props = {
  header: string;
  message: string;
  deleteButtonText?: string;
  cancelButtonText?: string;
  onDeleteAccepted: () => void;
};

export function RemoveResourceDialog({
  header,
  message,
  deleteButtonText = 'Verwijderen',
  cancelButtonText = 'Annuleren',
  onDeleteAccepted,
}: Props) {
  const [open, setOpen] = useState<boolean>(false);

  return (
    <Dialog open={open} modal={true} onOpenChange={setOpen}>
      <DialogTrigger asChild>
        <Button
          type="button"
          className='px-3 py-2'
          onClick={(e) => {
            e.preventDefault();
            setOpen(true);
          }}
          variant="destructive">
          <Trash size="14" />
        </Button>
      </DialogTrigger>
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
                onDeleteAccepted && onDeleteAccepted();
                setOpen(false);
              }}>
              {deleteButtonText}
            </Button>
          </DialogFooter>
        </div>
      </DialogContent>
    </Dialog>
  );
}
