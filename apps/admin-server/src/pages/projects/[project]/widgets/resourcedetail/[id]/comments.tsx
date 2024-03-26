import { Button } from '@/components/ui/button';
import {
  Form,
  FormField,
  FormItem,
  FormLabel,
  FormMessage,
} from '@/components/ui/form';
import { Separator } from '@/components/ui/separator';
import { Heading } from '@/components/ui/typography';
import { YesNoSelect } from '@/lib/form-widget-helpers';
import { EditFieldProps } from '@/lib/form-widget-helpers/EditFieldProps';
import { zodResolver } from '@hookform/resolvers/zod';
import { ResourceDetailWidgetProps } from '@openstad-headless/resource-detail/src/resource-detail';
import { useForm } from 'react-hook-form';
import * as z from 'zod';

const formSchema = z.object({
  displayComments: z.boolean(),
  commentsVotingEnabled: z.boolean(),
  commentsReplyingEnabled: z.boolean(),
});

export default function WidgetResourceCommentsDisplay(
  props: ResourceDetailWidgetProps & EditFieldProps<ResourceDetailWidgetProps>
) {
  type FormData = z.infer<typeof formSchema>;

  async function onSubmit(values: FormData) {
    props.updateConfig({ ...props, ...values });
  }

  const form = useForm<FormData>({
    resolver: zodResolver<any>(formSchema),
    defaultValues: {
      displayComments: props?.displayComments || true,
      commentsVotingEnabled: props.commentsVotingEnabled || true,
      commentsReplyingEnabled: props.commentsReplyingEnabled || true,
    },
  });

  return (
    <div className="p-6 bg-white rounded-md">
      <Form {...form}>
        <Heading size="xl">Display</Heading>
        <Separator className="my-4" />
        <form
          onSubmit={form.handleSubmit(onSubmit)}
          className="lg:w-3/4 grid grid-cols-1 lg:grid-cols-2 gap-4">
          <FormField
            control={form.control}
            name="displayComments"
            render={({ field }) => (
              <FormItem>
                <FormLabel>Argumenten widget weergeven</FormLabel>
                {YesNoSelect(field, props)}
                <FormMessage />
              </FormItem>
            )}
          />

          <FormField
            control={form.control}
            name="commentsVotingEnabled"
            render={({ field }) => (
              <FormItem>
                <FormLabel>Stemmen toegestaan?</FormLabel>
                {YesNoSelect(field, props)}
                <FormMessage />
              </FormItem>
            )}
          />

          <FormField
            control={form.control}
            name="commentsReplyingEnabled"
            render={({ field }) => (
              <FormItem>
                <FormLabel>Reageren op commentaar toegestaan?</FormLabel>
                {YesNoSelect(field, props)}
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
