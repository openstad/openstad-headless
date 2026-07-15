import {
  Form,
  FormControl,
  FormField,
  FormItem,
  FormLabel,
  FormMessage,
} from '@/components/ui/form';
import { Input } from '@/components/ui/input';
import {
  Select,
  SelectContent,
  SelectItem,
  SelectTrigger,
  SelectValue,
} from '@/components/ui/select';
import { Separator } from '@/components/ui/separator';
import { Heading } from '@/components/ui/typography';
import { EditFieldProps } from '@/lib/form-widget-helpers/EditFieldProps';
import { zodResolver } from '@hookform/resolvers/zod';
import { useEffect } from 'react';
import { useForm } from 'react-hook-form';
import * as z from 'zod';

const formSchema = z.object({
  displayReactions: z.boolean(),
  title: z.string(),
  textEmptyInput: z.string(),
  textAboveInput: z.string(),
  idNonActiveReactions: z.string(),
  reactionsAvailable: z.enum(['open', 'closed', 'limited']),
});

type FormData = z.infer<typeof formSchema>;

export default function WidgetMapReaction(
  props: { [key: string]: any } & EditFieldProps<any>
) {
  const category = 'reaction';
  const settings = props?.[category] || {};

  const form = useForm<FormData>({
    resolver: zodResolver<any>(formSchema),
    defaultValues: {
      reactionsAvailable: settings.reactionsAvailable || 'open',
      displayReactions: settings.displayReactions || false,
      title: settings.title || '',
      textEmptyInput: settings.textEmptyInput || '',
      textAboveInput: settings.textAboveInput || '',
      idNonActiveReactions: settings.idNonActiveReactions || '',
    },
  });

  // Push the whole reaction object into the draft on any change.
  useEffect(() => {
    const subscription = form.watch((values) => {
      props.onFieldChanged?.(category, values);
    });
    return () => subscription.unsubscribe();
  }, [form, props]);

  return (
    <div className="p-6 bg-white rounded-md">
      <Form {...form}>
        <Heading size="xl" className="mb-4">
          Reacties
        </Heading>
        <Separator className="mb-4" />
        <form className="grid grid-cols-1 lg:grid-cols-2 gap-4 lg:w-1/2">
          <FormField
            control={form.control}
            name="displayReactions"
            render={({ field }) => (
              <FormItem className="col-span-full">
                <FormLabel>Weergave</FormLabel>
                <Select
                  onValueChange={(e: string) => field.onChange(e === 'true')}
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
            name="title"
            render={({ field }) => (
              <FormItem>
                <FormLabel>Titel boven de reacties</FormLabel>
                <FormControl>
                  <Input {...field} />
                </FormControl>
                <FormMessage />
              </FormItem>
            )}
          />
          <FormField
            control={form.control}
            name="textEmptyInput"
            render={({ field }) => (
              <FormItem>
                <FormLabel>Tekst in lege inputveld</FormLabel>
                <FormControl>
                  <Input {...field} />
                </FormControl>
                <FormMessage />
              </FormItem>
            )}
          />
          <FormField
            control={form.control}
            name="textAboveInput"
            render={({ field }) => (
              <FormItem>
                <FormLabel>Tekst boven inputveld</FormLabel>
                <FormControl>
                  <Input {...field} />
                </FormControl>
                <FormMessage />
              </FormItem>
            )}
          />
          <FormField
            control={form.control}
            name="idNonActiveReactions"
            render={({ field }) => (
              <FormItem className="col-span-full">
                <FormLabel>
                  IDs van resources waar reacties niet actief voor zijn.
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
            name="reactionsAvailable"
            render={({ field }) => (
              <FormItem>
                <FormLabel>Reacties staan...</FormLabel>
                <Select onValueChange={field.onChange} value={field.value}>
                  <FormControl>
                    <SelectTrigger>
                      <SelectValue placeholder="... open voor alle resources" />
                    </SelectTrigger>
                  </FormControl>
                  <SelectContent>
                    <SelectItem value="open">
                      ... open voor alle resources.
                    </SelectItem>
                    <SelectItem value="closed">
                      ... gesloten voor alle resources.
                    </SelectItem>
                    <SelectItem value="limited">
                      ... open voor sommige resources.
                    </SelectItem>
                  </SelectContent>
                </Select>
                <FormMessage />
              </FormItem>
            )}
          />
        </form>
      </Form>
    </div>
  );
}
