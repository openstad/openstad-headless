import { Button } from '@/components/ui/button';
import {
  Form,
  FormControl,
  FormField,
  FormItem,
  FormLabel,
  FormMessage,
} from '@/components/ui/form';
import { Input } from '@/components/ui/input';
import { Separator } from '@/components/ui/separator';
import { Heading } from '@/components/ui/typography';
import { useFieldDebounce } from '@/hooks/useFieldDebounce';
import { EditFieldProps } from '@/lib/form-widget-helpers/EditFieldProps';
import { zodResolver } from '@hookform/resolvers/zod';
import { StemBegrootWidgetProps } from '@openstad/stem-begroot/src/stem-begroot';
import { useForm } from 'react-hook-form';
import * as z from 'zod';

// allowVoting: z.boolean(),
// votingType: z.enum([
//   'budgeting',
//   'budgetingPerTheme',
//   'count',
//   'countPerTheme',
// ]),
// maximumSelectableResources: z.coerce
//   .number()
//   .gt(0, 'Nummer moet groter zijn dan 0'),
// minimumSelectableResources: z.coerce
//   .number()
//   .gte(0, 'Nummer moet groter of gelijk zijn aan 0'),
// budget: z.coerce.number().gt(0, 'Nummer moet groter zijn dan 0'),
// minimumBudget: z.coerce.number().gt(0, 'Nummer moet groter zijn dan 0'),


const formSchema = z.object({
  budget: z.coerce.number().gt(0, 'Nummer moet groter zijn dan 0'),
  minimumBudget: z.coerce.number().gt(0, 'Nummer moet groter zijn dan 0'),
});

type Formdata = z.infer<typeof formSchema>;

export default function BegrootmoduleVoting(
  props: StemBegrootWidgetProps & EditFieldProps<StemBegrootWidgetProps>
) {
  const { onFieldChange } = useFieldDebounce(props.onFieldChanged);

  function onSubmit(values: Formdata) {
    props.updateConfig({ ...props, ...values });
  }

  const form = useForm<z.infer<typeof formSchema>>({
    resolver: zodResolver<any>(formSchema),
    defaultValues: {
      minBudget: props?.votes?.minBudget || 0,
      maxBudget: props?.votes?.maxBudget || 0,
    },
  });

  return (
    <Form {...form} className="p-6 bg-white rounded-md">
      <Heading size="xl">Stem opties</Heading>
      <Separator className="my-4" />
      <form
        onSubmit={form.handleSubmit(onSubmit)}
        className="lg:w-fit grid grid-cols-1 lg:grid-cols-2 gap-4">
        <FormField
          control={form.control}
          name="minBudget"
          render={({ field }) => (
            <FormItem className="col-span-1">
              <FormLabel>Minimum budget om te selecteren</FormLabel>
              <FormControl>
                <Input
                  type="number"
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
          name="maxBudget"
          render={({ field }) => (
            <FormItem className="col-span-1">
              <FormLabel>Beschikbaar budget</FormLabel>
              <FormControl>
                <Input
                  type="number"
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
        <Button type="submit" className="w-fit col-span-full">
          Opslaan
        </Button>
      </form>
    </Form>
  );
}
