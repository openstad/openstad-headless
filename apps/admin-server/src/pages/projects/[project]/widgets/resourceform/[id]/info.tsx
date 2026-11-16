import { Button } from '@/components/ui/button';
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
import { useWidgetConfig } from '@/hooks/use-widget-config';
import { zodResolver } from '@hookform/resolvers/zod';
import * as Switch from '@radix-ui/react-switch';
import { useCallback, useEffect } from 'react';
import { useForm } from 'react-hook-form';
import * as z from 'zod';

const formSchema = z.object({
  allowAnonymousSubmissions: z.boolean(),
  nameInHeader: z.boolean(),
  loginText: z.string(),
  loginButtonText: z.string(),
  allowedEmailDomains: z.string().optional(),
  domainRestrictionMessage: z.string().optional(),
});

export default function WidgetResourceFormInfo() {
  type FormData = z.infer<typeof formSchema>;
  const category = 'info';

  // should use the passed props widget, this is the old way and is not advised
  const {
    data: widget,
    isLoading: isLoadingWidget,
    updateConfig,
  } = useWidgetConfig<any>();

  const defaults = useCallback(
    () => ({
      allowAnonymousSubmissions:
        widget?.config?.[category]?.allowAnonymousSubmissions || false,
      nameInHeader: widget?.config?.[category]?.nameInHeader || false,
      loginText: widget?.config?.[category]?.loginText || '',
      loginButtonText: widget?.config?.[category]?.loginButtonText || '',
      allowedEmailDomains:
        widget?.config?.[category]?.allowedEmailDomains || '',
      domainRestrictionMessage:
        widget?.config?.[category]?.domainRestrictionMessage || '',
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
        <Heading size="xl">Weergave</Heading>
        <Separator className="my-4" />
        <form
          onSubmit={form.handleSubmit(onSubmit)}
          className="lg:w-2/3 grid grid-cols-1 gap-4">
          <FormField
            control={form.control}
            name="allowAnonymousSubmissions"
            render={({ field }) => (
              <FormItem>
                <FormLabel>Mogen niet‑ingelogde gebruikers inzenden?</FormLabel>
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
            name="nameInHeader"
            render={({ field }) => (
              <FormItem>
                <FormLabel>
                  Wordt de gebruikersnaam weergegeven in de header van het
                  formulier?
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
            name="loginText"
            render={({ field }) => (
              <FormItem>
                <FormLabel>Login tekst</FormLabel>
                <FormControl>
                  <Input {...field} />
                </FormControl>
                <FormMessage />
              </FormItem>
            )}
          />
          <FormField
            control={form.control}
            name="loginButtonText"
            render={({ field }) => (
              <FormItem>
                <FormLabel>Login knoptekst</FormLabel>
                <FormControl>
                  <Input {...field} />
                </FormControl>
                <FormMessage />
              </FormItem>
            )}
          />
          <FormField
            control={form.control}
            name="allowedEmailDomains"
            render={({ field }) => (
              <FormItem>
                <FormLabel>Toegestane e-maildomeinen</FormLabel>
                <FormControl>
                  <Input {...field} placeholder="gemeente.nl, partner.nl" />
                </FormControl>
                <FormDescription>
                  Als dit veld is ingevuld, kunnen alleen gebruikers die zijn
                  ingelogd met een e-mailadres op een van deze domeinen het
                  formulier invullen. Inloggen is dan altijd verplicht. Meerdere
                  domeinen scheid je met een komma. Vul alleen het domein in,
                  zonder @ (bijvoorbeeld gemeente.nl). Laat leeg om geen
                  beperking toe te passen.
                </FormDescription>
                <FormMessage />
              </FormItem>
            )}
          />
          <FormField
            control={form.control}
            name="domainRestrictionMessage"
            render={({ field }) => (
              <FormItem>
                <FormLabel>Melding bij geen toegang</FormLabel>
                <FormControl>
                  <Input
                    {...field}
                    placeholder="U heeft geen toegang tot dit formulier."
                  />
                </FormControl>
                <FormDescription>
                  Wordt getoond aan ingelogde gebruikers die niet aan de
                  domeinbeperking voldoen. Leeg = standaardtekst.
                </FormDescription>
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
