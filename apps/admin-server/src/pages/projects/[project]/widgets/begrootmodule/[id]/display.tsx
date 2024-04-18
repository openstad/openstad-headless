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
import { YesNoSelect } from '@/lib/form-widget-helpers';
import { EditFieldProps } from '@/lib/form-widget-helpers/EditFieldProps';
import { zodResolver } from '@hookform/resolvers/zod';
import { StemBegrootWidgetProps } from '@openstad-headless/stem-begroot/src/stem-begroot';
import { useForm } from 'react-hook-form';
import * as z from 'zod';
import InfoDialog from '@/components/ui/info-hover';
import { ObjectListSelect } from '@/components/ui/object-select';
import { FormObjectSelectField } from '@/components/ui/form-object-select-field';

const formSchema = z.object({
  displayRanking: z.boolean(),
  displayPriceLabel: z.boolean(),
  showVoteCount: z.boolean(),
  notEnoughBudgetText: z.string(),
  showOriginalResource: z.boolean(),
  originalResourceUrl: z.string().url(),
  resourceListColumns: z.coerce.number({
    invalid_type_error: 'Alleen volledige nummers kunnen worden ingevoerd',
  }),
});

type Formdata = z.infer<typeof formSchema>;

export default function BegrootmoduleDisplay(
  props: StemBegrootWidgetProps & EditFieldProps<StemBegrootWidgetProps>
) {
  const { onFieldChange } = useFieldDebounce(props.onFieldChanged);

  function onSubmit(values: Formdata) {
    props.updateConfig({ ...props, ...values });
  }

  const form = useForm<z.infer<typeof formSchema>>({
    resolver: zodResolver<any>(formSchema),
    defaultValues: {
      displayRanking: props.displayRanking || false,
      displayPriceLabel: props.displayPriceLabel || false,
      showVoteCount: props.showVoteCount || false,
      notEnoughBudgetText: props.notEnoughBudgetText || 'Niet genoeg budget',
      showOriginalResource: props.showOriginalResource || false,
      originalResourceUrl: props.originalResourceUrl || '',
      resourceListColumns: props.resourceListColumns || 3,
    },
  });

  return (
    <div className="p-6 bg-white rounded-md">
      <Form {...form}>
        <Heading size="xl">Weergave opties</Heading>
        <Separator className="my-4" />
        <form
          onSubmit={form.handleSubmit(onSubmit)}
          className="lg:w-fit grid grid-cols-1 lg:grid-cols-2 gap-4">
          <FormField
            control={form.control}
            name="displayRanking"
            render={({ field }) => (
              <FormItem className="col-span-1">
                <FormLabel>Weergeef de ranking</FormLabel>
                {YesNoSelect(field, props)}
                <FormMessage />
              </FormItem>
            )}
          />
          <FormField
            control={form.control}
            name="displayPriceLabel"
            render={({ field }) => (
              <FormItem className="col-span-1">
                <FormLabel>Weergeef de prijslabel</FormLabel>
                {YesNoSelect(field, props)}
                <FormMessage />
              </FormItem>
            )}
          />
          <FormField
            control={form.control}
            name="showVoteCount"
            render={({ field }) => (
              <FormItem className="col-span-1">
                <FormLabel>Weergeef de hoeveelheid stemmen</FormLabel>
                {YesNoSelect(field, props)}
                <FormMessage />
              </FormItem>
            )}
          />
          <FormField
            control={form.control}
            name="notEnoughBudgetText"
            render={({ field }) => (
              <FormItem className="col-span-1">
                <FormLabel>Onbeschikbare buttons</FormLabel>
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
            name="showOriginalResource"
            render={({ field }) => (
              <FormItem className="col-span-1">
                <FormLabel>Display de URL van het originele resource</FormLabel>
                {YesNoSelect(field, props)}
                <FormMessage />
              </FormItem>
            )}
          />
          <FormField
            control={form.control}
            name="originalResourceUrl"
            render={({ field }) => (
              <FormItem className="col-span-1">
                <FormLabel>
                  URL waar het resource oorspronkelijk vandaan is gehaald
                  <InfoDialog content={'TODO'} />
                </FormLabel>
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

          <FormObjectSelectField
            form={form}
            fieldName="resourceListColumns"
            keyForValue="value"
            fieldLabel="Selecteer het maximaal aantal kolommen voor de resource lijst"
            onFieldChanged={(key, value) => {
              onFieldChange(key, value);
            }}
            items={[{ value: 1 }, { value: 2 }, { value: 3 }]}
          />

          <Button type="submit" className="w-fit col-span-full">
            Opslaan
          </Button>
        </form>
      </Form>
    </div>
  );
}
