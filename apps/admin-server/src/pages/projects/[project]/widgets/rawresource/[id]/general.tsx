import { Button } from '@/components/ui/button';
import {
  Form,
  FormControl, FormDescription,
  FormField,
  FormItem,
  FormLabel,
  FormMessage,
} from '@/components/ui/form';
import {
  Select,
  SelectContent,
  SelectItem,
  SelectTrigger,
  SelectValue,
} from '@/components/ui/select';
import { Separator } from '@/components/ui/separator';
import { Textarea } from '@/components/ui/textarea';
import { Heading } from '@/components/ui/typography';
import useResources from '@/hooks/use-resources';
import { useFieldDebounce } from '@/hooks/useFieldDebounce';
import { EditFieldProps } from '@/lib/form-widget-helpers/EditFieldProps';
import { zodResolver } from '@hookform/resolvers/zod';
import { RawResourceWidgetProps } from '@openstad-headless/raw-resource/src/raw-resource';
import { useRouter } from 'next/router';
import { useCallback, useEffect } from 'react';
import { useForm } from 'react-hook-form';
import * as z from 'zod';

const formSchema = z.object({
  resourceId: z.string(),
  rawInput: z.string(),
});

export default function WidgetRawGeneral(
  props: RawResourceWidgetProps & EditFieldProps<RawResourceWidgetProps>
) {
  type FormData = z.infer<typeof formSchema>;
  async function onSubmit(values: FormData) {
    props.updateConfig({ ...props, ...values });
  }
  const router = useRouter();

  const projectId = router.query.project as string;
  const { data, error, isLoading, remove } = useResources(projectId as string);
  const { onFieldChange } = useFieldDebounce(props.onFieldChanged);

  const defaults = useCallback(
    () => ({
      resourceId: props?.resourceId || '',
      rawInput: props?.rawInput || '',
    }),
    [props?.resourceId, props?.rawInput]
  );

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
          className="flex flex-col gap-4 w-full lg:w-2/3">
          <FormField
            control={form.control}
            name="resourceId"
            render={({ field }) => (
              <FormItem>
                <FormLabel>Resource</FormLabel>
                <FormDescription>Als er geen resource gekoppeld is, wordt gecontroleerd of er een resource aanwezig is in de URL. In dat geval wordt deze resource automatisch gekoppeld.</FormDescription>
                <Select
                  onValueChange={(e) => {
                    field.onChange(e);
                    props.onFieldChanged(field.name, e);
                  }}
                  value={field.value}>
                  <FormControl>
                    <SelectTrigger>
                      <SelectValue placeholder="Selecteer een resource." />
                    </SelectTrigger>
                  </FormControl>
                  <SelectContent>
                    <SelectItem value="">Geen resource koppelen</SelectItem>
                    {data?.map((resource: any) => (
                      <SelectItem key={resource.id} value={`${resource.id}`}>
                        {resource.title}
                      </SelectItem>
                    ))}
                  </SelectContent>
                </Select>
                <FormMessage />
              </FormItem>
            )}
          />
          <FormField
            control={form.control}
            name="rawInput"
            render={({ field }) => (
              <FormItem>
                <FormLabel>Template</FormLabel>
                <div className="text-xs pb-4">
                  <h2>Te gebruiken variabelen:</h2>
                  <ul className="list-disc">
                    <li className="ml-4">{`{{projectId}}`}</li>
                    <li className="ml-4">{`{{user}} -> Bijvoorbeeld {{user.name}}`}</li>
                    <li className="ml-4">{`{{startDateHumanized}}`}</li>
                    <li className="ml-4">{`{{status}}`}</li>
                    <li className="ml-4">{`{{title}}`}</li>
                    <li className="ml-4">{`{{summary}}`}</li>
                    <li className="ml-4">{`{{description}}`}</li>
                    <li className="ml-4">{`{{images}} -> Bijvoorbeeld {{images[nummer].src}}`}</li>
                    <li className="ml-4">{`{{budget}}`}</li>
                    <li className="ml-4">{`{{extraData}}`}</li>
                    <li className="ml-4">{`{{location}}`}</li>
                    <li className="ml-4">{`{{modBreak}}`}</li>
                    <li className="ml-4">{`{{modBreakDateHumanized}}`}</li>
                    <li className="ml-4">{`{{progress}}`}</li>
                    <li className="ml-4">{`{{createDateHumanized}}`}</li>
                    <li className="ml-4">{`{{publishDateHumanized}}`}</li>
                    <li className="ml-4">{`{{resource}} -> Bevat alle data van de resource`}</li>
                  </ul>
                  <br/>
                  <h2>Te gebruiken filters:</h2>
                  <ul className="list-disc">
                    <li className="ml-4">{`{{ variable | dump }}: Laat de inhoud van een object zien.`}</li>
                    <li
                      className="ml-4">{`{{ variable | cleanArray }}: Maakt van een lijst een tekst met de waardes gescheiden door komma's. Bijvoorbeeld: "['Optie 1', 'Optie 2']" wordt omgezet naar: Optie 1, Optie 2`}</li>
                    <li
                      className="ml-4">{`{{ variable | capitalize }}: Zet de eerste letter in hoofdletters.`}</li>
                    <li
                      className="ml-4">{`{{ variable | truncate(10) }}: Kort een tekst in tot de opgegeven lengte. Na deze lengte wordt er '...' toegevoegd.`}</li>
                    <li className="ml-4">{`{{ variable | lowercase }}: Zet een tekst om naar kleine letters.`}</li>
                    <li className="ml-4">{`{{ variable | uppercase }}: Zet een tekst om naar hoofdletters.`}</li>
                    <li
                      className="ml-4">{`{{ variable | replace('zoek', 'vervang') }}: Vervangt een deel van de tekst door iets anders.`}</li>
                  </ul>
                  <br/>
                  <h2>Overige functies:</h2>
                  <ul className="list-disc">
                    <li
                      className="ml-4">{`{{ resource | tags }}: Laat alle gekoppelde tags zien gescheiden met komma's`}</li>
                    <li
                      className="ml-4">{`{{ resource | tagGroup('[group]') }}: Laat alle gekoppelde tags van de taggroep [group] zien gescheiden met komma's. [group] dient vervangen te worden door de naam van de taggroep.`}</li>
                    <li
                      className="ml-4">{`{{ resource | status }}: Laat alle gekoppelde statussen zien gescheiden met komma's`}</li>
                  </ul>
                </div>
                <FormControl>
                  <Textarea
                    rows={5}
                    {...field}
                    onChange={(e) => {
                      field.onChange(e);
                      onFieldChange(field.name, e.target.value);
                    }}
                  />
                </FormControl>
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
