import { useEffect, useState } from 'react';
import {
  Dialog,
  DialogContent,
  DialogDescription,
  DialogTitle,
  DialogTrigger,
} from "@/components/ui/dialog"
import { Pen } from 'lucide-react';

import { Button } from '@/components/ui/button';
import { Label } from '@radix-ui/react-label';
import { Input } from './ui/input';
import { useWidgetsHook } from '@/hooks/use-widgets';


type Props = {
  header: string;
  widget: any;
};

export function RenameResourceDialog({
  header,
  widget,
}: Props) {
  const [open, setOpen] = useState<boolean>(false);
  const [name, setName] = useState<string>('');
  const [error, setError] = useState<boolean>(false);
  const { updateWidget } = useWidgetsHook(widget.projectId);

  const onSubmit = async () => {
    if(name.length >= 5){
      updateWidget(widget.id, { description: name });
      setOpen(false);
      setError(false);
    }else{
      setError(true)
    }
  };

  useEffect(() => {
    if (!open) {
      setError(false);
      setName('');
    }
  }, [open]);

  return (
    <Dialog open={open} modal={true} onOpenChange={setOpen}>
      <div className="flex items-center" onClick={(e) => {
        e.preventDefault();
        setOpen(true);
      }}>
        <Pen className="mr-2 h-4 w-4" /> Bewerken
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
          <br />
          <DialogTitle>
            {header}
          </DialogTitle>
          <DialogDescription>
            <span className="mb-4">
              Geef de widget hier een nieuwe naam.
            </span>
            <span className="grid w-full items-center gap-2 mt-4" style={{ background: '#f4f4f4', margin: '20px -24px -24px -24px', padding: '34px 24px', width: 'calc(100% + 48px)' }}>
              <Label htmlFor="name">Naam</Label>
              <Input type="text" id="name" placeholder={widget.description} onChange={(e) => setName(e.target.value)} />
              {error && <span className="text-red-500">Naam moet minimaal 5 karakters bevatten</span>}
              <span className="flex flex-col-reverse sm:flex-row sm:justify-end sm:space-x-2 mt-4">
                <DialogTrigger>Annuleren</DialogTrigger>
                <Button onClick={() => onSubmit()}>Opslaan</Button>
              </span>
            </span>
          </DialogDescription>
        </div>
      </DialogContent>
    </Dialog>
  );
}
