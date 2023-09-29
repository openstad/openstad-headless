import { Button } from "@/components/ui/button";
import { Form, FormControl, FormField, FormItem, FormLabel, FormMessage } from "@/components/ui/form";
import { Input } from "@/components/ui/input";
import { Select, SelectContent, SelectItem, SelectTrigger, SelectValue } from "@/components/ui/select";
import { Separator } from "@/components/ui/separator";
import { Textarea } from "@/components/ui/textarea";
import { Heading } from "@/components/ui/typography";
import { zodResolver } from "@hookform/resolvers/zod";
import { useForm } from "react-hook-form";
import * as z from 'zod'

const formSchema = z.object({
    summaryCharLength: z.number(),
    step1: z.string(),
    step2: z.string(),
    step2ButtonFeedback: z.string(),
    step2Authenticated: z.string(),
    authenticateButtonText: z.string(),
    authFormEmbedded: z.boolean(),
    placeholder: z.string(),
    error: z.string(),
    successTitle: z.string(),
    successDescription: z.string(),
    siteId: z.string(),
    authCodeLabel: z.string(),
    authUniqueButton: z.string(),
    authSms: z.string(),
    authSmsButton: z.string(),
    authMail: z.string(),
    authMailButton: z.string()
  });

export default function WidgetResourceOverviewInfo() {
    const form = useForm<z.infer<typeof formSchema>>({
      resolver: zodResolver(formSchema),
      defaultValues: {
        summaryCharLength: 30,
        step1: "Kies uit onderstaand overzicht jouw favoriete ontwerp voor de muurtekst 'Zorg goed voor onze stad en voor elkaar', en vul in de volgende stap je gegevens in.",
        step2: "Via onderstaande knop kun je op een aparte pagina je e-mailadres invullen. Ter controle krijg je een mail om je e-mailadres te bevestigen. Als dat lukt kom je terug op deze pagina.",
        step2ButtonFeedback: "Gevalideerd",
        step2Authenticated: "Het controleren van je e-mailadres is gelukt!<br/>Je bent bijna klaar. Klik op onderstaande knop om je stem te versturen.",
        authenticateButtonText: "Vul je email-adres in",
        placeholder: "Kies een ontwerp",
        error: "Je hebt nog geen selectie gemaakt.",
        successTitle: "Gelukt, je stem is opgeslagen!",
        successDescription: "Bedankt voor het stemmen. Hou deze website<br/> in de gaten voor de uitslag."
      },
    });
  
    function onSubmit(values: z.infer<typeof formSchema>) {
      console.log(values);
    }
  
    return (
        <div>
        <Form {...form}>
          <Heading size="xl" className="mb-4">
            Resource Overview • Info
          </Heading>
          <Separator className="mb-4" />
          <form
            onSubmit={form.handleSubmit(onSubmit)}
            className="space-y-4"
          >
            <FormField
              control={form.control}
              name="summaryCharLength"
              render={({ field }) => (
                <FormItem>
                  <FormLabel>Hoeveelheid karakters waar de samenvatting uit mag bestaan</FormLabel>
                  <FormControl>
                    <Input {...field} />
                  </FormControl>
                  <FormMessage />
                </FormItem>
              )}
            />
            <FormField
              control={form.control}
              name="step1"
              render={({ field }) => (
                <FormItem>
                  <FormLabel>Stap 1: Intro</FormLabel>
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
                  <FormLabel>Stap 2: Intro</FormLabel>
                  <FormControl>
                    <Textarea {...field} />
                  </FormControl>
                  <FormMessage />
                </FormItem>
              )}
            />
            <FormField
              control={form.control}
              name="step2ButtonFeedback"
              render={({ field }) => (
                <FormItem>
                  <FormLabel>Stap 2: Succesvolle feedback op knop</FormLabel>
                  <FormControl>
                    <Input {...field} />
                  </FormControl>
                  <FormMessage />
                </FormItem>
              )}
            />
            <FormField
              control={form.control}
              name="step2Authenticated"
              render={({ field }) => (
                <FormItem>
                  <FormLabel>Stap 2: Succesvolle authenticatie</FormLabel>
                  <FormControl>
                    <Textarea {...field} />
                  </FormControl>
                  <FormMessage />
                </FormItem>
              )}
            />
            <FormField
              control={form.control}
              name="authenticateButtonText"
              render={({ field }) => (
                <FormItem>
                  <FormLabel>Text op authenticatie knop</FormLabel>
                  <FormControl>
                    <Input {...field} />
                  </FormControl>
                  <FormMessage />
                </FormItem>
              )}
            />
            <FormField
              control={form.control}
              name="authFormEmbedded"
              render={({ field }) => (
                <FormItem>
                  <FormLabel>
                    Authenticatie formulier embedded
                  </FormLabel>
                  <Select
                    onValueChange={field.onChange}
                    defaultValue={field.value}
                  >
                    <FormControl>
                      <SelectTrigger>
                        <SelectValue placeholder="Nee" />
                      </SelectTrigger>
                    </FormControl>
                    <SelectContent>
                      <SelectItem value="Yes">Ja</SelectItem>
                      <SelectItem value="No">Nee</SelectItem>
                    </SelectContent>
                  </Select>
                  <FormMessage />
                </FormItem>
              )}
            />
            <FormField
              control={form.control}
              name="placeholder"
              render={({ field }) => (
                <FormItem>
                  <FormLabel>Placeholder als er geen item geselecteerd is</FormLabel>
                  <FormControl>
                    <Input {...field} />
                  </FormControl>
                  <FormMessage />
                </FormItem>
              )}
            />
            <FormField
              control={form.control}
              name="error"
              render={({ field }) => (
                <FormItem>
                  <FormLabel>Error als er geen item geselecteerd is</FormLabel>
                  <FormControl>
                    <Input {...field} />
                  </FormControl>
                  <FormMessage />
                </FormItem>
              )}
            />
            <FormField
              control={form.control}
              name="successTitle"
              render={({ field }) => (
                <FormItem>
                  <FormLabel>Succes titel</FormLabel>
                  <FormControl>
                    <Input {...field} />
                  </FormControl>
                  <FormMessage />
                </FormItem>
              )}
            />
            <FormField
              control={form.control}
              name="successDescription"
              render={({ field }) => (
                <FormItem>
                  <FormLabel>Succes beschrijving</FormLabel>
                  <FormControl>
                    <Input {...field} />
                  </FormControl>
                  <FormMessage />
                </FormItem>
              )}
            />
            <FormField
              control={form.control}
              name="siteId"
              render={({ field }) => (
                <FormItem>
                  <FormLabel>Site ID</FormLabel>
                  <FormControl>
                    <Input {...field} />
                  </FormControl>
                  <FormMessage />
                </FormItem>
              )}
            />
            <FormField
              control={form.control}
              name="authCodeLabel"
              render={({ field }) => (
                <FormItem>
                  <FormLabel>Authenticatie formulier: Unieke code label</FormLabel>
                  <FormControl>
                    <Input {...field} />
                  </FormControl>
                  <FormMessage />
                </FormItem>
              )}
            />
            <FormField
              control={form.control}
              name="authUniqueButton"
              render={({ field }) => (
                <FormItem>
                  <FormLabel>Authenticatie formulier: Unieke code knop tekst</FormLabel>
                  <FormControl>
                    <Input {...field} />
                  </FormControl>
                  <FormMessage />
                </FormItem>
              )}
            />
            <FormField
              control={form.control}
              name="authSms"
              render={({ field }) => (
                <FormItem>
                  <FormLabel>Authenticatie formulier: SMS label</FormLabel>
                  <FormControl>
                    <Input {...field} />
                  </FormControl>
                  <FormMessage />
                </FormItem>
              )}
            />
            <FormField
              control={form.control}
              name="authSmsButton"
              render={({ field }) => (
                <FormItem>
                  <FormLabel>Authenticatie formulier: SMS knop tekst</FormLabel>
                  <FormControl>
                    <Input {...field} />
                  </FormControl>
                  <FormMessage />
                </FormItem>
              )}
            />
            <FormField
              control={form.control}
              name="authMail"
              render={({ field }) => (
                <FormItem>
                  <FormLabel>Authenticatie formulier: E-mail label</FormLabel>
                  <FormControl>
                    <Input {...field} />
                  </FormControl>
                  <FormMessage />
                </FormItem>
              )}
            />
            <FormField
              control={form.control}
              name="authMailButton"
              render={({ field }) => (
                <FormItem>
                  <FormLabel>Authenticatie formulier: E-mail knop tekst</FormLabel>
                  <FormControl>
                    <Input {...field} />
                  </FormControl>
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