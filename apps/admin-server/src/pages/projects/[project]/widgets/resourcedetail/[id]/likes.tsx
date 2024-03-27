import { Button } from '@/components/ui/button';
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
import { YesNoSelect } from '@/lib/form-widget-helpers';
import { EditFieldProps } from '@/lib/form-widget-helpers/EditFieldProps';
import { zodResolver } from '@hookform/resolvers/zod';
import { ResourceDetailWidgetProps } from '@openstad-headless/resource-detail/src/resource-detail';
import { useForm } from 'react-hook-form';
import * as z from 'zod';
import { Input } from '@/components/ui/input';
import { useFieldDebounce } from '@/hooks/useFieldDebounce';

const formSchema = z.object({
  displayLikes: z.boolean(),
  likeWidgetTitle: z.string().optional(),
  likeWidgetForText: z.string().optional(),
  likeWidgetAgainstText: z.string().optional(),
  likeWidgetProgressBarText: z.string().optional(),
});

export default function WidgetResourceLikesDisplay(
  props: ResourceDetailWidgetProps & EditFieldProps<ResourceDetailWidgetProps>
) {
  type FormData = z.infer<typeof formSchema>;

  const { onFieldChange } = useFieldDebounce(props.onFieldChanged);

  async function onSubmit(values: FormData) {
    props.updateConfig({ ...props, ...values });
  }

  const form = useForm<FormData>({
    resolver: zodResolver<any>(formSchema),
    defaultValues: {
      displayLikes: props?.displayLikes || false,
      likeWidgetTitle: props?.likeWidgetTitle || '',
      likeWidgetProgressBarText: props?.likeWidgetProgressBarText || '',
      likeWidgetForText: props?.likeWidgetForText || '',
      likeWidgetAgainstText: props?.likeWidgetAgainstText || '',
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
            name="displayLikes"
            render={({ field }) => (
              <FormItem>
                <FormLabel>Like widget weergeven</FormLabel>
                {YesNoSelect(field, props)}
                <FormMessage />
              </FormItem>
            )}
          />

          <FormField
            control={form.control}
            name="likeWidgetTitle"
            render={({ field }) => (
              <FormItem>
                <FormLabel>Titel boven de likewidget</FormLabel>
                <FormControl>
                  <Input
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

          <FormField
            control={form.control}
            name="likeWidgetForText"
            render={({ field }) => (
              <FormItem>
                <FormLabel>Label voor &quot;Ja&quot;</FormLabel>
                <FormControl>
                  <Input
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

          <FormField
            control={form.control}
            name="likeWidgetAgainstText"
            render={({ field }) => (
              <FormItem>
                <FormLabel>Label voor &quot;Nee&quot;</FormLabel>
                <FormControl>
                  <Input
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

          <FormField
            control={form.control}
            name="likeWidgetProgressBarText"
            render={({ field }) => (
              <FormItem>
                <FormLabel>Text onder de likewidget progressie balk</FormLabel>
                <FormControl>
                  <Input
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

          <Button className="w-fit col-span-full" type="submit">
            Opslaan
          </Button>
        </form>
      </Form>
    </div>
  );
}
