import { Button } from '@/components/ui/button';
import { Checkbox } from '@/components/ui/checkbox';
import { Dialog, DialogContent, DialogFooter } from '@/components/ui/dialog';
import { Heading, Paragraph } from '@/components/ui/typography';
import { DialogClose } from '@radix-ui/react-dialog';
import { useState } from 'react';

export interface ExportSettings {
  splitMultipleChoice: boolean;
}

type Props = {
  disabled?: boolean;
  onExport: (settings: ExportSettings) => void;
};

export function ExportSettingsDialog({ disabled, onExport }: Props) {
  const [open, setOpen] = useState<boolean>(false);
  const [splitMultipleChoice, setSplitMultipleChoice] =
    useState<boolean>(false);

  const handleExport = () => {
    onExport({ splitMultipleChoice });
    setOpen(false);
  };

  return (
    <Dialog open={open} modal={true} onOpenChange={setOpen}>
      <Button
        className="text-xs p-2"
        type="button"
        disabled={disabled}
        onClick={(e) => {
          e.preventDefault();
          setOpen(true);
        }}>
        Exporteer inzendingen
      </Button>
      <DialogContent
        onEscapeKeyDown={(e: KeyboardEvent) => {
          e.stopPropagation();
        }}
        onInteractOutside={(e: Event) => {
          e.stopPropagation();
          setOpen(false);
        }}>
        <div>
          <Heading size="lg">Export instellingen</Heading>
          <Paragraph className="mb-6">
            Pas de export instellingen aan voordat je de inzendingen downloadt.
          </Paragraph>

          <div className="flex items-center space-x-3 mb-8">
            <Checkbox
              id="splitMultipleChoice"
              checked={splitMultipleChoice}
              onCheckedChange={(checked) =>
                setSplitMultipleChoice(checked === true)
              }
            />
            <label
              htmlFor="splitMultipleChoice"
              className="text-sm font-medium leading-none cursor-pointer">
              Meerkeuzevragen in aparte kolommen (Ja/Nee per optie)
            </label>
          </div>

          <DialogFooter>
            <DialogClose asChild>
              <Button
                onClick={(e) => {
                  e.preventDefault();
                  setOpen(false);
                }}
                type="button"
                variant="ghost">
                Annuleren
              </Button>
            </DialogClose>

            <Button type="button" onClick={handleExport}>
              Exporteren
            </Button>
          </DialogFooter>
        </div>
      </DialogContent>
    </Dialog>
  );
}
