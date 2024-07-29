import { Plus } from 'lucide-react';
import { Button } from './ui/button';
import {
  Dialog,
  DialogContent,
  DialogDescription,
  DialogFooter,
  DialogHeader,
  DialogTitle,
  DialogTrigger,
} from './ui/dialog';

import { useForm } from 'react-hook-form';
import { zodResolver } from '@hookform/resolvers/zod';
import { z } from 'zod';
import {
  Form,
  FormControl,
  FormField,
  FormItem,
  FormLabel,
  FormMessage,
} from './ui/form';
import {
  Select,
  SelectContent,
  SelectItem,
  SelectTrigger,
  SelectValue,
} from './ui/select';
import { Input } from './ui/input';
import { useState } from 'react';
import { useWidgetsHook } from '@/hooks/use-widgets';
import { WidgetDefinitions } from '@/lib/widget-definitions';
import { useRouter } from 'next/router';
import toast from 'react-hot-toast';
import InfoDialog from '@/components/ui/info-hover';

type Props = {
  projectId?: string;
};

const minDescription = 4;
const maxDescription = 255;

const formSchema = z.object({
  description: z
    .string()
    .min(
      minDescription,
      `De beschrijving van de widget moet uit minimaal ${minDescription} karakters bestaan`
    )
    .max(
      maxDescription,
      `Maximaal ${maxDescription} karakters voor widget beschrijvingen zijn toegestaan`
    ),
  type: z.string(),
});

type FormData = z.infer<typeof formSchema>;
export function CreateWidgetDialog({ projectId }: Props) {
  const [open, setOpen] = useState<boolean>(false);
  const router = useRouter();
  const widgetTypes = Object.entries(WidgetDefinitions);
  const { createWidget } = useWidgetsHook(projectId);

  async function onSubmit(values: FormData) {
    if (!projectId) return;
    try {
      const widget = await createWidget(values.type, values.description);
      setOpen(false);
      if (widget) {
        toast.success('Widget aangemaakt!');
        router.push(router.asPath + `/${widget.type}/${widget.id}`);
      }
    } catch (error) {
      toast.error('Widget kon niet worden aangemaakt!');
    }
  }

  const form = useForm<FormData>({
    resolver: zodResolver<any>(formSchema),
    defaultValues: {
      description: '',
      type: widgetTypes[0][0],
    },
  });

  return (
    <Dialog open={open} onOpenChange={setOpen}>
      <DialogTrigger asChild>
        <Button className="flex w-fit">
          <Plus size="20" className="hidden lg:flex" />
          Widget toevoegen
        </Button>
      </DialogTrigger>
      <DialogContent>
        <Form {...form}>
          <form onSubmit={form.handleSubmit(onSubmit)} className="space-y-4">
            <DialogHeader>
              <div className="space-y-6">
                <div>
                  <DialogTitle>Aanmaken van een nieuwe widget</DialogTitle>
                  <DialogDescription>
                    Voer de naam in van de widget en selecteer het type
                  </DialogDescription>
                </div>
                <FormField
                  control={form.control}
                  name="type"
                  render={({ field }) => (
                    <FormItem>
                      <FormLabel>Widget type</FormLabel>
                      <Select onValueChange={field.onChange} value={field.value}>
                        <FormControl>
                          <SelectTrigger>
                            <SelectValue placeholder="Selecteer een type widget" />
                          </SelectTrigger>
                        </FormControl>
                        <SelectContent className='overflow-y-auto max-h-[16rem]'>
                          {widgetTypes.map((type) => (
                            <SelectItem key={type[0]} value={type[0]}>
                              {type[1].name}
                            </SelectItem>
                          ))}
                        </SelectContent>
                      </Select>
                    </FormItem>
                  )}
                />

                <FormField
                  control={form.control}
                  name="description"
                  render={({ field }) => (
                    <FormItem>
                      <FormLabel>Beschrijving/naam van de widget<InfoDialog content={'Deze beschrijving moet uniek zijn per widget.'}/></FormLabel>
                      <FormControl>
                        <Input
                          {...field}
                          placeholder="De identificeerbare naam van de widget"
                        />
                      </FormControl>
                      <FormMessage />
                    </FormItem>
                  )}
                />
              </div>
            </DialogHeader>
            <DialogFooter>
              <Button disabled={!form.formState.isValid} type="submit">
                Opslaan
              </Button>
            </DialogFooter>
          </form>
        </Form>
      </DialogContent>
    </Dialog>
  );
}
