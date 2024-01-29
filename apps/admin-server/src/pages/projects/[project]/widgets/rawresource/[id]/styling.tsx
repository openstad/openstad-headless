import { Button } from '@/components/ui/button';
import { Checkbox } from '@/components/ui/checkbox';
import {
  Form,
  FormControl,
  FormField,
  FormItem,
  FormLabel,
} from '@/components/ui/form';
import { Separator } from '@/components/ui/separator';
import { Heading } from '@/components/ui/typography';
import { EditFieldProps } from '@/lib/form-widget-helpers/EditFieldProps';
import { zodResolver } from '@hookform/resolvers/zod';
import { RawResourceWidgetProps } from '@openstad/raw-resource/src/raw-resource';
import { useForm } from 'react-hook-form';
import * as z from 'zod';

const categorizedChoices = {
  Spacing: [
    { label: 'Margin top 0', value: 'mt-0' },
    { label: 'Margin bottom 0', value: 'mb-0' },
    { label: 'Margin top and bottom s', value: 'my-2' },
    { label: 'Margin top and bottom m', value: 'my-4' },
    { label: 'Margin top and bottom lg', value: 'my-6' },
    { label: 'Padding full s', value: 'p-2' },
    { label: 'Padding full m', value: 'p-4' },
    { label: 'Padding full lg', value: 'p-6' },
    { label: 'Padding top and bottom s', value: 'py-2' },
    { label: 'Padding top and bottom m', value: 'py-4' },
    { label: 'Padding top and bottom lg', value: 'py-6' },
  ],
  Layout: [
    { label: 'Display block', value: 'block' },
    { label: 'Display flex', value: 'flex' },
    {
      label: 'Center items (needs display flex & (max) width)',
      value: 'justify-center items-center',
    },
    { label: 'Center container (needs (max) width)', value: 'mx-auto my-auto' },
    { label: 'Text align left', value: 'text-left' },
    { label: 'Text align center', value: 'text-center' },
    { label: 'Text align right', value: 'text-right' },
  ],

  Box: [
    { label: 'Rounded corners xs', value: 'rounded-xs' },
    { label: 'Rounded corners sm', value: 'rounded-sm' },
    { label: 'Rounded corners md', value: 'rounded-md' },
    { label: 'Rounded corners lg', value: 'rounded-lg' },
    { label: 'Rounded corners full', value: 'rounded-full' },
    { label: 'Border thin grey', value: 'border-2 border-grey' },
    { label: 'Border thin blue', value: 'border-2 border-blue' },
    { label: 'Border thin black', value: 'border-2 border-black' },
    { label: 'Box shadow s', value: 'shadow-sm' },
    { label: 'Box shadow m', value: 'shadow-md' },
  ],
  Typografie: [
    { label: 'Font italic', value: 'italic' },
    { label: 'Font bold', value: 'font-bold' },
    { label: 'Text underline', value: 'underline' },
    { label: 'Font size xs', value: 'text-xs' },
    { label: 'Font size s', value: 'text-sm' },
    { label: 'Font size m', value: 'text-md' },
    { label: 'Font size lg', value: 'text-lg' },
    { label: 'Font size xl', value: 'text-xl' },
    { label: 'Text color white', value: 'text-white' },
    { label: 'Text color black', value: 'text-black' },
  ],
  Sizing: [
    { label: 'Max width sm', value: 'max-w-sm' },
    { label: 'Max width md', value: 'max-w-md' },
    { label: 'Max width lg', value: 'max-w-lg' },
    { label: 'Max width xl', value: 'max-w-xl' },
    { label: 'Max width 2xl', value: 'max-w-2xl' },
  ],
  Overig: [{ label: 'Overflow hidden', value: 'overflow-hidden' }],
};

const formSchema = z.object({
  stylingClasses: z.array(
    z.object({
      label: z.string(),
      value: z.string(),
    })
  ),
});

export default function WidgetRawStylingClasses(
  props: RawResourceWidgetProps & EditFieldProps<RawResourceWidgetProps>
) {
  type FormData = z.infer<typeof formSchema>;

  async function onSubmit(values: FormData) {
    props.updateConfig({ ...props, ...values });
  }

  const form = useForm<FormData>({
    resolver: zodResolver<any>(formSchema),
    defaultValues: {
      stylingClasses: props.stylingClasses || [],
    },
  });

  return (
    <div className="p-6 bg-white rounded-md">
      <Form {...form}>
        <Heading size="xl">Styling classes</Heading>
        <Separator className="my-4" />
        <form
          onSubmit={form.handleSubmit(onSubmit)}
          className="lg:w-3/4 grid grid-cols-1 lg:grid-cols-2 gap-4">
          {Object.entries(categorizedChoices).map(([category, choices]) => (
            <div key={category} className="flex flex-col gap-2">
              <h3>{category}</h3>
              {choices.map((choice) => (
                <FormField
                  key={choice.value}
                  control={form.control}
                  name="stylingClasses"
                  render={({ field }) => {
                    // Ensure field.value is an array
                    const fieldValue = Array.isArray(field.value)
                      ? field.value
                      : [];

                    return (
                      <FormItem
                        key={choice.value}
                        className="flex flex-row items-center space-x-3 space-y-0">
                        <FormControl>
                          <Checkbox
                            checked={
                              fieldValue.findIndex(
                                (el) => el.value === choice.value
                              ) > -1
                            }
                            onCheckedChange={(checked) => {
                              if (checked) {
                                field.onChange([
                                  ...fieldValue,
                                  {
                                    label: choice.label,
                                    value: choice.value,
                                  },
                                ]);
                                props.onFieldChanged(field.name, [
                                  ...fieldValue,
                                  {
                                    label: choice.label,
                                    value: choice.value,
                                  },
                                ]);
                              } else {
                                field.onChange(
                                  fieldValue.filter(
                                    (el) => el.value !== choice.value
                                  )
                                );
                                props.onFieldChanged(
                                  field.name,
                                  fieldValue.filter(
                                    (el) => el.value !== choice.value
                                  )
                                );
                              }
                            }}
                          />
                        </FormControl>
                        <FormLabel className="font-normal">
                          {choice.label}
                        </FormLabel>
                      </FormItem>
                    );
                  }}
                />
              ))}
            </div>
          ))}

          <Button className="w-fit col-span-full" type="submit">
            Opslaan
          </Button>
        </form>
      </Form>
    </div>
  );
}
