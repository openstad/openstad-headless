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
import {
  Select,
  SelectContent,
  SelectItem,
  SelectTrigger,
  SelectValue,
} from '@/components/ui/select';
import { Separator } from '@/components/ui/separator';
import { Heading } from '@/components/ui/typography';
import { useWidgetConfig } from '@/hooks/use-widget-config';
import { zodResolver } from '@hookform/resolvers/zod';
import { useCallback, useEffect } from 'react';
import { useForm } from 'react-hook-form';
import * as z from 'zod';

const formSchema = z.object({
  displayComments: z.boolean(),
  title: z.string(),
  textEmptyInput: z.string(),
  textAboveInput: z.string(),
  idNonActiveComments: z.string(),
  commentsAvailable: z.enum(['open', 'closed', 'limited']),
});

type FormData = z.infer<typeof formSchema>;

export default function WidgetMapComment() {
  const category = 'comment';

  const {
    data: widget,
    isLoading: isLoadingWidget,
    updateConfig,
  } = useWidgetConfig();

  const defaults = useCallback(
    () => ({
      commentsAvailable:
        widget?.config?.[category]?.commentsAvailable || 'open',
      displayComments: widget?.config?.[category]?.displayComments || false,
      title: widget?.config?.[category]?.title || '',
      textEmptyInput: widget?.config?.[category]?.textEmptyInput || '',
      textAboveInput: widget?.config?.[category]?.textAboveInput || '',
      idNonActiveComments:
        widget?.config?.[category]?.idNonActiveComments || '',
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
        <Heading size="xl" className="mb-4">
          Comments
        </Heading>
        <Separator className="mb-4" />
        <form
          onSubmit={form.handleSubmit(onSubmit)}
          className="grid grid-cols-1 lg:grid-cols-2 gap-4 lg:w-1/2">
          <FormField
            control={form.control}
            name="displayComments"
            render={({ field }) => (
              <FormItem className="col-span-full">
                <FormLabel>Weergave</FormLabel>
                <Select
                  onValueChange={(e: string) => field.onChange(e === 'true')}
                  value={field.value ? 'true' : 'false'}>
                  <FormControl>
                    <SelectTrigger>
                      <SelectValue placeholder="Ja" />
                    </SelectTrigger>
                  </FormControl>
                  <SelectContent>
                    <SelectItem value="true">Ja</SelectItem>
                    <SelectItem value="false">Nee</SelectItem>
                  </SelectContent>
                </Select>
                <FormMessage />
              </FormItem>
            )}
          />
          <FormField
            control={form.control}
            name="title"
            render={({ field }) => (
              <FormItem>
                <FormLabel>Titel boven de comments</FormLabel>
                <FormControl>
                  <Input {...field} />
                </FormControl>
                <FormMessage />
              </FormItem>
            )}
          />
          <FormField
            control={form.control}
            name="textEmptyInput"
            render={({ field }) => (
              <FormItem>
                <FormLabel>Tekst in lege inputveld</FormLabel>
                <FormControl>
                  <Input {...field} />
                </FormControl>
                <FormMessage />
              </FormItem>
            )}
          />
          <FormField
            control={form.control}
            name="textAboveInput"
            render={({ field }) => (
              <FormItem>
                <FormLabel>Tekst boven inputveld</FormLabel>
                <FormControl>
                  <Input {...field} />
                </FormControl>
                <FormMessage />
              </FormItem>
            )}
          />
          <FormField
            control={form.control}
            name="idNonActiveComments"
            render={({ field }) => (
              <FormItem className="col-span-full">
                <FormLabel>
                  IDs van resources waar comments niet actief voor zijn.
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
            name="commentsAvailable"
            render={({ field }) => (
              <FormItem>
                <FormLabel>Comments staan...</FormLabel>
                <Select onValueChange={field.onChange} value={field.value}>
                  <FormControl>
                    <SelectTrigger>
                      <SelectValue placeholder="... open voor alle resources" />
                    </SelectTrigger>
                  </FormControl>
                  <SelectContent>
                    <SelectItem value="open">
                      ... open voor alle resources.
                    </SelectItem>
                    <SelectItem value="closed">
                      ... gesloten voor alle resources.
                    </SelectItem>
                    <SelectItem value="limited">
                      ... open voor sommige resources.
                    </SelectItem>
                  </SelectContent>
                </Select>
                <FormMessage />
              </FormItem>
            )}
          />
          <Button type="submit" className="w-fit col-span-full">
            Opslaan
          </Button>
        </form>
      </Form>
    </div>
  );
}
