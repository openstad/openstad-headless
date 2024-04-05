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
import { useFieldDebounce } from '@/hooks/useFieldDebounce';
import { EditFieldProps } from '@/lib/form-widget-helpers/EditFieldProps';
import { zodResolver } from '@hookform/resolvers/zod';
import { ResourceOverviewWidgetProps } from '@openstad-headless/resource-overview/src/resource-overview';
import { useForm } from 'react-hook-form';
import * as z from 'zod';

const formSchema = z.object({
  itemsPerPage: z.coerce.number()
});

export default function WidgetResourceOverviewPagination(
  props: ResourceOverviewWidgetProps &
    EditFieldProps<ResourceOverviewWidgetProps>
) {
  type FormData = z.infer<typeof formSchema>;
  async function onSubmit(values: FormData) {
    props.updateConfig({ ...props, ...values });
  }

  const { onFieldChange } = useFieldDebounce(props.onFieldChanged);

  const form = useForm<FormData>({
    resolver: zodResolver<any>(formSchema),
    defaultValues: {
      itemsPerPage: props?.itemsPerPage || 30,
    },
  });

  return (
    <div className="p-6 bg-white rounded-md">
      <Form {...form}>
        <Heading size="xl">Pagination</Heading>
        <Separator className="my-4" />
        <form
          onSubmit={form.handleSubmit(onSubmit)}
          className="lg:w-1/3 grid grid-cols-1 gap-x-4 gap-y-8">
          <FormField
            control={form.control}
            name="itemsPerPage"
            render={({ field }) => (
              <FormItem>
                <FormLabel>Hoeveelheid items per pagina</FormLabel>
                <FormControl>
                  <Input type="number" {...field} 
                    placeholder="30"
                    {...field}
                    onChange={(e) => {
                      onFieldChange(field.name, e.target.value);
                      field.onChange(e);
                    }} />
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
