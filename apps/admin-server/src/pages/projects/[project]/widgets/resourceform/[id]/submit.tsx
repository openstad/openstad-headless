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
import { Textarea } from '@/components/ui/textarea';
import { Heading } from '@/components/ui/typography';
import { useWidgetConfig } from '@/hooks/use-widget-config';
import { zodResolver } from '@hookform/resolvers/zod';
import { useCallback, useEffect } from 'react';
import { useForm } from 'react-hook-form';
import * as z from 'zod';
import InfoDialog from '@/components/ui/info-hover';

const formSchema = z.object({
  submitButton: z.string(),
  saveButton: z.string(),
  saveConceptButton: z.string(),
});

export default function WidgetResourceFormSubmit() {
  type FormData = z.infer<typeof formSchema>;
  const category = 'submit';

  // TODO should use the passed props widget, this is the old way and is not advised
  const {
    data: widget,
    isLoading: isLoadingWidget,
    updateConfig,
  } = useWidgetConfig<any>();

  const defaults = useCallback(
    () => ({
      submitButton: widget?.config?.[category]?.submitButton || '',
      saveButton: widget?.config?.[category]?.saveButton || '',
      saveConceptButton: widget?.config?.[category]?.saveConceptButton || '',
    }),
    [widget?.config]
  );

  async function onSubmit(values: FormData) {
    try {
      await updateConfig({ [category]: values });
    } catch (error) {
      console.error('could not update', error);
    }
  }

  const form = useForm<FormData>({
    resolver: zodResolver<any>(formSchema),
    defaultValues: defaults(),
  });

  useEffect(() => {
    form.reset(defaults());
  }, [form, defaults]);

  return (
    <div className="p-6 bg-white rounded-md">
      <Form {...form}>
        <Heading size="xl">Opleveren</Heading>
        <Separator className="my-4" />
        <form
          onSubmit={form.handleSubmit(onSubmit)}
          className="lg:w-2/3 grid grid-cols-1 gap-4 ">
          <FormField
            control={form.control}
            name="submitButton"
            render={({ field }) => (
              <FormItem>
                <FormLabel>
                  Tekst voor de oplever-knop
                  <InfoDialog content={'TODO'} />

                </FormLabel>
                <FormControl>
                  <Input {...field} />
                </FormControl>
                <FormMessage />
              </FormItem>
            )}
          />
          <FormField
            control={form.control}
            name="saveButton"
            render={({ field }) => (
              <FormItem>
                <FormLabel>
                  Tekst voor de opslaan-knop
                  <InfoDialog content={'TODO'} />
                </FormLabel>
                <FormControl>
                  <Input {...field} />
                </FormControl>
                <FormMessage />
              </FormItem>
            )}
          />
          <FormField
            control={form.control}
            name="saveConceptButton"
            render={({ field }) => (
              <FormItem>
                <FormLabel>
                  {`Tekst voor de 'opslaan als concept'-knop`}
                  <InfoDialog content={'TODO'} />
                </FormLabel>
                <FormControl>
                  <Input {...field} />
                </FormControl>
                <FormMessage />
              </FormItem>
            )}
          />
          <Button className="w-fit col-span-full" type="submit">
            Opslaan
          </Button>
        </form>
      </Form>
    </div>
  );
}
