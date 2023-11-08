import { useWidgetConfig } from '@/hooks/use-widget-config';
import { Button } from '@/components/ui/button';
import {
  Form,
  FormControl,
  FormField,
  FormItem,
  FormLabel,
  FormMessage,
} from '@/components/ui/form';
import { Input } from '@/components/ui/input';
import { Separator } from '@/components/ui/separator';
import { Heading } from '@/components/ui/typography';
import { zodResolver } from '@hookform/resolvers/zod';
import { useEffect } from 'react';
import { useForm } from 'react-hook-form';
import * as z from 'zod';

const formSchema = z.object({
  intro: z.string(),
  placeholder: z.string(),
});

export default function ArgumentsForm() {
  const category = 'form';

  const {
    data: widget,
    isLoading: isLoadingWidget,
    updateConfig,
  } = useWidgetConfig();
  const defaults = () => ({
    intro: widget?.config?.[category]?.intro || 'Type hier de intro tekst',
    placeholder:
      widget?.config?.[category]?.placeholder || 'Type hier uw reactie.',
  });

  const form = useForm<z.infer<typeof formSchema>>({
    resolver: zodResolver<any>(formSchema),
    defaultValues: defaults(),
  });

  useEffect(() => {
    form.reset(defaults());
  }, [widget]);

  async function onSubmit(values: z.infer<typeof formSchema>) {
    try {
      await updateConfig({ [category]: values });
    } catch (error) {
      console.error('could not update', error);
    }
  }

  return (
    <div className="p-6 bg-white rounded-md">
      <Form {...form}>
        <Heading size="xl">Formulier</Heading>
        <Separator className="my-4" />
        <form
          onSubmit={form.handleSubmit(onSubmit)}
          className="space-y-4 lg:w-1/2">
          <FormField
            control={form.control}
            name="intro"
            render={({ field }) => (
              <FormItem>
                <FormLabel>Formulier intro</FormLabel>
                <FormControl>
                  <Input {...field} />
                </FormControl>
              </FormItem>
            )}
          />
          <FormField
            control={form.control}
            name="placeholder"
            render={({ field }) => (
              <FormItem>
                <FormLabel>Placeholder tekst</FormLabel>
                <FormControl>
                  <Input
                    placeholder="Dit wordt weergegeven wanneer er nog niets is ingevuld door de gebruiker."
                    {...field}
                  />
                </FormControl>
              </FormItem>
            )}
          />
          <Button type="submit">Opslaan</Button>
        </form>
      </Form>
    </div>
  );
}
