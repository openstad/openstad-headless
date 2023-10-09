import { Form, FormControl, FormField, FormItem, FormLabel, FormMessage } from "@/components/ui/form";
import { zodResolver } from "@hookform/resolvers/zod";
import { useForm } from "react-hook-form";
import * as z from 'zod'
import { Textarea } from "@/components/ui/textarea";
import { Input } from "@/components/ui/input";
import { Select, SelectContent, SelectItem, SelectTrigger, SelectValue } from "@/components/ui/select";
import { Heading } from "@/components/ui/typography";
import { Separator } from "@/components/ui/separator";
import { Button } from "@/components/ui/button";

const formSchema = z.object({
    step1: z.string(),
    step2: z.string(),
    step3: z.string(),
    step3success: z.string(),
    voteMessage: z.string(),
    thankMessage: z.string(),
    showNewsletterButton: z.boolean()
  });

  type Props = {
    config?: any;
    handleSubmit?: (config:any) => void
  }

export default function BegrootmoduleExplanation({config, handleSubmit} : Props) {
    const form = useForm<z.infer<typeof formSchema>>({
      resolver: zodResolver(formSchema),
      defaultValues: {
        step1: config?.explanations?.step1 || "Kies uit onderstaand overzicht jouw favoriete plannen. Selecteer voor maximaal € 200.000 aan plannen. In stap 3 vul je ter controle de stemcode in die je per post hebt ontvangen. Tot slot verstuur je in stap 4 je stem.",
        step2: config?.explanations?.step2 || "Bekijk hieronder je selectie. Ben je tevreden? Klik dan onderaan door naar stap 3 om jouw stemcode in te vullen.",
        step3: config?.explanations?.step3 || "Via onderstaande knop kun je op een aparte pagina je persoonlijke stemcode invullen. Wij controleren de stemcode op geldigheid. Als dat gelukt is kom je terug op deze pagina waarna je kunt stemmen. Alle bewoners van Centrum hebben per post een stemcode ontvangen.",
        step3success: config?.explanations?.step3success || "Het controleren van je stemcode is gelukt! Je bent bijna klaar. Klik op onderstaande knop om je stem te versturen.",
        voteMessage: config?.explanations?.voteMessage || "Gelukt, je hebt gestemd!",
        thankMessage: config?.explanations?.thankMessage || "Bedankt voor het stemmen! De stemperiode loopt van 9 september t/m 6 oktober 2019. Wil je weten welke plannen het vaakst zijn gekozen en uitgevoerd worden? De uitslag wordt op 15 oktober 2019 gepubliceerd op centrumbegroot.amsterdam.nl.",
        showNewsletterButton: config?.explanations?.showNewsletterButton || false
      },
    });
  
    function onSubmit(values: z.infer<typeof formSchema>) {
      handleSubmit && handleSubmit({explanations: values})
    }
  
    return (
        <div>
        <Form {...form}>
          <Heading size="xl" className="mb-4">
            Begrootmodule • Uitleg
          </Heading>
          <Separator className="mb-4" />
          <form
            onSubmit={form.handleSubmit(onSubmit)}
            className="space-y-4"
          >
            <FormField
            control={form.control}
            name="step1"
            render={({ field }) => (
                <FormItem>
                    <FormLabel>Step 1: Intro</FormLabel>
                    <FormControl>
                        <Textarea {...field} />
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
                    <FormLabel>Step 2: Intro</FormLabel>
                    <FormControl>
                        <Textarea {...field} />
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
                    <FormLabel>Step 3: Intro</FormLabel>
                    <FormControl>
                        <Textarea {...field} />
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
                    <FormLabel>Step 3: Succesvolle authenticatie</FormLabel>
                    <FormControl>
                        <Textarea {...field} />
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
                <FormLabel>URL waar het idee oorspronkelijk vandaan is gehaald</FormLabel>
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
                        <Textarea {...field} />
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
                   onValueChange={(e:string) => field.onChange(e === 'true')}
                   defaultValue={field.value ? "true": "false"}>
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
            <div className="sticky bottom-0 py-4 bg-background border-t border-border flex flex-col">
              <Button className="self-end" type="submit">
                Opslaan
              </Button>
            </div>
          </form>
        </Form>
      </div>
    );
  }