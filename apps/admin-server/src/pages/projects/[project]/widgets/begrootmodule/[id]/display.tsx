import { Button } from '@/components/ui/button';
import {
  Form,
  FormControl, FormDescription,
  FormField,
  FormItem,
  FormLabel,
  FormMessage,
} from '@/components/ui/form';
import { Input } from '@/components/ui/input';
import { Separator } from '@/components/ui/separator';
import { Heading } from '@/components/ui/typography';
import { useFieldDebounce } from '@/hooks/useFieldDebounce';
import { YesNoSelect } from '@/lib/form-widget-helpers';
import { EditFieldProps } from '@/lib/form-widget-helpers/EditFieldProps';
import { zodResolver } from '@hookform/resolvers/zod';
import { StemBegrootWidgetProps } from '@openstad-headless/stem-begroot/src/stem-begroot';
import { useForm } from 'react-hook-form';
import * as z from 'zod';
import InfoDialog from '@/components/ui/info-hover';
import { ObjectListSelect } from '@/components/ui/object-select';
import { FormObjectSelectField } from '@/components/ui/form-object-select-field';
import * as Switch from "@radix-ui/react-switch";
import {handleTagCheckboxGroupChange} from "@/lib/form-widget-helpers/TagGroupHelper";
import {useProject} from "@/hooks/use-project";
import useTags from "@/hooks/use-tags";
import React, {useEffect, useState} from "react";
import {useRouter} from "next/router";
import _ from "lodash";
import {Checkbox} from "@/components/ui/checkbox";
import {Select, SelectContent, SelectItem, SelectTrigger, SelectValue} from "@/components/ui/select";

const formSchema = z.object({
  displayRanking: z.boolean(),
  displayPriceLabel: z.boolean(),
  showVoteCount: z.boolean(),
  hideReadMore: z.boolean(),
  scrollWhenMaxReached: z.boolean(),
  notEnoughBudgetText: z.string(),
  showOriginalResource: z.boolean(),
  originalResourceUrl: z.string().optional(),
  resourceListColumns: z.coerce.number({
    invalid_type_error: 'Alleen volledige nummers kunnen worden ingevoerd',
  }),
  showInfoMenu: z.boolean(),
  hideTagsForResources: z.boolean(),
  tagTypeTagGroup: z.array(z.string()).optional(),
  tagTypeSelector: z.string().optional(),
  tagTypeTag: z.string().optional(),
});

type Formdata = z.infer<typeof formSchema>;

type Tag = {
  id: number;
  name: string;
  type: string;
};

