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
  excludeTheme: z.string(),
  filterTheme: z.string(),
  filterResource: z.string(),
});

export default function WidgetResourceOverviewInclude() {
  type FormData = z.infer<typeof formSchema>;
  const category = 'include';

  const {
    data: widget,
    isLoading: isLoadingWidget,
    updateConfig,
  } = useWidgetConfig();

  const defaults = () => ({
    excludeTheme: widget?.config?.[category]?.excludeTheme || '',
    filterTheme: widget?.config?.[category]?.filterTheme || '',
    filterResource: widget?.config?.[category]?.filterResource || '',
  });

  async function onSubmit(values: FormData) {
    try {
      await updateConfig({ [category]: values });
    } catch (error) {
      console.error('could falset update', error);
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
        <Heading size="xl">Inclusief/Exclusief</Heading>
        <Separator className="my-4" />
        <form
          onSubmit={form.handleSubmit(onSubmit)}
          className="lg:w-1/3 grid grid-cols-1 gap-4">
          <FormField
            control={form.control}
            name="excludeTheme"
            render={({ field }) => (
              <FormItem>
                <FormLabel>Geef ideeën met dit thema niet weer:</FormLabel>
                <FormControl>
                  <Input {...field} />
                </FormControl>
                <FormMessage />
              </FormItem>
            )}
          />
          <FormField
            control={form.control}
            name="filterTheme"
            render={({ field }) => (
              <FormItem>
                <FormLabel>
                  Geef enkel ideeën weer met dit specifieke thema:
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
            name="filterResource"
            render={({ field }) => (
              <FormItem>
                <FormLabel>Geef enkel de volgende resources weer:</FormLabel>
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
