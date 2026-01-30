import { Button } from '@/components/ui/button';
import {
  Form,
  FormControl, FormDescription,
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
import { useWidgetConfig } from '@/hooks/use-widget-config';
import { zodResolver } from '@hookform/resolvers/zod';
import { useCallback, useEffect } from 'react';
import { useForm } from 'react-hook-form';
import * as z from 'zod';
import * as Switch from '@radix-ui/react-switch';

const formSchema = z.object({
  resource: z.enum([
    'resource',
    'article',
    'activeUser',
    'resourceUser',
    'submission',
  ]),
  formName: z.string(),
  redirectUrl: z.preprocess(
    (val) => (typeof val === 'string' && val.trim() === '' ? undefined : val),
    z.string().refine(
      (value) => /^(\/[^\s]*)|(https?:\/\/[^\s]*)$/i.test(value),
      { message: "Must be a valid URL or a relative path" }
    ).optional()
  ),
  hideAdmin: z.boolean(),
  minCharactersWarning: z.string().optional().default("Nog minimaal {minCharacters} tekens"),
  maxCharactersWarning: z.string().optional().default("Je hebt nog {maxCharacters} tekens over"),
  maxCharactersOverWarning: z.string().optional().default("Je hebt {overCharacters} tekens teveel"),
  minCharactersError: z.string().optional().default("Tekst moet minimaal {minCharacters} karakters bevatten"),
  maxCharactersError: z.string().optional().default("Tekst moet maximaal {maxCharacters} karakters bevatten"),
  showMinMaxAfterBlur: z.boolean().optional().default(false),
});

type FormData = z.infer<typeof formSchema>;
export default function WidgetResourceFormGeneral() {
  const category = 'general';

  // should use the passed props widget, this is the old way and is not advised
  const {
    data: widget,
    isLoading: isLoadingWidget,
    updateConfig,
  } = useWidgetConfig<any>();

  const defaults = useCallback(
    () => ({
      resource: widget?.config?.[category]?.resource || 'resource',
      formName: widget?.config?.[category]?.formName || '',
      redirectUrl: widget?.config?.[category]?.redirectUrl || '',
      hideAdmin: widget?.config?.[category]?.hideAdmin || false,
      minCharactersWarning: widget?.config?.[category]?.minCharactersWarning || 'Nog minimaal {minCharacters} tekens',
      maxCharactersWarning: widget?.config?.[category]?.maxCharactersWarning || 'Je hebt nog {maxCharacters} tekens over',
      maxCharactersOverWarning: widget?.config?.[category]?.maxCharactersOverWarning || 'Je hebt {overCharacters} tekens teveel',
      minCharactersError: widget?.config?.[category]?.minCharactersError || 'Tekst moet minimaal {minCharacters} karakters bevatten',
      maxCharactersError: widget?.config?.[category]?.maxCharactersError || 'Tekst moet maximaal {maxCharacters} karakters bevatten',
      showMinMaxAfterBlur: widget?.config?.[category]?.showMinMaxAfterBlur || false,
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
        <Heading size="xl">Algemeen</Heading>
        <Separator className="my-4" />
        <form
          onSubmit={form.handleSubmit(onSubmit)}
          className="lg:w-3/4 grid grid-cols-1 lg:grid-cols-2 gap-6">
          <FormField
            control={form.control}
            name="resource"
            render={({ field }) => (
              <FormItem>
                <FormLabel>Soort inzending (vanuit de configuratie)</FormLabel>
                <Select onValueChange={field.onChange} value={field.value}>
                  <FormControl>
                    <SelectTrigger>
                      <SelectValue placeholder="Resource" />
                    </SelectTrigger>
                  </FormControl>
                  <SelectContent>
                    <SelectItem value="resource">Inzending</SelectItem>
                    <SelectItem value="article">Artikel</SelectItem>
                    <SelectItem value="activeUser">
                      Actieve gebruiker
                    </SelectItem>
                    <SelectItem value="resourceUser">
                      Gebruiker van de inzending
                    </SelectItem>
                    <SelectItem value="submission">Oplevering</SelectItem>
                  </SelectContent>
                </Select>
                <FormMessage />
              </FormItem>
            )}
          />
          <FormField
            control={form.control}
            name="formName"
            render={({ field }) => (
              <FormItem>
                <FormLabel>
                  Naam formulier
                </FormLabel>
                <em className='text-xs'>Deze moet uniek zijn binnen dit project.</em>
                <FormControl>
                  <Input {...field} />
                </FormControl>
                <FormMessage />
              </FormItem>
            )}
          />
          <FormField
            control={form.control}
            name="redirectUrl"
            render={({ field }) => (
              <FormItem className="col-span-full">
                <FormLabel>
                  Naar welke URL moet de gebruiker geleid worden na het invullen van het formulier?
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
            name="hideAdmin"
            render={({ field }) => (
              <FormItem>
                <FormLabel>
                  Wordt de admin verborgen van het project na de eerste publieke
                  actie?
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
                <Input
                  {...field}
                />
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
                <Input
                  {...field}
                />
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
                <Input
                  {...field}
                />
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
                <Input
                  {...field}
                />
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
                <Input
                  {...field}
                />
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

          <Button className="w-fit col-span-full" type="submit">
            Opslaan
          </Button>
        </form>
      </Form>
    </div>
  );
}
