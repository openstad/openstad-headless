import React from 'react';
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
import { Input } from '@/components/ui/input';
import { zodResolver } from '@hookform/resolvers/zod';
import { useForm } from 'react-hook-form';
import * as z from 'zod';
import { Heading } from '@/components/ui/typography';
import { Separator } from '@/components/ui/separator';
import { CounterWidgetProps } from '@openstad-headless/counter/src/counter';
import { EditFieldProps } from '@/lib/form-widget-helpers/EditFieldProps';
import { useFieldDebounce } from '@/hooks/useFieldDebounce';
import { useRouter } from 'next/router';
import useChoiceGuides from '@/hooks/use-choiceguides';
import useResources from '@/hooks/use-resources';
import { FormObjectSelectField } from '@/components/ui/form-object-select-field';

const formSchema = z.object({
  label: z.string().optional(),
  url: z.string().optional(),
  counterType: z.enum([
    'resource',
    'vote',
    'votedUsers',
    'static',
    'argument',
    'submission',
  ]),
  opinion: z.string().optional(),
  amount: z.coerce.number().optional(),
  id: z.string().optional(),
  choiceGuideId: z.string().optional(),
  resourceId: z.string().optional(),
});
type Formdata = z.infer<typeof formSchema>;

export default function CounterDisplay(
  props: CounterWidgetProps & EditFieldProps<CounterWidgetProps>
) {
  const { onFieldChange } = useFieldDebounce(props.onFieldChanged);

  const router = useRouter();

  const projectId = router.query.project as string;
  const { data: choiceGuides } = useChoiceGuides(projectId as string);
  const { data: resourceList } = useResources(projectId as string);
  const resources = resourceList as { id: string; title: string }[];

  function onSubmit(values: Formdata) {
    props.updateConfig({ ...props, ...values });
  }

  const form = useForm<Formdata>({
    resolver: zodResolver<any>(formSchema),
    defaultValues: {
      counterType: props?.counterType || 'resource',
      label: props?.label || 'Hoeveelheid',
      url: props?.url || '',
      opinion: props?.opinion || '',
      choiceGuideId: props?.choiceGuideId,
      resourceId: props?.resourceId,
    },
  });

  return (
    <Form {...form} className="p-6 bg-white rounded-md">
      <Heading size="xl" className="mb-4">
        Instellingen
      </Heading>
      <Separator className="mb-4" />
      <form
        onSubmit={form.handleSubmit(onSubmit)}
        className="space-y-4 lg:w-1/2">
        <FormField
          control={form.control}
          name="label"
          render={({ field }) => (
            <FormItem>
              <FormLabel>Label</FormLabel>
              <FormControl>
                <Input
                  defaultValue={field.value}
                  onChange={(e) => {
                    field.onChange(e);
                    onFieldChange(field.name, e.target.value);
                  }}
                />
              </FormControl>
            </FormItem>
          )}
        />

        <FormField
          control={form.control}
          name="url"
          render={({ field }) => (
            <FormItem>
              <FormLabel>Url</FormLabel>
              <FormControl>
                <Input
                  defaultValue={field.value}
                  onChange={(e) => {
                    field.onChange(e);
                    onFieldChange(field.name, e.target.value);
                  }}
                />
              </FormControl>
            </FormItem>
          )}
        />

        <FormField
          control={form.control}
          name="counterType"
          render={({ field }) => (
            <FormItem>
              <FormLabel>Type teller</FormLabel>
              <Select
                onValueChange={(value) => {
                  field.onChange(value);
                  props.onFieldChanged(field.name, value);
                }}
                value={field.value}>
                <FormControl>
                  <SelectTrigger>
                    <SelectValue placeholder="Hoeveelheid stemmen" />
                  </SelectTrigger>
                </FormControl>
                <SelectContent className='overflow-y-auto max-h-[16rem]'>
                  <SelectItem value="resource">
                    Hoeveelheid resources
                  </SelectItem>
                  <SelectItem value="vote">Hoeveelheid stemmen</SelectItem>
                  <SelectItem value="votedUsers">
                    Hoeveelheid gestemde gebruikers
                  </SelectItem>
                  <SelectItem value="static">Vaste waarde</SelectItem>
                  <SelectItem value="argument">Hoeveelheid comments</SelectItem>
                  <SelectItem value="submission">
                    Hoeveelheid submissies op keuzewijzer
                  </SelectItem>
                </SelectContent>
              </Select>
            </FormItem>
          )}
        />

        {props?.counterType === 'vote' || props.counterType === 'argument' ? (
          <>
            <FormObjectSelectField
              form={form}
              fieldName="resourceId"
              fieldLabel="Koppel aan een specifieke resource"
              items={resources}
              keyForValue="id"
              label={(resource) => `${resource.id} ${resource.title}`}
              onFieldChanged={props.onFieldChanged}
              noSelection="Niet koppelen (gebruik queryparam openstadResourceId)"
            />

            <FormField
              control={form.control}
              name="opinion"
              render={({ field }) => (
                <FormItem>
                  <FormLabel>Mening</FormLabel>
                  <Select
                    onValueChange={(value) => {
                      field.onChange(value);
                      props.onFieldChanged(field.name, value);
                    }}
                    value={field.value}>
                    <FormControl>
                      <SelectTrigger>
                        <SelectValue placeholder="Beide" />
                      </SelectTrigger>
                    </FormControl>
                    <SelectContent>
                      <SelectItem value="for">Voor</SelectItem>
                      <SelectItem value="against">Tegen</SelectItem>
                      <SelectItem value="">Beide</SelectItem>
                    </SelectContent>
                  </Select>
                </FormItem>
              )}
            />
          </>
        ) : null}

        {props?.counterType === 'static' ? (
          <FormField
            control={form.control}
            name="amount"
            render={({ field }) => (
              <FormItem>
                <FormLabel>Hoeveelheid</FormLabel>
                <FormControl>
                  <Input
                    type="number"
                    defaultValue={field.value}
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
        ) : null}

        {props.counterType === 'submission' ? (
          <FormObjectSelectField
            form={form}
            fieldName="choiceGuideId"
            fieldLabel="Gewenste keuzewijzer"
            items={choiceGuides}
            keyForValue="id"
            label={(ch) => `${ch.id}`}
            onFieldChanged={props.onFieldChanged}
            noSelection="Selecteer uw gewenste keuzewijzer"
          />
        ) : null}
        <Button className="w-fit col-span-full" type="submit">
          Opslaan
        </Button>
      </form>
    </Form>
  );
}
