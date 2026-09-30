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
  showResources: z.string(),
  excludeResources: z.string(),
  showResourcesFromTheme: z.string(),
});

type WidgetResourcesMapContentProps = {
  content?: {
    showResources?: string;
    excludeResources?: string;
    showResourcesFromTheme?: string;
  };
  onFieldChanged?: (key: string, value: any) => void;
};

export default function WidgetResourcesMapContent(
  props: WidgetResourcesMapContentProps
) {
  const category = 'content';
  const categoryConfig = props[category] || {};

  const form = useForm<z.infer<typeof formSchema>>({
    resolver: zodResolver<any>(formSchema),
    defaultValues: {
      showResources: categoryConfig.showResources || '',
      excludeResources: categoryConfig.excludeResources || '',
      showResourcesFromTheme: categoryConfig.showResourcesFromTheme || '',
    },
  });

  useEffect(() => {
    const subscription = form.watch((values) => {
      props.onFieldChanged?.(category, values);
    });
    return () => subscription.unsubscribe();
  }, [form, props]);

  return (
    <div className="p-6 bg-white rounded-md">
      <Form {...form}>
        <Heading size="xl">Content</Heading>
        <Separator className="my-4" />
        <form className="space-y-4 lg:w-1/2">
          <FormField
            control={form.control}
            name="showResources"
            render={({ field }) => (
              <FormItem>
                <FormLabel>
                  {`
                   Laat alleen de volgende resources zien (Vul hier de IDs van
                  resources in, gescheiden met komma's):
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
                   Laat geen resources zien van de volgende themas (Vul hier de
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
                   Laat alleen resources zien van de volgende themas (Vul hier de
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
        </form>
      </Form>
    </div>
  );
}
