import {
  Form,
  FormControl,
  FormDescription,
  FormField,
  FormItem,
  FormLabel,
  FormMessage,
} from '@/components/ui/form';
import { Input } from '@/components/ui/input';
import { Separator } from '@/components/ui/separator';
import { Heading } from '@/components/ui/typography';
import { EditFieldProps } from '@/lib/form-widget-helpers/EditFieldProps';
import { zodResolver } from '@hookform/resolvers/zod';
import { ResourceFormWidgetProps } from '@openstad-headless/resource-form/src/props';
import * as Switch from '@radix-ui/react-switch';
import { useEffect } from 'react';
import { useForm } from 'react-hook-form';
import * as z from 'zod';

const formSchema = z.object({
  redirectUrl: z.preprocess(
    (val) => (typeof val === 'string' && val.trim() === '' ? undefined : val),
    z
      .string()
      .refine((value) => /^(\/[^\s]*)|(https?:\/\/[^\s]*)$/i.test(value), {
        message: 'Must be a valid URL or a relative path',
      })
      .optional()
  ),
  minCharactersWarning: z
    .string()
    .optional()
    .default('Nog minimaal {minCharacters} tekens'),
  maxCharactersWarning: z
    .string()
    .optional()
    .default('Je hebt nog {maxCharacters} tekens over'),
  minCharactersError: z
    .string()
    .optional()
    .default('Tekst moet minimaal {minCharacters} karakters bevatten'),
  maxCharactersError: z
    .string()
    .optional()
    .default('Tekst moet maximaal {maxCharacters} karakters bevatten'),
  showMinMaxAfterBlur: z.boolean().optional().default(false),
  maxCharactersOverWarning: z
    .string()
    .optional()
    .default('Je hebt {overCharacters} tekens teveel'),
});

type FormData = z.infer<typeof formSchema>;
export default function WidgetResourceFormGeneral(
  props: ResourceFormWidgetProps & EditFieldProps<ResourceFormWidgetProps>
) {
  const category = 'general';

  const general = (props as any)[category] || {};

  const form = useForm<FormData>({
    resolver: zodResolver<any>(formSchema),
    defaultValues: {
      redirectUrl: general.redirectUrl || '',
      minCharactersWarning:
        general.minCharactersWarning || 'Nog minimaal {minCharacters} tekens',
      maxCharactersWarning:
        general.maxCharactersWarning ||
        'Je hebt nog {maxCharacters} tekens over',
      minCharactersError:
        general.minCharactersError ||
        'Tekst moet minimaal {minCharacters} karakters bevatten',
      maxCharactersError:
        general.maxCharactersError ||
        'Tekst moet maximaal {maxCharacters} karakters bevatten',
      showMinMaxAfterBlur: general.showMinMaxAfterBlur || false,
      maxCharactersOverWarning:
        general.maxCharactersOverWarning ||
        'Je hebt {overCharacters} tekens teveel',
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
        <Heading size="xl">Algemeen</Heading>
        <Separator className="my-4" />
        <form className="lg:w-3/4 grid grid-cols-1 lg:grid-cols-2 gap-6">
          <FormField
            control={form.control}
            name="redirectUrl"
            render={({ field }) => (
              <FormItem className="col-span-full">
                <FormLabel>
                  Naar welke URL moet de gebruiker geleid worden na het invullen
                  van het formulier?
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
            name="minCharactersWarning"
            render={({ field }) => (
              <FormItem>
                <FormLabel>
                  Waarschuwing voor minimaal aantal karakters
                </FormLabel>
                <FormDescription>
                  {`Dit is de tekst die getoond wordt als het aantal karakters onder de minimum waarde ligt. Gebruik {minCharacters} zodat het aantal karakters automatisch wordt ingevuld.`}
                </FormDescription>
                <Input {...field} />
                <FormMessage />
              </FormItem>
            )}
          />

          <FormField
            control={form.control}
            name="maxCharactersWarning"
            render={({ field }) => (
              <FormItem>
                <FormLabel>
                  Waarschuwing voor maximaal aantal karakters
                </FormLabel>
                <FormDescription>
                  {`Dit is de tekst die getoond wordt als het aantal karakters boven de maximum waarde ligt. Gebruik {maxCharacters} zodat het aantal karakters automatisch wordt ingevuld.`}
                </FormDescription>
                <Input {...field} />
                <FormMessage />
              </FormItem>
            )}
          />

          <FormField
            control={form.control}
            name="maxCharactersOverWarning"
            render={({ field }) => (
              <FormItem>
                <FormLabel>
                  Waarschuwing bij overschrijden maximaal aantal karakters
                </FormLabel>
                <FormDescription>
                  {`Dit is de tekst die getoond wordt als het aantal karakters over de maximum waarde heen gaat. Gebruik {overCharacters} zodat het aantal karakters automatisch wordt ingevuld.`}
                </FormDescription>
                <Input {...field} />
                <FormMessage />
              </FormItem>
            )}
          />

          <FormField
            control={form.control}
            name="minCharactersError"
            render={({ field }) => (
              <FormItem>
                <FormLabel>
                  Foutmelding voor minimaal aantal karakters
                </FormLabel>
                <FormDescription>
                  {`Dit is de tekst van de foutmelding die getoond wordt als het aantal karakters onder de minimum waarde ligt na het versturen van het formulier. Gebruik {minCharacters} zodat het aantal karakters automatisch wordt ingevuld.`}
                </FormDescription>
                <Input {...field} />
                <FormMessage />
              </FormItem>
            )}
          />

          <FormField
            control={form.control}
            name="maxCharactersError"
            render={({ field }) => (
              <FormItem>
                <FormLabel>
                  Foutmelding voor maximaal aantal karakters
                </FormLabel>
                <FormDescription>
                  {`Dit is de tekst van de foutmelding die getoond wordt als het aantal karakters boven de maximum waarde ligt na het versturen van het formulier. Gebruik {maxCharacters} zodat het aantal karakters automatisch wordt ingevuld.`}
                </FormDescription>
                <Input {...field} />
                <FormMessage />
              </FormItem>
            )}
          />

          <FormField
            control={form.control}
            name="showMinMaxAfterBlur"
            render={({ field }) => (
              <FormItem>
                <FormLabel>
                  Toon min/max waarschuwing na verlaten van het veld
                </FormLabel>

                <Switch.Root
                  className="block w-[50px] h-[25px] bg-stone-300 rounded-full relative focus:shadow-[0_0_0_2px] focus:shadow-black data-[state=checked]:bg-primary outline-none cursor-default"
                  onCheckedChange={(e: boolean) => {
                    field.onChange(e);
                  }}
                  checked={field.value}>
                  <Switch.Thumb className="block w-[21px] h-[21px] bg-white rounded-full transition-transform duration-100 translate-x-0.5 will-change-transform data-[state=checked]:translate-x-[27px]" />
                </Switch.Root>

                <FormMessage />
              </FormItem>
            )}
          />
        </form>
      </Form>
    </div>
  );
}
