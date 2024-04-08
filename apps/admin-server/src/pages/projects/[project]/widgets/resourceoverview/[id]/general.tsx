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
      itemLink: props?.itemLink || '/resources/[id]',
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
                <FormLabel>Resource type</FormLabel>
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
                <FormLabel>Display type</FormLabel>
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
                      Cards op een row - Linkt naar items op een andere pagina.
                    </SelectItem>
                    <SelectItem value="cardgrid">
                      Cards op een grid - Opent items op dezelfde pagina.
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

          <FormField
            control={form.control}
            name="itemLink"
            render={({ field }) => (
              <FormItem>
                <FormLabel>
                  Link (relatief) naar de specifieke resource
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
