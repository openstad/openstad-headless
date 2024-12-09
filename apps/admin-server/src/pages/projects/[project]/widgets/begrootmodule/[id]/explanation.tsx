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
import { Heading } from '@/components/ui/typography';
import { Separator } from '@/components/ui/separator';
import { Button } from '@/components/ui/button';
import { StemBegrootWidgetProps } from '@openstad-headless/stem-begroot/src/stem-begroot';
import { EditFieldProps } from '@/lib/form-widget-helpers/EditFieldProps';
import { useFieldDebounce } from '@/hooks/useFieldDebounce';
import { YesNoSelect } from '@/lib/form-widget-helpers';
import {useProject} from "@/hooks/use-project";

const formSchema = z.object({
  step0: z.string().optional(),
  step1: z.string().optional(),
  step2: z.string().optional(),
  step3: z.string().optional(),
  step3success: z.string().optional(),
  voteMessage: z.string().optional(),
  thankMessage: z.string().optional(),
  showNewsletterButton: z.boolean().optional(),
});

type Formdata = z.infer<typeof formSchema>;

export default function BegrootmoduleExplanation(
  props: StemBegrootWidgetProps & EditFieldProps<StemBegrootWidgetProps>
) {
  const { onFieldChange } = useFieldDebounce(props.onFieldChanged);
  const { data } = useProject();

  function onSubmit(values: Formdata) {
    props.updateConfig({ ...props, ...values });
  }

  const voteType = data?.config?.votes?.voteType || 'likes';

  const form = useForm<z.infer<typeof formSchema>>({
    resolver: zodResolver<any>(formSchema),
    defaultValues: {
      step0: props.step0 ?? `<h4>Kies jouw favoriete inzendingen per thema!</h4>
<ol type="1">
<li>Selecteer hieronder een thema om de inzendingen voor dat thema te bekijken</li>
<li>Kies jouw favoriete inzendingen voor dat thema${voteType === 'budgetingPerTag' ? 'binnen het beschikbare budget' : ''}</li>
<li>Ga naar het volgende thema om hetzelfde te doen</li>
<li>Klaar en tevreden? In stap 3 vul je ter controle de stemcode in. Tot slot verstuur je in stap 4 je stem</li>
</ol>`,
      step1:
        props.step1 ??
        'Kies uit onderstaand overzicht jouw favoriete plannen. Selecteer voor maximaal € 200.000 aan plannen. In stap 3 vul je ter controle de stemcode in die je per post hebt ontvangen. Tot slot verstuur je in stap 4 je stem.',
      step2:
        props.step2 ??
        'Bekijk hieronder je selectie. Ben je tevreden? Klik dan onderaan door naar stap 3 om jouw stemcode in te vullen.',
      step3:
        props.step3 ??
        'Via onderstaande knop kun je op een aparte pagina je persoonlijke stemcode invullen. Wij controleren de stemcode op geldigheid. Als dat gelukt is kom je terug op deze pagina waarna je kunt stemmen. Alle bewoners van Centrum hebben per post een stemcode ontvangen.',
      step3success:
        props.step3success ??
        'Het controleren van je stemcode is gelukt! Je bent bijna klaar. Klik op onderstaande knop om je stem te versturen.',
      voteMessage: props.voteMessage ?? 'Gelukt, je hebt gestemd!',
      thankMessage:
        props.thankMessage ??
        'Bedankt voor het stemmen! De stemperiode loopt van 9 september t/m 6 oktober 2019. Wil je weten welke plannen het vaakst zijn gekozen en uitgevoerd worden? De uitslag wordt op 15 oktober 2019 gepubliceerd op centrumbegroot.amsterdam.nl.',
      showNewsletterButton: props.showNewsletterButton || false,
    },
  });

  return (
    <div className="p-6 bg-white rounded-md">
      <Form {...form}>
        <Heading size="xl">Authenticatie</Heading>
        <Separator className="my-4" />
        <form
          onSubmit={form.handleSubmit(onSubmit)}
          className="lg:w-1/2 grid grid-cols-1 gap-4">

          { (voteType === 'countPerTag' || voteType === 'budgetingPerTag') && (
            <FormField
              control={form.control}
              name="step0"
              render={({ field }) => (
                <FormItem>
                  <FormLabel>Stap 0: Stemmen / budget per thema intro</FormLabel>
                  <FormControl>
                    <Textarea
                      rows={8}
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
          )}

          <FormField
            control={form.control}
            name="step1"
            render={({ field }) => (
              <FormItem>
                <FormLabel>Stap 1: Intro</FormLabel>
                <FormControl>
                  <Textarea
                    rows={5}
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
            name="step2"
            render={({ field }) => (
              <FormItem>
                <FormLabel>Stap 2: Intro</FormLabel>
                <FormControl>
                  <Textarea
                    rows={5}
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
            name="step3"
            render={({ field }) => (
              <FormItem>
                <FormLabel>Stap 3: Intro</FormLabel>
                <FormControl>
                  <Textarea
                    rows={5}
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
            name="step3success"
            render={({ field }) => (
              <FormItem>
                <FormLabel>Succesvolle authenticatie</FormLabel>
                <FormControl>
                  <Textarea
                    rows={5}
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
            name="voteMessage"
            render={({ field }) => (
              <FormItem>
                <FormLabel>Succesvol gestemd bericht</FormLabel>
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
            name="thankMessage"
            render={({ field }) => (
              <FormItem>
                <FormLabel>Bedankt bericht</FormLabel>
                <FormControl>
                  <Textarea
                    rows={5}
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
            name="showNewsletterButton"
            render={({ field }) => (
              <FormItem>
                <FormLabel>
                  Wordt de nieuwsbrief knop weergegeven na het stemmen?
                </FormLabel>
                {YesNoSelect(field, props)}
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
