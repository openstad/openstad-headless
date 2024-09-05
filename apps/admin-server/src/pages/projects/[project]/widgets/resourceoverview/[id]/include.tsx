import { CheckboxList } from '@/components/checkbox-list';
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
import useTags from '@/hooks/use-tags';
import { useFieldDebounce } from '@/hooks/useFieldDebounce';
import { EditFieldProps } from '@/lib/form-widget-helpers/EditFieldProps';
import { zodResolver } from '@hookform/resolvers/zod';
import { ResourceOverviewWidgetProps } from '@openstad-headless/resource-overview/src/resource-overview';
import { useForm } from 'react-hook-form';
import * as z from 'zod';
import useStatuses from "@/hooks/use-statuses";
import React from "react";

const formSchema = z.object({
  onlyIncludeTagIds: z.string().optional(),
  onlyIncludeStatusIds: z.string().optional()
});

export default function WidgetResourceOverviewInclude(
  props: ResourceOverviewWidgetProps &
    EditFieldProps<ResourceOverviewWidgetProps>
) {
  type FormData = z.infer<typeof formSchema>;
  async function onSubmit(values: FormData) {
    props.updateConfig({ ...props, ...values });
  }

  const { data: loadedStatuses } = useStatuses(props.projectId);
  let statuses = (loadedStatuses || []) as {
    id: number;
    name: string;
  }[];

  const { data: loadedTags } = useTags(props.projectId);
  const tags = (loadedTags || []) as Array<{
    id: string;
    name: string;
    type?: string;
  }>;

  const form = useForm<FormData>({
    resolver: zodResolver<any>(formSchema),
    defaultValues: {
      onlyIncludeTagIds: props?.onlyIncludeTagIds || '',
      onlyIncludeStatusIds: props?.onlyIncludeStatusIds || '',
    },
  });

  return (
    <div className="p-6 bg-white rounded-md">
      <Form {...form} className="p-6 bg-white rounded-md">
        <Heading size="xl">Inclusief/Exclusief</Heading>
        <Separator className="my-4" />
        <form
          onSubmit={form.handleSubmit(onSubmit)}
          className="grid gap-4">         
          <CheckboxList
            form={form}
            fieldName="onlyIncludeTagIds"
            fieldLabel="Geef enkel de resources met de volgende tags weer:"
            label={(t) => t.name}
            keyForGrouping="type"
            keyPerItem={(t) => `${t.id}`}
            items={tags}
            selectedPredicate={(t) =>
              // @ts-ignore
              form
                ?.getValues('onlyIncludeTagIds')
                ?.split(',')
                ?.findIndex((tg) => tg === `${t.id}`) > -1
            }
            onValueChange={(tag, checked) => {
              const ids = form.getValues('onlyIncludeTagIds')?.split(',') ?? [];
              const idsToSave = (checked
                ? [...ids, tag.id]
                : ids.filter((id) => id !== `${tag.id}`)).join(',');

              form.setValue('onlyIncludeTagIds', idsToSave);
              props.onFieldChanged("onlyIncludeTagIds", idsToSave);
            }}
          />

          <CheckboxList
            form={form}
            fieldName="onlyIncludeStatusIds"
            fieldLabel="Geef enkel de inzendingen met de volgende status weer:"
            layout="vertical"
            label={(t) => t.name}
            keyPerItem={(t) => `${t.id}`}
            items={statuses}
            selectedPredicate={(t) =>
              // @ts-ignore
              form
                ?.getValues('onlyIncludeStatusIds')
                ?.split(',')
                ?.findIndex((tg) => tg === `${t.id}`) > -1
            }
            onValueChange={(status, checked) => {
              const values = form.getValues('onlyIncludeStatusIds')?.split(',') ?? [];

              const idsToSave = (checked
                ? [...values, status.id]
                : values.filter((id) => id !== `${status.id}`)).join(',');

              form.setValue('onlyIncludeStatusIds', idsToSave);
              props.onFieldChanged("onlyIncludeStatusIds", idsToSave);
            }}
          />
          
          <Button className="w-fit col-span-full" type="submit">
            Opslaan
          </Button>
        </form>
      </Form>
    </div>
  );
}
