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
import { Textarea } from '@/components/ui/textarea';
import { Heading } from '@/components/ui/typography';
import { EditFieldProps } from '@/lib/form-widget-helpers/EditFieldProps';
import { zodResolver } from '@hookform/resolvers/zod';
import { useEffect } from 'react';
import { useForm } from 'react-hook-form';
import * as z from 'zod';

const formSchema = z.object({
  noSelectionLoggedInHTML: z.string(),
  noSelectionNotLoggedInHTML: z.string(),
  showNoSelectionBlock: z.boolean(),
  selectionActiveLoggedInHTML: z.string(),
  selectionInactiveLoggedInHTML: z.string(),
  mobilePreviewLoggedInHTML: z.string(),
  selectionActiveNotLoggedInHTML: z.string(),
  selectionInactiveNotLoggedInHTML: z.string(),
  mobilePreviewNotLoggedInHTML: z.string(),
});

type FormData = z.infer<typeof formSchema>;

export default function WidgetMapContent(
  props: { [key: string]: any } & EditFieldProps<any>
) {
  const category = 'content';
  const settings = props?.[category] || {};

  const form = useForm<FormData>({
    resolver: zodResolver<any>(formSchema),
    defaultValues: {
      noSelectionLoggedInHTML: settings.noSelectionLoggedInHTML || '',
      noSelectionNotLoggedInHTML: settings.noSelectionNotLoggedInHTML || '',
      showNoSelectionBlock: settings.showNoSelectionBlock || false,
      selectionActiveLoggedInHTML: settings.selectionActiveLoggedInHTML || '',
      selectionInactiveLoggedInHTML:
        settings.selectionInactiveLoggedInHTML || '',
      mobilePreviewLoggedInHTML: settings.mobilePreviewLoggedInHTML || '',
      selectionActiveNotLoggedInHTML:
        settings.selectionActiveNotLoggedInHTML || '',
      selectionInactiveNotLoggedInHTML:
        settings.selectionInactiveNotLoggedInHTML || '',
      mobilePreviewNotLoggedInHTML: settings.mobilePreviewNotLoggedInHTML || '',
    },
  });

  useEffect(() => {
    const subscription = form.watch((values) => {
      props.onFieldChanged?.(category, values);
    });
    return () => subscription.unsubscribe();
  }, [form, props]);

  return (
    <div className="p-6 bg-white rounded-md">
      <Form {...form}>
        <Heading size="xl">Content</Heading>
        <Separator className="my-4" />
        <form className="space-y-4 lg:w-1/2">
          <FormField
            control={form.control}
            name="noSelectionLoggedInHTML"
            render={({ field }) => (
              <FormItem>
                <FormLabel>noSelectionLoggedInHTML</FormLabel>
                <FormControl>
                  <Textarea {...field} />
                </FormControl>
                <FormMessage />
              </FormItem>
            )}
          />
          <FormField
            control={form.control}
            name="noSelectionNotLoggedInHTML"
            render={({ field }) => (
              <FormItem>
                <FormLabel>noSelectionNotLoggedInHTML</FormLabel>
                <FormControl>
                  <Textarea {...field} />
                </FormControl>
                <FormMessage />
              </FormItem>
            )}
          />
          <FormField
            control={form.control}
            name="showNoSelectionBlock"
            render={({ field }) => (
              <FormItem>
                <FormLabel>Weergave</FormLabel>
                <Select
                  onValueChange={(e: string) => field.onChange(e === 'true')}
                  value={field.value ? 'true' : 'false'}>
                  <FormControl>
                    <SelectTrigger>
                      <SelectValue placeholder="Nee" />
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
            name="selectionActiveLoggedInHTML"
            render={({ field }) => (
              <FormItem>
                <FormLabel>selectionActiveLoggedInHTML</FormLabel>
                <FormControl>
                  <Textarea {...field} />
                </FormControl>
                <FormMessage />
              </FormItem>
            )}
          />
          <FormField
            control={form.control}
            name="selectionInactiveLoggedInHTML"
            render={({ field }) => (
              <FormItem>
                <FormLabel>selectionInactiveLoggedInHTML</FormLabel>
                <FormControl>
                  <Textarea {...field} />
                </FormControl>
                <FormMessage />
              </FormItem>
            )}
          />
          <FormField
            control={form.control}
            name="mobilePreviewLoggedInHTML"
            render={({ field }) => (
              <FormItem>
                <FormLabel>mobilePreviewLoggedInHTML</FormLabel>
                <FormControl>
                  <Textarea {...field} />
                </FormControl>
                <FormMessage />
              </FormItem>
            )}
          />
          <FormField
            control={form.control}
            name="selectionActiveNotLoggedInHTML"
            render={({ field }) => (
              <FormItem>
                <FormLabel>selectionActiveNotLoggedInHTML</FormLabel>
                <FormControl>
                  <Textarea {...field} />
                </FormControl>
                <FormMessage />
              </FormItem>
            )}
          />
          <FormField
            control={form.control}
            name="selectionInactiveNotLoggedInHTML"
            render={({ field }) => (
              <FormItem>
                <FormLabel>selectionInactiveNotLoggedInHTML</FormLabel>
                <FormControl>
                  <Textarea {...field} />
                </FormControl>
                <FormMessage />
              </FormItem>
            )}
          />
          <FormField
            control={form.control}
            name="mobilePreviewNotLoggedInHTML"
            render={({ field }) => (
              <FormItem>
                <FormLabel>mobilePreviewNotLoggedInHTML</FormLabel>
                <FormControl>
                  <Textarea {...field} />
                </FormControl>
                <FormMessage />
              </FormItem>
            )}
          />
        </form>
      </Form>
    </div>
  );
}
