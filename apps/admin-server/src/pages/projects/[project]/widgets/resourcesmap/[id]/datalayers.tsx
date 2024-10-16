import { Button } from '@/components/ui/button';
import {
    Form, FormControl, FormDescription, FormField, FormItem, FormLabel, FormMessage,
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
import {YesNoSelect} from "@/lib/form-widget-helpers";
import { useEffect } from 'react';

const formSchema = z.object({
    enableOnOffSwitching: z.boolean().optional(),
    datalayer: z.array(z.object({
        id: z.number(),
        name: z.string(),
        activeOnInit: z.boolean().optional(),
    })).optional(),
}).catchall(z.boolean().optional());

export default function WidgetResourcesMapDatalayers(
    props: ResourceOverviewMapWidgetTabProps &
        EditFieldProps<ResourceOverviewMapWidgetTabProps> & {
        datalayer?: any;
        enableOnOffSwitching?: boolean;
        activeOnInit?: boolean;
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
            enableOnOffSwitching: props?.enableOnOffSwitching || false,
        },
    });
    const router = useRouter();
    const projectId = router.query.project as string;

    const { data: datalayers } = useDatalayers(props.projectId === undefined ? projectId : props.projectId) as { data: { id: string, name: string }[] } ?? [];

  useEffect(() => {
    if (!form.getValues('enableOnOffSwitching')) {
      const updatedLayers = (form.getValues('datalayer') || []).map((layer) => {
        const { activeOnInit, ...rest } = layer;
        return rest;
      });
      form.setValue('datalayer', updatedLayers);
      props.onFieldChanged('datalayer', updatedLayers);
    }
  }, [form.getValues('enableOnOffSwitching')]);

    return (
        <div className="p-6 bg-white rounded-md">
            <Form {...form}>
                <Heading size="xl">Kaartlagen</Heading>
                <Separator className="my-4" />
                <form
                    onSubmit={form.handleSubmit(onSubmit)}
                    className="space-y-4 lg:w-1/2">

                    {datalayers?.map((item) => (
                      <div key={item.id}>
                        <FormField
                          control={form.control}
                          name="datalayer"
                          render={({field}) => {
                            const isChecked = Array.isArray(field.value) && field.value.some(obj => obj.id === Number(item.id));

                            return (
                              <FormItem className="flex flex-row items-start space-x-3 space-y-0">
                                <FormControl>
                                  <Checkbox
                                    checked={isChecked}
                                    onCheckedChange={(checked) => {
                                      let values = form.getValues('datalayer') || [];

                                      if (checked) {
                                        if (!values.some(obj => obj.id === Number(item.id))) {
                                          const {name} = item;
                                          form.setValue('datalayer', [...values, {name, id: Number(item.id)}]);
                                          props.onFieldChanged(field.name, [...values, {name, id: Number(item.id)}]);
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
                                <FormMessage/>
                              </FormItem>
                            );
                          }}
                        />

                        {(
                          form.getValues('enableOnOffSwitching') &&
                          Array.isArray(form.getValues('datalayer')) &&
                          form.getValues('datalayer')?.some(obj => obj.id === Number(item.id))
                        ) && (
                            <FormField
                              control={form.control}
                              name={`activeOnInit_${item.id}`}
                              render={({field}) => {
                                const activeOnInit = form.getValues('datalayer')
                                  ?.find(obj => obj.id === Number(item.id))?.activeOnInit ?? true;

                                return (
                                  <FormItem className="flex flex-row items-start space-x-3 space-y-0">
                                    <FormControl>
                                      <Checkbox
                                        checked={activeOnInit}
                                        onCheckedChange={(checked) => {
                                          let values = form.getValues('datalayer') || [];
                                          const updatedValues = values.map(obj =>
                                            obj.id === Number(item.id) ? { ...obj, activeOnInit: !!checked } : obj
                                          );
                                          form.setValue('datalayer', updatedValues);
                                          props.onFieldChanged('datalayer', updatedValues);
                                        }}
                                      />
                                    </FormControl>
                                    <FormLabel className="font-normal">
                                      Deze laag standaard tonen bij het openen van de kaart
                                    </FormLabel>
                                    <FormMessage/>
                                  </FormItem>
                                );
                              }}
                            />
                          )}
                      </div>
                    )) || null}

                    <br />
                    <FormField
                      control={form.control}
                      name="enableOnOffSwitching"
                      render={({ field }) => (
                        <FormItem>
                            <FormLabel>Wil je dat het mogelijk is om de kaartlagen aan en uit te zetten?</FormLabel>
                            <FormDescription>
                                Als je dit aanvinkt kunnen gebruikers de kaartlagen aan en uit zetten.
                                De kaartlagen worden getoond in een legenda.
                            </FormDescription>
                            {YesNoSelect(field, props)}
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
