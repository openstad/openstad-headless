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
  showResources: z.string(),
  excludeResources: z.string(),
  showResourcesFromTheme: z.string(),
});

export default function WidgetResourcesMapContent() {
  const category = 'content';

  const {
    data: widget,
    isLoading: isLoadingWidget,
    updateConfig,
  } = useWidgetConfig();

  const defaults = () => ({
    showResources: widget?.config?.[category]?.showResources || '',
    excludeResources: widget?.config?.[category]?.excludeResources || '',
    showResourcesFromTheme: widget?.config?.[category]?.showResourcesFromTheme || '',
  });

  const form = useForm<z.infer<typeof formSchema>>({
    resolver: zodResolver<any>(formSchema),
    defaultValues: defaults(),
  });

  useEffect(() => {
    form.reset(defaults());
  }, [widget]);

  function onSubmit(values: z.infer<typeof formSchema>) {
    updateConfig({ [category]: values });
  }

  return (
    <div className="p-6 bg-white rounded-md">
      <Form {...form}>
        <Heading size="xl">Content</Heading>
        <Separator className="my-4" />
        <form
          onSubmit={form.handleSubmit(onSubmit)}
          className="space-y-4 lg:w-1/2">
          <FormField
            control={form.control}
            name="showResources"
            render={({ field }) => (
              <FormItem>
                <FormLabel>
                  {`
                   Laat alleen de volgende ideeën zien (Vul hier de IDs van
                  ideeën in, gescheiden met komma's):
                  `}
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
            name="excludeResources"
            render={({ field }) => (
              <FormItem>
                <FormLabel>
                  {`
                   Laat geen ideeën zien van de volgende themas (Vul hier de
                   namen van themas in, gescheiden met komma's):
                  `}
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
            name="showResourcesFromTheme"
            render={({ field }) => (
              <FormItem>
                <FormLabel>
                  {`
                   Laat alleen ideeën zien van de volgende themas (Vul hier de
                    namen van themas in, gescheiden met komma's):
                  `}
                </FormLabel>
                <FormControl>
                  <Input {...field} />
                </FormControl>
                <FormMessage />
              </FormItem>
            )}
          />
          <Button type="submit">Opslaan</Button>
        </form>
      </Form>
    </div>
  );
}
