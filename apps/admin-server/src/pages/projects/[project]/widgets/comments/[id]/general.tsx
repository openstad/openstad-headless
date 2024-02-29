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
import { CommentsWidgetProps } from '@openstad-headless/comments/src/comments';
import { FormObjectSelectField } from '@/components/ui/form-object-select-field';
import useResources from '@/hooks/use-resources';

const formSchema = z.object({
  resourceId: z.string().optional(),
  sentiment: z.string(),
  isReplyingEnabled: z.boolean(),
  isVotingEnabled: z.boolean(),
});

export default function ArgumentsGeneral(
  props: CommentsWidgetProps & EditFieldProps<CommentsWidgetProps>
) {
  const form = useForm<z.infer<typeof formSchema>>({
    resolver: zodResolver<any>(formSchema),
    defaultValues: {
      resourceId: props.resourceId,
      sentiment: props.sentiment || 'for',
      isReplyingEnabled: props.isReplyingEnabled || false,
      isVotingEnabled: props.isVotingEnabled || false,
    },
  });

  function onSubmit(values: z.infer<typeof formSchema>) {
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
          <FormField
            control={form.control}
            name="isReplyingEnabled"
            render={({ field }) => (
              <FormItem>
                <FormLabel>
                  Is het toegestaan om te reageren op comments?
                </FormLabel>
                <Select
                  onValueChange={(e: string) => {
                    field.onChange(e === 'true');
                    props.onFieldChanged(field.name, e === 'true');
                  }}
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
            name="isVotingEnabled"
            render={({ field }) => (
              <FormItem>
                <FormLabel>
                  Is het mogelijk om te stemmen op comments?
                </FormLabel>
                <Select
                  value={field.value ? 'true' : 'false'}
                  onValueChange={(e: string) => {
                    field.onChange(e === 'true');
                    props.onFieldChanged(field.name, e === 'true');
                  }}>
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
          <Button type="submit">Opslaan</Button>
        </form>
      </Form>
    </div>
  );
}
