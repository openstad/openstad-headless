import { Button } from '@/components/ui/button';
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
import { ResourceOverviewMapWidgetProps } from '@openstad-headless/leaflet-map/src/types/resource-overview-map-widget-props';
import { useForm } from 'react-hook-form';
import * as z from 'zod';

const formSchema = z.object({
  link: z.boolean(),
  autoCenter: z.boolean(),
});

export default function WidgetResourcesMapMaps(
  props: ResourceOverviewMapWidgetProps &
    EditFieldProps<ResourceOverviewMapWidgetProps>
) {
  const form = useForm<z.infer<typeof formSchema>>({
    resolver: zodResolver<any>(formSchema),
    defaultValues: {
      link: props?.link || false,
      autoCenter: props?.autoCenter || false,
    },
  });

  function onSubmit(values: z.infer<typeof formSchema>) {
    props.updateConfig({ ...props, ...values });
  }

  return (
    <div className="p-6 bg-white rounded-md">
      <Form {...form}>
        <Heading size="xl">Map</Heading>
        <Separator className="my-4" />
        <form
          onSubmit={form.handleSubmit(onSubmit)}
          className="space-y-4 lg:w-1/2">
            
          <FormField
            control={form.control}
            name="link"
            render={({ field }) => (
              <FormItem>
                <FormLabel>
                  Worden links naar de detailpagina gevlagd?
                </FormLabel>
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
            name="autoCenter"
            render={({ field }) => (
              <FormItem>
                <FormLabel>
                  {`Wordt het automatisch centreren van de map op de gebruiker's
                  locatie toegelaten?`}
                </FormLabel>
                <Select
                  onValueChange={(e: string) => field.onChange(e === 'true')}
                  value={field.value ? 'true' : 'false'}>
                  <FormControl>
                    <SelectTrigger>
                      <SelectValue placeholder="Nee" />
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
          <Button type="submit">Opslaan</Button>
        </form>
      </Form>
    </div>
  );
}
