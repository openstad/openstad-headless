import { Button } from '@/components/ui/button';
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
import { useWidgetConfig } from '@/hooks/use-widget-config';
import { zodResolver } from '@hookform/resolvers/zod';
import { useCallback, useEffect } from 'react';
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
    message: 'You have to select at least one item.',
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

export default function WidgetMapSort() {
  const category = 'sort';

  const {
    data: widget,
    isLoading: isLoadingWidget,
    updateConfig,
  } = useWidgetConfig();

  const defaults = useCallback(
    () => ({
      sorting: widget?.config?.[category]?.sorting || [],
      defaultSorting: widget?.config?.[category]?.defaultSorting || 'newest',
    }),
    [widget?.config]
  );

  async function onSubmit(values: FormData) {
    try {
      await updateConfig({ [category]: values });
    } catch (error) {
      console.error('could not update', error);
    }
  }

  const form = useForm<FormData>({
    resolver: zodResolver<any>(formSchema),
    defaultValues: defaults(),
  });

  useEffect(() => {
    form.reset(defaults());
  }, [form, defaults]);

  return (
    <div className="p-6 bg-white rounded-md">
      <Form {...form}>
        <Heading size="xl">Sorteren</Heading>
        <Separator className="my-4" />
        <form
          onSubmit={form.handleSubmit(onSubmit)}
          className="grid grid-cols-1 lg:grid-cols-2 gap-4 lg:w-fit">
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
          <Button type="submit" className="w-fit col-span-full">
            Opslaan
          </Button>
        </form>
      </Form>
    </div>
  );
}
