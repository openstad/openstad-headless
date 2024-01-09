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
import { CommentsWidgetProps } from '@openstad/comments/src/comments';

const formSchema = z.object({
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
      sentiment: props.sentiment || 'for',
      isReplyingEnabled: props.isReplyingEnabled || false,
      isVotingEnabled: props.isVotingEnabled || false,
    },
  });

  function onSubmit(values: z.infer<typeof formSchema>) {
    props.updateConfig({ ...props, ...values });
  }

  return (
    <div className="p-6 bg-white rounded-md">
      <Form {...form}>
        <Heading size="xl">Algemeen</Heading>
        <Separator className="my-4" />

        <form
          onSubmit={form.handleSubmit(onSubmit)}
          className="space-y-4 lg:w-1/2">
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
                  Is het toegestaan om te reageren op reacties?
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
                  Is het mogelijk om te stemmen op reacties?
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
