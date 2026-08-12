import { Checkbox } from '@/components/ui/checkbox';
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
import { Textarea } from '@/components/ui/textarea';
import { Heading } from '@/components/ui/typography';
import { EditFieldProps } from '@/lib/form-widget-helpers/EditFieldProps';
import { zodResolver } from '@hookform/resolvers/zod';
import { useEffect } from 'react';
import { useForm } from 'react-hook-form';
import * as z from 'zod';

const selectableOptions = [
  {
    id: 'facebook',
    label: 'Facebook',
  },
  {
    id: 'twitter',
    label: 'Twitter',
  },
  {
    id: 'mail',
    label: 'E-mail',
  },
  {
    id: 'whatsapp',
    label: 'Whatsapp',
  },
];

const formSchema = z.object({
  template: z.string(),
  link: z.string().url(),
  displayShare: z.boolean(),
  selectableOptions: z.string().array(),
});

type FormData = z.infer<typeof formSchema>;

export default function WidgetMapDetails(
  props: { [key: string]: any } & EditFieldProps<any>
) {
  const category = 'details';
  const settings = props?.[category] || {};

  const form = useForm<FormData>({
    resolver: zodResolver<any>(formSchema),
    defaultValues: {
      template:
        settings.template ||
        '<span class="ocs-gray-text">Door </span>{username} <span class="ocs-gray-text"> op </span>{createDate} <span class="ocs-gray-text">&nbsp;&nbsp;|&nbsp;&nbsp;</span> <span class="ocs-gray-text">Thema: </span>{theme}',
      link: settings.link || '',
      displayShare: settings.displayShare || false,
      selectableOptions: settings.selectableOptions || [],
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
        <Heading size="xl">Resource details</Heading>
        <Separator className="my-4" />
        <form className="grid grid-cols-1 lg:grid-cols-2 gap-4 lg:w-fit">
          <FormField
            control={form.control}
            name="template"
            render={({ field }) => (
              <FormItem className="col-span-full">
                <FormLabel>Metadata regel template</FormLabel>
                <FormControl>
                  <Textarea {...field} />
                </FormControl>
                <FormMessage />
              </FormItem>
            )}
          />
          <FormField
            control={form.control}
            name="link"
            render={({ field }) => (
              <FormItem>
                <FormLabel>Link naar gebruikerspagina</FormLabel>
                <FormControl>
                  <Input {...field} />
                </FormControl>
                <FormMessage />
              </FormItem>
            )}
          />
          <FormField
            control={form.control}
            name="displayShare"
            render={({ field }) => (
              <FormItem>
                <FormLabel>
                  Worden de socialmedia deelknoppen weergegeven?
                </FormLabel>
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
            name="selectableOptions"
            render={() => (
              <FormItem className="col-span-full">
                <div>
                  <FormLabel>Selecteer uw gewenste deelopties</FormLabel>
                </div>
                {selectableOptions.map((item) => (
                  <FormField
                    key={item.id}
                    control={form.control}
                    name="selectableOptions"
                    render={({ field }) => {
                      return (
                        <FormItem
                          key={item.id}
                          className="flex flex-row items-start space-x-3 space-y-0">
                          <FormControl>
                            <Checkbox
                              checked={field.value?.includes(item.id)}
                              onCheckedChange={(checked: any) => {
                                return checked
                                  ? field.onChange([...field.value, item.id])
                                  : field.onChange(
                                      field.value?.filter(
                                        (value) => value !== item.id
                                      )
                                    );
                              }}
                            />
                          </FormControl>
                          <FormLabel className="font-normal">
                            {item.label}
                          </FormLabel>
                        </FormItem>
                      );
                    }}
                  />
                ))}
              </FormItem>
            )}
          />
        </form>
      </Form>
    </div>
  );
}
