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
import { YesNoSelect } from '@/lib/form-widget-helpers';
import { EditFieldProps } from '@/lib/form-widget-helpers/EditFieldProps';
import { zodResolver } from '@hookform/resolvers/zod';
import { StemBegrootWidgetProps } from '@openstad-headless/stem-begroot/src/stem-begroot';
import { useForm } from 'react-hook-form';
import * as z from 'zod';

// Defines the types allowed to go to the frontend
const SortingTypes = [
  {
    value: "title",
    label: "Titel"
  },
  {
    value: "createdAt_desc",
    label: "Nieuwste eerst"
  },
  {
    value: "createdAt_asc",
    label: "Oudste eerst"
  },
  {
    value: "votes_desc",
    label: "Meeste stemmen"
  },
  {
    value: "votes_asc",
    label: "Minste stemmen"
  },
  // {
  //   value: "comments_desc",
  //   label: "Meeste reacties"
  // },
  // {
  //   value: "comments_asc",
  //   label: "Minste reacties"
  // },
  {
    value: "ranking",
    label: "Ranglijst"
  },
  {
    value: "random",
    label: "Willekeurig"
  }
];

const formSchema = z.object({
  displaySorting: z.boolean(),
  defaultSorting: z.string(),
  sorting: z
    .array(z.object({ value: z.string(), label: z.string() }))
    .refine((value) => value.some((item) => item), {
      message: 'You have to select at least one item.',
    }),
});

export default function WidgetStemBegrootSorting(
  props: StemBegrootWidgetProps &
    EditFieldProps<StemBegrootWidgetProps>
) {
  type FormData = z.infer<typeof formSchema>;

  async function onSubmit(values: FormData) {
    props.updateConfig({ ...props, ...values });
  }

  const form = useForm<FormData>({
    resolver: zodResolver<any>(formSchema),
    defaultValues: {
      displaySorting: props?.displaySorting || false,
      defaultSorting: props?.defaultSorting || 'random',
      sorting: props?.sorting || [],
    },
  });

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
                {YesNoSelect(field, props)}
                <FormMessage />
              </FormItem>
            )}
          />
          <FormField
            control={form.control}
            name="defaultSorting"
            render={({ field }) => (
              <FormItem>
                <FormLabel>Standaard manier van sorteren</FormLabel>
                <Select onValueChange={field.onChange} value={field.value}>
                  <FormControl>
                    <SelectTrigger>
                      <SelectValue placeholder="Nieuwste eerst" />
                    </SelectTrigger>
                  </FormControl>
                  <SelectContent>
                    {SortingTypes.map((sort) => (
                      <SelectItem
                        key={`sort-type-${sort.value}`}
                        value={sort.value}>
                        {sort.label}
                      </SelectItem>
                    ))}
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
                  {SortingTypes.map((item) => (
                    <FormField
                      key={item.value}
                      control={form.control}
                      name="sorting"
                      render={({ field }) => {
                        return (
                          <FormItem
                            key={item.value}
                            className="flex flex-row items-start space-x-3 space-y-0">
                            <FormControl>
                              <Checkbox
                                checked={
                                  field.value?.findIndex(
                                    (el) => el.value === item.value
                                  ) > -1
                                }
                                onCheckedChange={(checked: any) => {
                                  return checked
                                    ? field.onChange([
                                        ...field.value,
                                        {
                                          value: item.value,
                                          label: item.label,
                                        },
                                      ])
                                    : field.onChange(
                                        field.value?.filter(
                                          (val) => val.value !== item.value
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
