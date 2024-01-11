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
import { zodResolver } from '@hookform/resolvers/zod';
import { useForm } from 'react-hook-form';
import * as z from 'zod';
import { useRouter } from 'next/router';
import useResources from '@/hooks/use-resources';
import { ResourceDetailWidgetProps } from '@openstad/resource-detail/src/resource-detail';
import { EditFieldProps } from '@/lib/form-widget-helpers/EditFieldProps';
import { useEffect } from 'react';

const formSchema = z.object({
  resourceId: z.string(),
});

export default function WidgetResourceDetailGeneral(
  props: ResourceDetailWidgetProps & EditFieldProps<ResourceDetailWidgetProps>
) {
  type FormData = z.infer<typeof formSchema>;
  async function onSubmit(values: FormData) {
    props.updateConfig({ ...props, ...values });
  }

  const router = useRouter();

  const projectId = router.query.project as string;
  const { data, error, isLoading, remove } = useResources(projectId as string);

  const defaults = () => ({
    resourceId: props?.resourceId || '11',
  });

  const form = useForm<FormData>({
    resolver: zodResolver<any>(formSchema),
    defaultValues: defaults(),
  });

  useEffect(() => {
    form.reset(defaults());
  }, [props?.resourceId]);

  return (
    <div className="p-6 bg-white rounded-md">
      <Form {...form}>
        <Heading size="xl">Algemeen</Heading>
        <Separator className="my-4" />
        <form
          onSubmit={form.handleSubmit(onSubmit)}
          className="grid grid-cols-1 lg:grid-cols-2 gap-4">
          <FormField
            control={form.control}
            name="resourceId"
            render={({ field }) => (
              <FormItem>
                <FormLabel>Resource</FormLabel>
                <Select
                  onValueChange={(e) => {
                    field.onChange(e);
                    props.onFieldChanged(field.name, e);
                  }}
                  value={field.value}>
                  <FormControl>
                    <SelectTrigger>
                      <SelectValue placeholder="Selecteer een resource." />
                    </SelectTrigger>
                  </FormControl>
                  <SelectContent>
                    {data?.map((resource: any) => (
                      <SelectItem key={resource.id} value={`${resource.id}`}>
                        {resource.title}
                      </SelectItem>
                    ))}
                  </SelectContent>
                </Select>
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
