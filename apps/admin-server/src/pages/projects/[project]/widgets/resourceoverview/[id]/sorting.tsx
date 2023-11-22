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
    id: 'highestCost',
    label: 'Meeste reacties',
  },
  {
    id: 'lowestCost',
    label: 'Minste reacties',
  },
];

const formSchema = z.object({
  displaySorting: z.boolean(),
  defaultSorting: z.enum([
    'newest',
    'oldest',
    'random',
    'mostLikes',
    'leastLikes',
    'highestCost',
    'lowestCost',
  ]),
  sorting: z.array(z.string()).refine((value) => value.some((item) => item), {
    message: 'You have to select at least one item.',
  }),
});

export default function WidgetResourceOverviewSorting() {
  type FormData = z.infer<typeof formSchema>;
  const category = 'sorting';

  const {
    data: widget,
    isLoading: isLoadingWidget,
    updateConfig,
  } = useWidgetConfig();

  const defaults = () => ({
    displaySorting: widget?.config?.[category]?.displaySorting || false,
    defaultSorting: widget?.config?.[category]?.defaultSorting || 'newest',
    sorting: widget?.config?.[category]?.sorting || [],
  });

  async function onSubmit(values: FormData) {
    try {
      await updateConfig({ [category]: values });
    } catch (error) {
      console.error('could falset update', error);
    }
  }

  const form = useForm<FormData>({
    resolver: zodResolver<any>(formSchema),
    defaultValues: defaults(),
  });

  useEffect(() => {
    form.reset(defaults());
  }, [widget]);

  return (
    <div className="p-6 bg-white rounded-md">
      <Form {...form}>
        <Heading size="xl">Sorteren</Heading>
        <Separator className="my-4" />
        <form
          onSubmit={form.handleSubmit(onSubmit)}
          className="lg:w-1/2 grid grid-cols-1 lg:grid-cols-1 lg:grid-cols-2 gap-4">
          <FormField
            control={form.control}
            name="displaySorting"
            render={({ field }) => (
              <FormItem>
                <FormLabel>Sorteeropties weergeven</FormLabel>
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
                    <SelectItem value="random">Willekeurig</SelectItem>
                    <SelectItem value="mostLikes">Meeste likes</SelectItem>
                    <SelectItem value="leastLikes">Minste likes</SelectItem>
                    <SelectItem value="highestCost">Hoogste bedrag</SelectItem>
                    <SelectItem value="lowestCost">Laagste bedrag</SelectItem>
                  </SelectContent>
                </Select>
                <FormMessage />
              </FormItem>
            )}
          />
          <FormField
            control={form.control}
            name="sorting"
            render={() => (
              <FormItem className="col-span-full">
                <div>
                  <FormLabel>Selecteer uw gewenste sorteeropties</FormLabel>
                </div>
                <div className="grid grid-cols-1 lg:grid-cols-1 lg:grid-cols-2 gap-x-4 gap-y-2">
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
          <Button className="w-fit col-span-full" type="submit">
            Opslaan
          </Button>
        </form>
      </Form>
    </div>
  );
}
