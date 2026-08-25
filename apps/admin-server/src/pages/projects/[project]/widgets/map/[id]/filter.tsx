import {
  Form,
  FormControl,
  FormField,
  FormItem,
  FormLabel,
  FormMessage,
} from '@/components/ui/form';
import {
  Select,
  SelectContent,
  SelectItem,
  SelectTrigger,
  SelectValue,
} from '@/components/ui/select';
import { Separator } from '@/components/ui/separator';
import { Heading } from '@/components/ui/typography';
import { EditFieldProps } from '@/lib/form-widget-helpers/EditFieldProps';
import { zodResolver } from '@hookform/resolvers/zod';
import { useEffect } from 'react';
import { useForm } from 'react-hook-form';
import * as z from 'zod';

const formSchema = z.object({
  searchLocations: z.enum([
    'resourcesAndAddresses',
    'resources',
    'addresses',
    'none',
  ]),
});

type FormData = z.infer<typeof formSchema>;

export default function WidgetMapFilter(
  props: { [key: string]: any } & EditFieldProps<any>
) {
  const category = 'filter';
  const settings = props?.[category] || {};

  const form = useForm<FormData>({
    resolver: zodResolver<any>(formSchema),
    defaultValues: {
      searchLocations: settings.searchLocations || 'resourcesAndAddresses',
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
        <Heading size="xl" className="mb-4">
          Filterbalk
        </Heading>
        <Separator className="mb-4" />
        <form className="space-y-4 lg:w-1/2">
          <FormField
            control={form.control}
            name="searchLocations"
            render={({ field }) => (
              <FormItem>
                <FormLabel>Waar wordt in gezocht?</FormLabel>
                <Select onValueChange={field.onChange} value={field.value}>
                  <FormControl>
                    <SelectTrigger>
                      <SelectValue placeholder="Zoek in resources en adressen" />
                    </SelectTrigger>
                  </FormControl>
                  <SelectContent>
                    <SelectItem value="resourcesAndAddresses">
                      Zoek in resources en adressen
                    </SelectItem>
                    <SelectItem value="resources">Zoek in resources</SelectItem>
                    <SelectItem value="addresses">Zoek in adressen</SelectItem>
                    <SelectItem value="none">Geen zoekveld</SelectItem>
                  </SelectContent>
                </Select>
                <FormMessage />
              </FormItem>
            )}
          />
        </form>
      </Form>
    </div>
  );
}