export default function BegrootmoduleDisplay(
  props: StemBegrootWidgetProps & EditFieldProps<StemBegrootWidgetProps>
) {
  const { onFieldChange } = useFieldDebounce(props.onFieldChanged);

  function onSubmit(values: Formdata) {
    props.updateConfig({ ...props, ...values });
  }

  const form = useForm<z.infer<typeof formSchema>>({
    resolver: zodResolver<any>(formSchema),
    defaultValues: {
      displayRanking: props.displayRanking || false,
      displayPriceLabel: props.displayPriceLabel || false,
      showVoteCount: props.showVoteCount || false,
      notEnoughBudgetText: props.notEnoughBudgetText || 'Niet genoeg budget',
      showOriginalResource: props.showOriginalResource || false,
      hideReadMore: props.hideReadMore || false,
      scrollWhenMaxReached: props.scrollWhenMaxReached || false,
      originalResourceUrl: props.originalResourceUrl || '',
      resourceListColumns: props.resourceListColumns || 3,
      showInfoMenu: props.showInfoMenu === undefined ? true : props.showInfoMenu,
      tagTypeTagGroup: props.tagTypeTagGroup || [],
      tagTypeTag: props.tagTypeTag || '',
      tagTypeSelector: props.tagTypeSelector || 'tag',
      hideTagsForResources: props.hideTagsForResources || false,
    },
  });

  const router = useRouter();
  const { project } = router.query;

  const { data: tags } = useTags(project as string);
  const [tagGroupNames, setGroupedNames] = useState<string[]>([]);

  useEffect(() => {
    if (Array.isArray(tags)) {
      const fetchedTags = tags as Array<Tag>;
      const groupNames = _.chain(fetchedTags).map('type').uniq().value();
      setGroupedNames(groupNames);
    }
  }, [tags]);

  const { data } = useProject();
  const voteType = data?.config?.votes?.voteType || 'likes';

  return (
    <div className="p-6 bg-white rounded-md">
      <Form {...form}>
        <Heading size="xl">Weergave opties</Heading>
        <Separator className="my-4" />
        <form
          onSubmit={form.handleSubmit(onSubmit)}
          className="lg:w-2/3 grid grid-cols-1 lg:grid-cols-2 gap-4">
          <FormField
            control={form.control}
            name="displayRanking"
            render={({ field }) => (
              <FormItem className="col-span-1">
                <FormLabel>Weergeef de volgorde</FormLabel>
                {YesNoSelect(field, props)}
                <FormMessage />
              </FormItem>
            )}
          />
          <FormField
            control={form.control}
            name="displayPriceLabel"
            render={({ field }) => (
              <FormItem className="col-span-1">
                <FormLabel>Weergeef het prijslabel</FormLabel>
                {YesNoSelect(field, props)}
                <FormMessage />
              </FormItem>
            )}
          />
          <FormField
            control={form.control}
            name="showVoteCount"
            render={({ field }) => (
              <FormItem className="col-span-1">
                <FormLabel>Weergeef de hoeveelheid stemmen</FormLabel>
                {YesNoSelect(field, props)}
                <FormMessage />
              </FormItem>
            )}
          />

          <FormField
            control={form.control}
            name="notEnoughBudgetText"
            render={({ field }) => (
              <FormItem className="col-span-1">
                <FormLabel>Onbeschikbare buttons</FormLabel>
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
            name="hideReadMore"
            render={({ field }) => (
              <FormItem className="col-span-1">
                <FormLabel>Verberg de &apos;lees meer&apos; knop bij de inzendingen?</FormLabel>
                {YesNoSelect(field, props)}
                <FormMessage />
              </FormItem>
            )}
          />

          <FormField
            control={form.control}
            name="hideTagsForResources"
            render={({ field }) => (
              <FormItem className="col-span-1">
                <FormLabel>
                  Verberg tags bij de inzendingen
                </FormLabel>
                {YesNoSelect(field, props)}
                <FormMessage />
              </FormItem>
            )}
          />

          <FormField
            control={form.control}
            name="showInfoMenu"
            render={({ field }) => (
              <FormItem className="col-span-1">
                <FormLabel>Weergeef teller met informatie</FormLabel>
                <FormDescription>
                  Weergeef een teller met informatie over het aantal geselecteerde inzendingen en de ruimte die nog beschikbaar is.
                </FormDescription>
                {YesNoSelect(field, props)}
                <FormMessage />
              </FormItem>
            )}
          />

          <FormField
            control={form.control}
            name="scrollWhenMaxReached"
            render={({ field }) => (
              <FormItem className="col-span-1">
                <FormLabel>Forceer een scroll</FormLabel>
                <FormDescription>Forceer een scroll naar de bovenkant van het element wanneer het maximaal aantal inzendingen is geselecteerd.</FormDescription>
                {YesNoSelect(field, props)}
                <FormMessage />
              </FormItem>
            )}
          />

          <FormField
            control={form.control}
            name="showOriginalResource"
            render={({ field }) => (
              <FormItem className="col-span-1">
                <FormLabel>Weergeef de URL van de originele inzending</FormLabel>
                {YesNoSelect(field, props)}
                <FormMessage />
              </FormItem>
            )}
          />

          { form.watch('showOriginalResource') &&(
            <FormField
              control={form.control}
              name="originalResourceUrl"
              render={({ field }) => (
                <FormItem className="col-span-1">
                  <FormLabel>
                    URL van de oorspronkelijke inzending
                    <InfoDialog content={'TODO'} />
                  </FormLabel>
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
          )}

          <FormObjectSelectField
            form={form}
            fieldName="resourceListColumns"
            keyForValue="value"
            fieldLabel="Inzendingslijst"
            onFieldChanged={(key, value) => {
              onFieldChange(key, value);
            }}
            items={[{ value: 1 }, { value: 2 }, { value: 3 }]}
          />

          { (voteType === 'countPerTag' || voteType === 'budgetingPerTag') && (
            <>
              <FormField
                control={form.control}
                name="tagTypeSelector"
                render={({ field }) => (
                  <FormItem>
                    <FormLabel>Selecteer de manier waarop er geselecteerd / gebudgetteerd moet worden</FormLabel>
                    <Select
                      value={field.value}
                      onValueChange={field.onChange}>
                      <FormControl>
                        <SelectTrigger>
                          <SelectValue placeholder="Kies type" />
                        </SelectTrigger>
                      </FormControl>
                      <SelectContent>
                        <SelectItem value="tag">
                          Selecteer / budgetteer per tag binnen een tag groep
                        </SelectItem>
                        <SelectItem value="taggroup">
                          Selecteer / budgetteer per tag groep
                        </SelectItem>
                      </SelectContent>
                    </Select>
                    <FormMessage />
                  </FormItem>
                )}
              />

              { form.watch('tagTypeSelector') === 'tag' && (
                <FormField
                  control={form.control}
                  name="tagTypeTag"
                  render={({ field }) => (
                    <FormItem>
                      <FormLabel>Selecteer meerdere taggroepen om te gebruiken</FormLabel>
                      <Select
                        value={field.value}
                        onValueChange={field.onChange}>
                        <FormControl>
                          <SelectTrigger>
                            <SelectValue placeholder="Kies type" />
                          </SelectTrigger>
                        </FormControl>
                        <SelectContent>
                          {tagGroupNames?.map((item, index) => (
                            <SelectItem value={item} key={index}>
                              {item}
                            </SelectItem>
                          ))}
                        </SelectContent>
                      </Select>
                      <FormMessage />
                    </FormItem>
                  )}
                />
              )}

              { form.watch('tagTypeSelector') === 'taggroup' && (
                <FormField
                  control={form.control}
                  name="tagTypeTagGroup"
                  render={() => (
                    <FormItem className="col-span-full">
                      <div>
                        <FormLabel>Selecteer welke taggroepen gebruikt worden</FormLabel>
                      </div>
                      <div className="grid grid-cols-1 gap-x-4 gap-y-2">
                        {tagGroupNames?.map((item, index) => (
                          <FormField
                            key={index}
                            control={form.control}
                            name="tagTypeTagGroup"
                            render={({field}) => {
                              const isChecked = Array.isArray(field.value) && field.value.includes(item);

                              return (
                                <FormItem
                                  key={index}
                                  className="flex flex-column items-start space-x-0 space-y-3">
                                  <div className='flex flex-row items-start space-x-3 space-y-0'>
                                    <FormControl>
                                      <Checkbox
                                        checked={isChecked}
                                        onCheckedChange={(checked) => {
                                          let values = form.getValues('tagTypeTagGroup') || [];

                                          if (checked) {
                                            if (!values.includes(item)) {
                                              values = [...values, item];
                                            }
                                          } else {
                                            values = values.filter(value => value !== item);
                                          }

                                          values = values.filter(value => tagGroupNames.includes(value));

                                          form.setValue('tagTypeTagGroup', values);
                                          props.onFieldChanged('tagTypeTagGroup', values);
                                        }}
                                      />
                                    </FormControl>
                                    <FormLabel className="font-normal">
                                      {item}
                                    </FormLabel>
                                  </div>
                                  <FormMessage/>
                                </FormItem>
                              );
                            }}
                          />
                        )) || null}
                      </div>
                    </FormItem>
                  )}
                />
              )}

            </>
          )}

          <Button type="submit" className="w-fit col-span-full">
          Opslaan
          </Button>
        </form>
      </Form>
    </div>
  );
}
