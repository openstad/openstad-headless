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
import { useWidgetConfig } from '@/hooks/use-widget-config';
import { zodResolver } from '@hookform/resolvers/zod';
import { useEffect } from 'react';
import { useForm } from 'react-hook-form';
import * as z from 'zod';

const formSchema = z.object({
  textHoverImage: z.string(),
  textVoteButton: z.string(),
  fieldUsedForTitle: z.string(),
});

export default function WidgetResourceDetailButton() {
  type FormData = z.infer<typeof formSchema>;
  const category = 'button';

  const {
    data: widget,
    isLoading: isLoadingWidget,
    updateConfig,
  } = useWidgetConfig();

  const defaults = () => ({
    textHoverImage: widget?.config?.[category]?.textHoverImage || '',
    textVoteButton: widget?.config?.[category]?.textVoteButton || '',
    fieldUsedForTitle: widget?.config?.[category]?.fieldUsedForTitle || '',
  });

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
  }, [widget]);

  return (
    <div className="p-6 bg-white rounded-md">
      <Form {...form}>
        <Heading size="xl">Knop teksten</Heading>
        <Separator className="my-4" />
        <form
          onSubmit={form.handleSubmit(onSubmit)}
          className="lg:w-1/2 grid grid-cols-1 gap-4">
          <FormField
            control={form.control}
            name="textHoverImage"
            render={({ field }) => (
              <FormItem>
                <FormLabel>
                  Tekst die weergegeven wordt als iemand over een afbeelding
                  hovert
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
            name="textVoteButton"
            render={({ field }) => (
              <FormItem>
                <FormLabel>
                  Tekst die weergegeven wordt in de stem knoppen van een open
                  resource
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
            name="fieldUsedForTitle"
            render={({ field }) => (
              <FormItem>
                <FormLabel>Titel tekst van een resource</FormLabel>
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
