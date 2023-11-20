import {
  Form,
  FormControl,
  FormField,
  FormItem,
  FormLabel,
  FormMessage,
} from '@/components/ui/form';
import { zodResolver } from '@hookform/resolvers/zod';
import { useForm } from 'react-hook-form';
import * as z from 'zod';
import { Textarea } from '@/components/ui/textarea';
import { Input } from '@/components/ui/input';
import {
  Select,
  SelectContent,
  SelectItem,
  SelectTrigger,
  SelectValue,
} from '@/components/ui/select';
import { Heading } from '@/components/ui/typography';
import { Separator } from '@/components/ui/separator';
import { Button } from '@/components/ui/button';
import { useWidgetConfig } from '@/hooks/use-widget-config';
import { useEffect } from 'react';

const formSchema = z.object({
  step1: z.string(),
  step2: z.string(),
  step3: z.string(),
  step3success: z.string(),
  voteMessage: z.string(),
  thankMessage: z.string(),
  showNewsletterButton: z.boolean(),
});

export default function BegrootmoduleExplanation() {
  const category = 'explanations';

  const {
    data: widget,
    isLoading: isLoadingWidget,
    updateConfig,
  } = useWidgetConfig();

  const defaults = () => ({
    step1:
      widget?.config?.[category]?.step1 ||
      'Kies uit onderstaand overzicht jouw favoriete plannen. Selecteer voor maximaal € 200.000 aan plannen. In stap 3 vul je ter controle de stemcode in die je per post hebt ontvangen. Tot slot verstuur je in stap 4 je stem.',
    step2:
      widget?.config?.[category]?.step2 ||
      'Bekijk hieronder je selectie. Ben je tevreden? Klik dan onderaan door naar stap 3 om jouw stemcode in te vullen.',
    step3:
      widget?.config?.[category]?.step3 ||
      'Via onderstaande knop kun je op een aparte pagina je persoonlijke stemcode invullen. Wij controleren de stemcode op geldigheid. Als dat gelukt is kom je terug op deze pagina waarna je kunt stemmen. Alle bewoners van Centrum hebben per post een stemcode ontvangen.',
    step3success:
      widget?.config?.[category]?.step3success ||
      'Het controleren van je stemcode is gelukt! Je bent bijna klaar. Klik op onderstaande knop om je stem te versturen.',
    voteMessage:
      widget?.config?.[category]?.voteMessage || 'Gelukt, je hebt gestemd!',
    thankMessage:
      widget?.config?.[category]?.thankMessage ||
      'Bedankt voor het stemmen! De stemperiode loopt van 9 september t/m 6 oktober 2019. Wil je weten welke plannen het vaakst zijn gekozen en uitgevoerd worden? De uitslag wordt op 15 oktober 2019 gepubliceerd op centrumbegroot.amsterdam.nl.',
    showNewsletterButton:
      widget?.config?.[category]?.showNewsletterButton || false,
  });

  const form = useForm<z.infer<typeof formSchema>>({
    resolver: zodResolver<any>(formSchema),
    defaultValues: defaults(),
  });

  useEffect(() => {
    form.reset(defaults());
  }, [widget]);

  function onSubmit(values: z.infer<typeof formSchema>) {
    updateConfig({ [category]: values });
  }

  return (
    <div className="p-6 bg-white rounded-md">
      <Form {...form}>
        <Heading size="xl">Authenticatie</Heading>
        <Separator className="my-4" />
        <form
          onSubmit={form.handleSubmit(onSubmit)}
          className="lg:w-1/2 grid grid-cols-1 gap-4">
          <FormField
            control={form.control}
            name="step1"
            render={({ field }) => (
              <FormItem>
                <FormLabel>Stap 1: Intro</FormLabel>
                <FormControl>
                  <Textarea rows={5} {...field} />
                </FormControl>
                <FormMessage />
              </FormItem>
            )}
          />
          <FormField
            control={form.control}
            name="step2"
            render={({ field }) => (
              <FormItem>
                <FormLabel>Stap 2: Intro</FormLabel>
                <FormControl>
                  <Textarea rows={5} {...field} />
                </FormControl>
                <FormMessage />
              </FormItem>
            )}
          />
          <FormField
            control={form.control}
            name="step3"
            render={({ field }) => (
              <FormItem>
                <FormLabel>Stap 3: Intro</FormLabel>
                <FormControl>
                  <Textarea rows={5} {...field} />
                </FormControl>
                <FormMessage />
              </FormItem>
            )}
          />
          <FormField
            control={form.control}
            name="step3success"
            render={({ field }) => (
              <FormItem>
                <FormLabel>Succesvolle authenticatie</FormLabel>
                <FormControl>
                  <Textarea rows={5} {...field} />
                </FormControl>
                <FormMessage />
              </FormItem>
            )}
          />
          <FormField
            control={form.control}
            name="voteMessage"
            render={({ field }) => (
              <FormItem>
                <FormLabel>Succesvol gestemd bericht</FormLabel>
                <FormControl>
                  <Input {...field} />
                </FormControl>
                <FormMessage />
              </FormItem>
            )}
          />
          <FormField
            control={form.control}
            name="thankMessage"
            render={({ field }) => (
              <FormItem>
                <FormLabel>Bedankt bericht</FormLabel>
                <FormControl>
                  <Textarea rows={5} {...field} />
                </FormControl>
                <FormMessage />
              </FormItem>
            )}
          />
          <FormField
            control={form.control}
            name="showNewsletterButton"
            render={({ field }) => (
              <FormItem>
                <FormLabel>
                  Wordt de nieuwsbrief knop weergegeven na het stemmen?
                </FormLabel>
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
          <Button type="submit">Opslaan</Button>
        </form>
      </Form>
    </div>
  );
}
