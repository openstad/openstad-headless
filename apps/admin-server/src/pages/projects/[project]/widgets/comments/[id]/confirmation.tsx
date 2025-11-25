import { EditFieldProps } from "@/lib/form-widget-helpers/EditFieldProps";
import * as z from "zod";
import {useForm} from "react-hook-form";
import {zodResolver} from "@hookform/resolvers/zod";
import {Heading} from "@/components/ui/typography";
import {Separator} from "@/components/ui/separator";
import {Form, FormDescription, FormField, FormItem, FormLabel, FormMessage} from "@/components/ui/form";
import {YesNoSelect} from "@/lib/form-widget-helpers";
import React from "react";
import {Button} from "@/components/ui/button";
import {Input} from "@/components/ui/input";
import { Spacer } from "@/components/ui/spacer";
import {Alert, AlertDescription, AlertTitle} from "@/components/ui/alert";
import {ArgumentWidgetTabProps} from "@/pages/projects/[project]/widgets/comments/[id]/index";

const formSchema = z.object({
  confirmation: z.boolean().optional(),
  overwriteEmailAddress: z.string().optional(),
  confirmationReplies: z.boolean().optional(),
});

export default function ArgumentsConfirmation(
  props: ArgumentWidgetTabProps & EditFieldProps<ArgumentWidgetTabProps> & {
    requiredFieldsIncludesEmailNotificationConsent?: boolean
  }
) {
  type FormData = z.infer<typeof formSchema>;

  async function onSubmit(values: FormData) {
    props.updateConfig({ ...props, ...values });
  }

  const form = useForm<FormData>({
    resolver: zodResolver<any>(formSchema),
    defaultValues: {
      confirmation: props?.confirmation || false,
      overwriteEmailAddress: props?.overwriteEmailAddress || '',
      confirmationReplies: props?.confirmationReplies || false,
    }
  });

  return (
    <div className="p-6 bg-white rounded-md">
      <Form {...form}>
        <Heading size="xl">E-mail notificatie instellingen</Heading>
        <Separator className="my-4" />

        {!props?.requiredFieldsIncludesEmailNotificationConsent && (
          <Alert variant="warning" className="mb-4">
            <AlertTitle>Let op!</AlertTitle>
            <AlertDescription>
              Het veld <b>'E-mail notificatie toestemming'</b> is niet opgenomen in de
              verplichte velden. Hierdoor kunnen inzenders geen toestemming geven
              voor het ontvangen van e-mail notificaties. Hierdoor kunnen
              bevestigingsmails niet correct worden verzonden. Voeg dit veld toe
              aan de verplichte velden om dit op te lossen. De verplichte velden kun je
              instellen op de pagina <i>Authenticatie &gt; Verplichte velden</i>.
            </AlertDescription>
          </Alert>
        )}

        <Spacer />
        <form
          onSubmit={form.handleSubmit(onSubmit)}
          className="lg:w-1/2 grid grid-cols-1 lg:grid-cols-1 gap-x-4 gap-y-8">
          <FormField
            control={form.control}
            name="confirmation"
            render={({ field }) => (
              <FormItem>
                <FormLabel>
                  Krijgt de inzender van de gekoppelde inzending een mail bij een reactie?
                </FormLabel>
                {YesNoSelect(field, props)}
                <FormMessage />
              </FormItem>
            )}
          />

          { form.watch('confirmation') && (
            <FormField
              control={form.control}
              name="overwriteEmailAddress"
              render={({ field }) => (
                <FormItem>
                  <FormLabel>
                    Overschrijf het e-mailadres voor de mail naar de inzender van de inzending
                  </FormLabel>
                  <FormDescription>
                    De mail gaat standaard naar de inzender van de inzending. Vul hier een ander e-mailadres in om dit te overschrijven. Meerdere e-mailadressen zijn mogelijk, mits ze gescheiden zijn met een komma.
                  </FormDescription>
                  <Input {...field} />
                  <FormMessage />
                </FormItem>
              )}
            />
          )}
          <FormField
            control={form.control}
            name="confirmationReplies"
            render={({ field }) => (
              <FormItem>
                <FormLabel>
                  Krijgt de inzender van een reactie een mail bij een reactie op zijn/haar reactie?
                </FormLabel>
                {YesNoSelect(field, props)}
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