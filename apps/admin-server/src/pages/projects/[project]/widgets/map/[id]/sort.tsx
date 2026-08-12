import { Checkbox } from '@/components/ui/checkbox';
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
import { EditFieldProps } from '@/lib/form-widget-helpers/EditFieldProps';
import { zodResolver } from '@hookform/resolvers/zod';
import { useEffect } from 'react';
import { useForm } from 'react-hook-form';
import * as z from 'zod';

const sorting = [
  {
    id: 'newest',
    label: 'Nieuwste eerst',
  },
  {
    id: 'oldest',
    label: 'Oudste eerst',
  },
  {
    id: 'title',
    label: 'Titel',
  },
  {
    id: 'random',
    label: 'Willekeurig',
  },
  {
    id: 'mostLikes',
    label: 'Meeste likes',
  },
  {
    id: 'leastLikes',
    label: 'Minste likes',
  },
  {
    id: 'mostReactions',
    label: 'Meeste reacties',
  },
  {
    id: 'leastReactions',
    label: 'Minste reacties',
  },
  {
    id: 'ranked',
    label: 'Ranglijst',
  },
];

const formSchema = z.object({
  sorting: z.array(z.string()).refine((value) => value.some((item) => item), {
    message: 'Je moet minimaal één item selecteren.',
  }),
  defaultSorting: z.enum([
    'newest',
    'oldest',
    'title',
    'random',
    'mostLikes',
    'leastLikes',
    'mostReactions',
    'leastReactions',
    'ranked',
  ]),
});

type FormData = z.infer<typeof formSchema>;

export default function WidgetMapSort(
  props: { [key: string]: any } & EditFieldProps<any>
) {
  const category = 'sort';
  const settings = props?.[category] || {};

  const form = useForm<FormData>({
    resolver: zodResolver<any>(formSchema),
    defaultValues: {
      sorting: settings.sorting || [],
      defaultSorting: settings.defaultSorting || 'newest',
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
        <Heading size="xl">Sorteren</Heading>
        <Separator className="my-4" />
        <form className="grid grid-cols-1 lg:grid-cols-2 gap-4 lg:w-fit">
          <FormField
            control={form.control}
            name="sorting"
            render={() => (
              <FormItem className="col-span-full">
                <div>
                  <FormLabel>Selecteer uw gewenste sorteeropties</FormLabel>
                </div>
                <div className="grid grid-cols-1 lg:grid-cols-2 gap-y-2 gap-x-4">
                  {sorting.map((item) => (
                    <FormField
                      key={item.id}
                      control={form.control}
                      name="sorting"
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
                </div>
              </FormItem>
            )}
          />
          <FormField
            control={form.control}
            name="defaultSorting"
            render={({ field }) => (
              <FormItem>
                <FormLabel>
                  Selecteer de standaard manier van sorteren.
                </FormLabel>
                <Select onValueChange={field.onChange} value={field.value}>
                  <FormControl>
                    <SelectTrigger>
                      <SelectValue placeholder="Nieuwste eerst" />
                    </SelectTrigger>
                  </FormControl>
                  <SelectContent>
                    <SelectItem value="newest">Nieuwste eerst</SelectItem>
                    <SelectItem value="oldest">Oudste eerst</SelectItem>
                    <SelectItem value="title">Titel</SelectItem>
                    <SelectItem value="random">Willekeurig</SelectItem>
                    <SelectItem value="mostLikes">Meeste likes</SelectItem>
                    <SelectItem value="leastLikes">Minste likes</SelectItem>
                    <SelectItem value="mostReactions">
                      Meeste reacties
                    </SelectItem>
                    <SelectItem value="leastReactions">
                      Minste reacties
                    </SelectItem>
                    <SelectItem value="ranked">Ranglijst</SelectItem>
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
