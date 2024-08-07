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
import { zodResolver } from '@hookform/resolvers/zod';
import { useForm } from 'react-hook-form';
import { Heading } from '@/components/ui/typography';
import { useFieldDebounce } from '@/hooks/useFieldDebounce';
import { EditFieldProps } from '@/lib/form-widget-helpers/EditFieldProps';
import * as z from 'zod';
import { ResourceOverviewMapWidgetTabProps } from '.';
import useAreas from '@/hooks/use-areas';
import { Checkbox } from '@/components/ui/checkbox';
import { useRouter } from 'next/router';

const formSchema = z.object({
  customPolygon: z.array(z.object({ id: z.number(), name: z.string() })).optional(),
  customPolygonUrl: z.any().optional()
});

export default function WidgetResourcesMapButton(
  props: ResourceOverviewMapWidgetTabProps &
    EditFieldProps<ResourceOverviewMapWidgetTabProps> & {
      customPolygon?: any;
      customPolygonUrl?: any;
    }
) {

  type FormData = z.infer<typeof formSchema>;

  async function onSubmit(values: FormData) {
    const customPolygon = values?.customPolygon?.map((item: any) => {
      const url = values?.customPolygonUrl[item.id] ?? "";
      return { ...item, url };
    });

    values.customPolygon = customPolygon;

    props.updateConfig({ ...props, ...values });
  }

  const { onFieldChange } = useFieldDebounce(props.onFieldChanged);

  const form = useForm<FormData>({
    resolver: zodResolver<any>(formSchema),
    defaultValues: {
      customPolygon: props?.customPolygon || [],
      customPolygonUrl: props?.customPolygonUrl || []
    },
  });
  const router = useRouter();
  const projectId = router.query.project as string;

  const { data: areas } = useAreas(props.projectId === undefined ? projectId : props.projectId) as { data: { id: string, name: string }[] } ?? [];

  return (
    <div className="p-6 bg-white rounded-md">
      <Form {...form}>
        <Heading size="xl">Polygonen</Heading>
        <Separator className="my-4" />
        <form
          onSubmit={form.handleSubmit(onSubmit)}
          className="space-y-4 lg:w-1/2">

          {areas?.map((item) => (
            <FormField
              key={item.id}
              control={form.control}
              name="customPolygon"
              render={({ field }) => {
                const isChecked = Array.isArray(field.value) && field.value.some(obj => obj.id === Number(item.id));

                return (
                  <FormItem
                    key={item.id}
                    className="flex flex-column items-start space-x-0 space-y-3">
                    <div className='flex flex-row items-start space-x-3 space-y-0'>
                      <FormControl>
                        <Checkbox
                          checked={isChecked}
                          onCheckedChange={(checked) => {
                            let values = form.getValues('customPolygon') || [];

                            if (checked) {
                              if (!values.some(obj => obj.id === Number(item.id))) {
                                const { name } = item;
                                form.setValue('customPolygon', [...values, { name, id: Number(item.id) }]);
                                props.onFieldChanged(field.name, [...values, { name, id: Number(item.id) }]);
                              }
                            } else {
                              const filteredValues = values.filter(obj => obj.id !== Number(item.id));
                              form.setValue('customPolygon', filteredValues);
                              props.onFieldChanged('customPolygon', filteredValues);
                            }
                          }}
                        />
                      </FormControl>
                      <FormLabel className="font-normal">
                        {item.name}
                      </FormLabel>
                    </div>
                    {isChecked && (
                      <div className='w-full'>
                        <FormField
                          control={form.control}
                          name={`customPolygonUrl.${Number(item.id)}`}
                          render={({ field }) => (

                            <FormItem>
                              <FormLabel>
                                Add URL
                              </FormLabel>
                              <FormControl>
                                <Input
                                  placeholder="url / path"
                                  type="text"
                                  {...field}
                                  onChange={(e) => {
                                    onFieldChange(field.name, e.target.value);
                                    field.onChange(e);
                                  }}
                                />
                              </FormControl>
                              <FormMessage />
                            </FormItem>
                          )}
                        />
                      </div>
                    )}
                    <FormMessage />
                  </FormItem>
                );
              }}
            />
          )) || null}


          <Button type="submit">Opslaan</Button>
        </form>
      </Form>
    </div>
  );
}
