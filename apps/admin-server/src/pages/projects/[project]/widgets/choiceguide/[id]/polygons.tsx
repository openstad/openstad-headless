import { Button } from '@/components/ui/button';
import { Checkbox } from '@/components/ui/checkbox';
import {
  Form,
  FormControl,
  FormField,
  FormItem,
  FormLabel,
  FormMessage,
} from '@/components/ui/form';
import { Separator } from '@/components/ui/separator';
import { Heading } from '@/components/ui/typography';
import useAreas from '@/hooks/use-areas';
import { EditFieldProps } from '@/lib/form-widget-helpers/EditFieldProps';
import { zodResolver } from '@hookform/resolvers/zod';
import { ChoiceGuideProps } from '@openstad-headless/choiceguide/src/props';
import { useRouter } from 'next/router';
import React from 'react';
import { useForm } from 'react-hook-form';
import * as z from 'zod';

const formSchema = z.object({
  allowedPolygons: z
    .array(z.object({ id: z.number(), name: z.string() }))
    .optional(),
});

export default function WidgetChoiceGuidePolygons(
  props: ChoiceGuideProps & EditFieldProps<ChoiceGuideProps>
) {
  type FormData = z.infer<typeof formSchema>;

  async function onSubmit(values: FormData) {
    props.updateConfig({ ...props, ...values });
  }

  const form = useForm<FormData>({
    resolver: zodResolver<any>(formSchema),
    defaultValues: {
      allowedPolygons: props?.allowedPolygons || [],
    },
  });

  const router = useRouter();
  const projectId = router.query.project as string;
  const projectKey =
    props.projectId === undefined ? projectId : props.projectId;

  const { data: areas } =
    (useAreas(projectKey) as {
      data: { id: string; name: string; visible?: boolean }[];
    }) ?? [];

  return (
    <div className="p-6 bg-white rounded-md">
      <Form {...form}>
        <Heading size="xl">Polygonen</Heading>
        <p className="text-sm text-muted-foreground mt-2">
          Standaard wordt de polygoon uit de projectinstellingen gebruikt, dus
          laat leeg om de projectinstelling te gebruiken.
        </p>
        <Separator className="my-4" />
        <form
          onSubmit={form.handleSubmit(onSubmit)}
          className="space-y-4 lg:w-1/2">
          {areas?.map((item) => (
            <FormField
              key={item.id}
              control={form.control}
              name="allowedPolygons"
              render={({ field }) => {
                const isChecked =
                  Array.isArray(field.value) &&
                  field.value.some((obj) => obj.id === Number(item.id));
                const label =
                  item.visible === false
                    ? `${item.name} (verborgen)`
                    : item.name;

                return (
                  <FormItem className="flex flex-row items-start space-x-3 space-y-0">
                    <FormControl>
                      <Checkbox
                        checked={isChecked}
                        onCheckedChange={(checked) => {
                          let values = form.getValues('allowedPolygons') || [];

                          if (checked) {
                            if (
                              !values.some((obj) => obj.id === Number(item.id))
                            ) {
                              const updated = [
                                ...values,
                                { name: item.name, id: Number(item.id) },
                              ];
                              form.setValue('allowedPolygons', updated);
                              props.onFieldChanged('allowedPolygons', updated);
                            }
                          } else {
                            const filteredValues = values.filter(
                              (obj) => obj.id !== Number(item.id)
                            );
                            form.setValue('allowedPolygons', filteredValues);
                            props.onFieldChanged(
                              'allowedPolygons',
                              filteredValues
                            );
                          }
                        }}
                      />
                    </FormControl>
                    <FormLabel className="font-normal">{label}</FormLabel>
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
