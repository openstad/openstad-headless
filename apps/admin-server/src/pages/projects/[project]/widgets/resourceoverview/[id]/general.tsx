import { Button } from '@/components/ui/button';
import {
  Form,
  FormControl,
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
import { Heading } from '@/components/ui/typography';
import { zodResolver } from '@hookform/resolvers/zod';
import { useForm } from 'react-hook-form';
import * as z from 'zod';
import { Input } from '@/components/ui/input';
import { ResourceOverviewWidgetProps } from '@openstad-headless/resource-overview/src/resource-overview';
import { EditFieldProps } from '@/lib/form-widget-helpers/EditFieldProps';
import { useFieldDebounce } from '@/hooks/useFieldDebounce';
import { Textarea } from '@/components/ui/textarea';

const formSchema = z.object({
  resourceType: z.enum(['resource']),
  displayType: z.enum(['cardrow', 'cardgrid', 'raw']),
  itemLink: z.string(),
  rawInput: z.string().optional(),
});

export default function WidgetResourceOverviewGeneral(
  props: ResourceOverviewWidgetProps &
    EditFieldProps<ResourceOverviewWidgetProps>
) {
  type FormData = z.infer<typeof formSchema>;
  async function onSubmit(values: FormData) {
    props.updateConfig({ ...props, ...values });
  }

  const { onFieldChange } = useFieldDebounce(props.onFieldChanged);

  const form = useForm<FormData>({
    resolver: zodResolver<any>(formSchema),
    defaultValues: {
      resourceType: props?.resourceType || 'resource',
      displayType: props?.displayType || 'cardrow',
      itemLink: props?.itemLink || '/resource?openstadResourceId=[id]',
      rawInput: props?.rawInput || '',
    },
  });

  return (
    <div className="p-6 bg-white rounded-md">
      <Form {...form}>
        <Heading size="xl">Algemeen</Heading>
        <Separator className="my-4" />
        <form
          onSubmit={form.handleSubmit(onSubmit)}
          className="lg:w-2/3 grid grid-cols-1 lg:grid-cols-1 gap-x-4 gap-y-8">
          <FormField
            control={form.control}
            name="resourceType"
            render={({ field }) => (
              <FormItem>
                <FormLabel>Soort inzending</FormLabel>
                <Select
                  onValueChange={(value) => {
                    field.onChange(value);
                    props.onFieldChanged(field.name, value);
                  }}
                  value={field.value}>
                  <FormControl>
                    <SelectTrigger>
                      <SelectValue placeholder="Resource" />
                    </SelectTrigger>
                  </FormControl>
                  <SelectContent>
                    <SelectItem value="resource">Resource</SelectItem>
                  </SelectContent>
                </Select>
                <FormMessage />
              </FormItem>
            )}
          />
          <FormField
            control={form.control}
            name="displayType"
            render={({ field }) => (
              <FormItem className="col-span-full">
                <FormLabel>Weergavetype</FormLabel>
                <Select
                  onValueChange={(value) => {
                    field.onChange(value);
                    props.onFieldChanged(field.name, value);
                  }}
                  value={field.value}>
                  <FormControl>
                    <SelectTrigger>
                      <SelectValue placeholder="Cards op een row - Linkt naar items op een andere pagina." />
                    </SelectTrigger>
                  </FormControl>
                  <SelectContent>
                    <SelectItem value="cardrow">
                      Inzending op een nieuwe pagina openen.
                    </SelectItem>
                    <SelectItem value="cardgrid">
                      Inzendingen op de huidige pagina tonen, in een dialog.
                    </SelectItem>
                    <SelectItem value="raw">
                      Creëer je eigen template.
                    </SelectItem>
                  </SelectContent>
                </Select>
                <FormMessage />
              </FormItem>
            )}
          />

          { form.watch('displayType') === 'cardrow' && (
            <FormField
              control={form.control}
              name="itemLink"
              render={({ field }) => (
                <FormItem>
                  <FormLabel>
                    Link (relatief) naar de specifieke inzending
                  </FormLabel>
                  <FormControl>
                    <Input
                      placeholder="Bijv: /resources/[id]"
                      type="text"
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

          { form.watch('displayType') === 'raw' && (
            <FormField
              control={form.control}
              name="rawInput"
              render={({ field }) => (
                <FormItem className="col-span-full">
                  <FormLabel>
                    Template voor display: &quot; Creëer je eigen template.&quot;
                  </FormLabel>
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
                      <li className="ml-4">{`{{ resource | tags }}: Laat alle gekoppelde tags zien gescheiden met komma's`}</li>
                      <li className="ml-4">{`{{ resource | status }}: Laat alle gekoppelde statussen zien gescheiden met komma's`}</li>
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
          )}

          <Button className="w-fit col-span-full" type="submit">
            Opslaan
          </Button>
        </form>
      </Form>
    </div>
  );
}
