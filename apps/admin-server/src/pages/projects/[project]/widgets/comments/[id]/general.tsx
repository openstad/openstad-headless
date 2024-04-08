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
import { EditFieldProps } from '@/lib/form-widget-helpers/EditFieldProps';
import { FormObjectSelectField } from '@/components/ui/form-object-select-field';
import useResources from '@/hooks/use-resources';
import { ReactNode } from 'react';
import { ArgumentWidgetTabProps } from '.';
import * as Switch from '@radix-ui/react-switch';

const formSchema = z.object({
  resourceId: z.string().optional(),
  sentiment: z.string(),
  isReplyingEnabled: z.boolean(),
  isVotingEnabled: z.boolean(),
});

type SchemaKey = keyof typeof formSchema.shape;

export default function ArgumentsGeneral({
  omitSchemaKeys = [],
  ...props
}: ArgumentWidgetTabProps &
  EditFieldProps<ArgumentWidgetTabProps> & {
    omitSchemaKeys?: Array<SchemaKey>;
  }) {
  const finalSchema = formSchema.omit(
    omitSchemaKeys.reduce(
      (prev, key) => Object.assign(prev, { [key]: true }),
      {}
    )
  );

  type finalSchemaInfer = z.infer<typeof finalSchema>;

  const conditionallyRenderField = (key: SchemaKey, field: ReactNode) => {
    return key in finalSchema.shape ? field : null;
  };

  const form = useForm<finalSchemaInfer>({
    resolver: zodResolver<any>(finalSchema),
    defaultValues: {
      resourceId: props.resourceId,
      sentiment: props.sentiment || 'for',
      isReplyingEnabled: props.isReplyingEnabled || false,
      isVotingEnabled: props.isVotingEnabled || false,
    },
  });

  function onSubmit(values: finalSchemaInfer) {
    props.updateConfig({ ...props, ...values });
  }

  const { data } = useResources(props.projectId);
  const resources: Array<{ id: string | number; title: string }> = data || [];

  return (
    <div className="p-6 bg-white rounded-md">
      <Form {...form}>
        <Heading size="xl">Algemeen</Heading>
        <Separator className="my-4" />

        <form
          onSubmit={form.handleSubmit(onSubmit)}
          className="space-y-4 lg:w-1/2">
          {conditionallyRenderField(
            'resourceId',
            <FormObjectSelectField
              form={form}
              fieldName="resourceId"
              fieldLabel="Koppel aan een specifieke resource"
              items={resources}
              keyForValue="id"
              label={(resource) => `${resource.id} ${resource.title}`}
              onFieldChanged={props.onFieldChanged}
              noSelection="Niet koppelen (gebruik queryparam openstadResourceId)"
            />
          )}

          {conditionallyRenderField(
            'sentiment',
            <FormField
              control={form.control}
              name="sentiment"
              render={({ field }) => (
                <FormItem>
                  <FormLabel>Sentiment</FormLabel>
                  <Select
                    value={field.value}
                    onValueChange={(value) => {
                      field.onChange(value);
                      props.onFieldChanged(field.name, value);
                    }}>
                    <FormControl>
                      <SelectTrigger>
                        <SelectValue placeholder="Voor" />
                      </SelectTrigger>
                    </FormControl>
                    <SelectContent>
                      <SelectItem value="for">Voor</SelectItem>
                      <SelectItem value="against">Tegen</SelectItem>
                      <SelectItem value="none">Geen sentiment</SelectItem>
                    </SelectContent>
                  </Select>
                  <FormMessage />
                </FormItem>
              )}
            />
          )}

          {conditionallyRenderField(
            'isReplyingEnabled',
            <FormField
              control={form.control}
              name="isReplyingEnabled"
              render={({ field }) => (
                <FormItem>
                  <FormLabel>
                    Is het toegestaan om te reageren op reacties?
                  </FormLabel>
                  <Switch.Root
                    className="block w-[50px] h-[25px] bg-stone-300 rounded-full relative focus:shadow-[0_0_0_2px] focus:shadow-black data-[state=checked]:bg-primary outline-none cursor-default"
                    onCheckedChange={(e: boolean) => {
                      field.onChange(e);
                      props.onFieldChanged(field.name, e);
                    }}
                    defaultChecked={field.value}>
                    <Switch.Thumb className="block w-[21px] h-[21px] bg-white rounded-full transition-transform duration-100 translate-x-0.5 will-change-transform data-[state=checked]:translate-x-[27px]" />
                  </Switch.Root>
                  <FormMessage />
                </FormItem>
              )}
            />
          )}

          {conditionallyRenderField(
            'isVotingEnabled',
            <FormField
              control={form.control}
              name="isVotingEnabled"
              render={({ field }) => (
                <FormItem>
                  <FormLabel>
                    Is het mogelijk om te stemmen op reacties?
                  </FormLabel>
                  <Switch.Root
                    className="block w-[50px] h-[25px] bg-stone-300 rounded-full relative focus:shadow-[0_0_0_2px] focus:shadow-black data-[state=checked]:bg-primary outline-none cursor-default"
                    onCheckedChange={(e: boolean) => {
                      field.onChange(e);
                      props.onFieldChanged(field.name, e);
                    }}
                    defaultChecked={field.value}>
                    <Switch.Thumb className="block w-[21px] h-[21px] bg-white rounded-full transition-transform duration-100 translate-x-0.5 will-change-transform data-[state=checked]:translate-x-[27px]" />
                  </Switch.Root>
                  <FormMessage />
                </FormItem>
              )}
            />
          )}

          <Button type="submit">Opslaan</Button>
        </form>
      </Form>
    </div>
  );
}
