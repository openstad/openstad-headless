import React from 'react';
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
import useTags from "@/hooks/use-tags";
import {Spacer} from "@/components/ui/spacer";
import {CheckboxList} from "@/components/checkbox-list";

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
  includeOrExclude: z.string().optional(),
  onlyIncludeOrExcludeTagIds: z.string().optional()
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

   const { data: loadedTags } = useTags(props.projectId);
   const tags = (loadedTags || []) as Array<{
      id: string;
      name: string;
      type?: string;
   }>;

  const form = useForm<Formdata>({
    resolver: zodResolver<any>(formSchema),
    defaultValues: {
      counterType: props?.counterType || 'resource',
      label: props?.label || 'Hoeveelheid',
      url: props?.url || '',
      opinion: props?.opinion || '',
      choiceGuideId: props?.choiceGuideId,
      resourceId: props?.resourceId,
      includeOrExclude: props?.includeOrExclude || 'include',
      onlyIncludeOrExcludeTagIds: props?.onlyIncludeOrExcludeTagIds || '',
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
        className="space-y-2 lg:w-full grid grid-cols-1" style={{gap: '2.5rem'}}>
          <div className="space-y-4 lg:w-1/2">
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
                    Aantal inzendingen
                  </SelectItem>
                  <SelectItem value="vote">Hoeveelheid stemmen</SelectItem>
                  <SelectItem value="votedUsers">
                    Hoeveelheid gestemde gebruikers
                  </SelectItem>
                  <SelectItem value="static">Vaste waarde</SelectItem>
                  <SelectItem value="argument">Aantal reacties</SelectItem>
                  <SelectItem value="submission">
                    Aantal inzendingen keuzewijzer
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
              fieldLabel="Koppel aan een specifieke inzending"
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
          </div>

        {props.counterType === 'resource' ? (<>
                <Separator  className="my-0" />
            <div className="space-y-4 lg:w-full">
                <FormField
                    control={form.control}
                    name="includeOrExclude"
                    render={({field}) => (
                        <FormItem>
                            <FormLabel>
                                Toon reacties gekoppeld aan onderstaande tags
                            </FormLabel>
                            <FormDescription>
                                Gebruik het selectievakje om te kiezen hoe de geselecteerde tags de weergave van
                                reacties
                                beïnvloeden:
                                <br/>
                                <br/>
                                Maak je keuze op basis van hoe je de reacties wilt filteren in relatie tot de
                                geselecteerde tags.
                                <br/>
                                <br/>
                            </FormDescription>
                            <Select
                                onValueChange={field.onChange}
                                value={field.value || 'include'}
                            >
                                <FormControl>
                                    <SelectTrigger>
                                        <SelectValue placeholder="Inclusief"/>
                                    </SelectTrigger>
                                </FormControl>
                                <SelectContent>
                                    <SelectItem value="include"><strong>Inclusief</strong>: Als je deze optie kiest,
                                        worden alleen de
                                        reacties getoond die gekoppeld zijn aan de
                                        geselecteerde tags.</SelectItem>
                                    <SelectItem value="exclude"><strong>Exclusief</strong>: Als je deze optie kiest,
                                        worden juist de
                                        reacties die gekoppeld zijn aan de
                                        geselecteerde tags niet getoond.</SelectItem>
                                </SelectContent>
                            </Select>
                            <FormMessage/>
                        </FormItem>
                    )}
                />

                <Spacer/>

                <CheckboxList
                    form={form}
                    fieldName="onlyIncludeOrExcludeTagIds"
                    fieldLabel="Geef enkel de resources met de volgende tags weer:"
                    label={(t) => t.name}
                    keyForGrouping="type"
                    keyPerItem={(t) => `${t.id}`}
                    items={tags}
                    selectedPredicate={(t) =>
                        // @ts-ignore
                        form
                            ?.getValues('onlyIncludeOrExcludeTagIds')
                            ?.split(',')
                            ?.findIndex((tg) => tg === `${t.id}`) > -1
                    }
                    onValueChange={(tag, checked) => {
                        const ids = form.getValues('onlyIncludeOrExcludeTagIds')?.split(',') ?? [];

                        const idsToSave = (checked
                            ? [...ids, tag.id]
                            : ids.filter((id) => id !== `${tag.id}`)).join(',');

                        form.setValue('onlyIncludeOrExcludeTagIds', idsToSave);
                        props.onFieldChanged("onlyIncludeOrExcludeTagIds", idsToSave);
                    }}
                />
            </div>
            </>
        ) : null}

        <Button className="w-fit col-span-full" type="submit">
          Opslaan
        </Button>
      </form>
    </Form>
  );
}
