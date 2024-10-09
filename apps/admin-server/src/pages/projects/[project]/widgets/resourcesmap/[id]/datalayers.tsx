import { Button } from '@/components/ui/button';
import {
    Form, FormControl, FormField, FormItem, FormLabel, FormMessage,
} from '@/components/ui/form';
import { Separator } from '@/components/ui/separator';
import { zodResolver } from '@hookform/resolvers/zod';
import { useForm } from 'react-hook-form';
import { Heading } from '@/components/ui/typography';
import { EditFieldProps } from '@/lib/form-widget-helpers/EditFieldProps';
import * as z from 'zod';
import { ResourceOverviewMapWidgetTabProps } from '.';
import { useRouter } from 'next/router';
import useDatalayers from "@/hooks/use-datalayers";
import {Checkbox} from "@/components/ui/checkbox";

const formSchema = z.object({
    datalayer: z.array(z.object({
        id: z.number(),
        name: z.string()
    })).optional(),
});

export default function WidgetResourcesMapDatalayers(
    props: ResourceOverviewMapWidgetTabProps &
        EditFieldProps<ResourceOverviewMapWidgetTabProps> & {
        datalayer?: any;
    }
) {

    type FormData = z.infer<typeof formSchema>;

    async function onSubmit(values: FormData) {
        props.updateConfig({ ...props, ...values });
    }

    const form = useForm<FormData>({
        resolver: zodResolver<any>(formSchema),
        defaultValues: {
            datalayer: props?.datalayer || '',
        },
    });
    const router = useRouter();
    const projectId = router.query.project as string;

    const { data: datalayers } = useDatalayers(props.projectId === undefined ? projectId : props.projectId) as { data: { id: string, name: string }[] } ?? [];

    return (
        <div className="p-6 bg-white rounded-md">
            <Form {...form}>
                <Heading size="xl">Kaartlagen</Heading>
                <Separator className="my-4" />
                <form
                    onSubmit={form.handleSubmit(onSubmit)}
                    className="space-y-4 lg:w-1/2">

                    {datalayers?.map((item) => (
                      <FormField
                        key={item.id}
                        control={form.control}
                        name="datalayer"
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
                                                let values = form.getValues('datalayer') || [];

                                                if (checked) {
                                                    if (!values.some(obj => obj.id === Number(item.id))) {
                                                        const { name } = item;
                                                        form.setValue('datalayer', [...values, { name, id: Number(item.id) }]);
                                                        props.onFieldChanged(field.name, [...values, { name, id: Number(item.id) }]);
                                                    }
                                                } else {
                                                    const filteredValues = values.filter(obj => obj.id !== Number(item.id));
                                                    form.setValue('datalayer', filteredValues);
                                                    props.onFieldChanged('datalayer', filteredValues);
                                                }
                                            }}
                                          />
                                      </FormControl>
                                      <FormLabel className="font-normal">
                                          {item.name}
                                      </FormLabel>
                                  </div>
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
