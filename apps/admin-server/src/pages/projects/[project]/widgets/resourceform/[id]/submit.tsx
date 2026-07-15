import { CheckboxList } from '@/components/checkbox-list';
import {
  Form,
  FormControl,
  FormField,
  FormItem,
  FormLabel,
  FormMessage,
} from '@/components/ui/form';
import InfoDialog from '@/components/ui/info-hover';
import { Input } from '@/components/ui/input';
import { Separator } from '@/components/ui/separator';
import { Spacer } from '@/components/ui/spacer';
import { Heading } from '@/components/ui/typography';
import useTags from '@/hooks/use-tags';
import { EditFieldProps } from '@/lib/form-widget-helpers/EditFieldProps';
import { zodResolver } from '@hookform/resolvers/zod';
import { ResourceFormWidgetProps } from '@openstad-headless/resource-form/src/props';
import React, { useEffect } from 'react';
import { useForm } from 'react-hook-form';
import * as z from 'zod';

const formSchema = z.object({
  submitButton: z.string(),
  saveButton: z.string(),
  saveConceptButton: z.string(),
  defaultAddedTags: z.string().optional(),
});

export default function WidgetResourceFormSubmit(
  props: ResourceFormWidgetProps & EditFieldProps<ResourceFormWidgetProps>
) {
  type FormData = z.infer<typeof formSchema>;
  const category = 'submit';

  // This tab feeds the shared whole-widget draft under the `submit` key so the
  // header save bar persists it together with every other tab in one request.
  const submit = (props as any)[category] || {};

  const form = useForm<FormData>({
    resolver: zodResolver<any>(formSchema),
    defaultValues: {
      submitButton: submit.submitButton || '',
      saveButton: submit.saveButton || '',
      saveConceptButton: submit.saveConceptButton || '',
      defaultAddedTags: submit.defaultAddedTags || '',
    },
  });

  // Push the whole submit object into the draft on any change.
  useEffect(() => {
    const subscription = form.watch((values) => {
      props.onFieldChanged?.(category, values);
    });
    return () => subscription.unsubscribe();
  }, [form, props]);

  const projectId = props.projectId;
  const { data: loadedTags } = useTags(projectId);
  const tags = (loadedTags || []) as Array<{
    id: string;
    name: string;
    type?: string;
  }>;

  return (
    <div className="p-6 bg-white rounded-md">
      <Form {...form}>
        <Heading size="xl">Opleveren</Heading>
        <Separator className="my-4" />
        <form className="lg:w-2/3 grid grid-cols-1 gap-4 ">
          <FormField
            control={form.control}
            name="submitButton"
            render={({ field }) => (
              <FormItem>
                <FormLabel>
                  Tekst voor de oplever-knop
                  <InfoDialog content={'TODO'} />
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
            name="saveButton"
            render={({ field }) => (
              <FormItem>
                <FormLabel>
                  Tekst voor de opslaan-knop
                  <InfoDialog content={'TODO'} />
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
            name="saveConceptButton"
            render={({ field }) => (
              <FormItem>
                <FormLabel>
                  {`Tekst voor de 'opslaan als concept'-knop`}
                  <InfoDialog content={'TODO'} />
                </FormLabel>
                <FormControl>
                  <Input {...field} />
                </FormControl>
                <FormMessage />
              </FormItem>
            )}
          />

          <Spacer />

          <FormLabel>
            Kies de tags die standaard toegevoegd worden bij een nieuwe
            inzending
          </FormLabel>
          <CheckboxList
            form={form}
            fieldName="defaultAddedTags"
            label={(t) => t.name}
            keyForGrouping="type"
            keyPerItem={(t) => `${t.id}`}
            items={tags}
            selectedPredicate={(t) =>
              // @ts-ignore
              form
                ?.getValues('defaultAddedTags')
                ?.split(',')
                ?.findIndex((tg) => tg === `${t.id}`) > -1
            }
            onValueChange={(tag, checked) => {
              const ids = form.getValues('defaultAddedTags')?.split(',') ?? [];

              const idsToSave = (
                checked
                  ? [...ids, tag.id]
                  : ids.filter((id) => id !== `${tag.id}`)
              ).join(',');

              form.setValue('defaultAddedTags', idsToSave);
            }}
          />
        </form>
      </Form>
    </div>
  );
}
