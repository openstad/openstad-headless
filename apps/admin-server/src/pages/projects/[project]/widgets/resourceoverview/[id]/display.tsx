import { Button } from '@/components/ui/button';
import {
  Form,
  FormControl,
  FormDescription,
  FormField,
  FormItem,
  FormLabel,
  FormMessage,
} from '@/components/ui/form';
import { Separator } from '@/components/ui/separator';
import { Heading } from '@/components/ui/typography';
import { YesNoSelect } from '@/lib/form-widget-helpers';
import { EditFieldProps } from '@/lib/form-widget-helpers/EditFieldProps';
import { zodResolver } from '@hookform/resolvers/zod';
import { MultiProjectResourceOverviewProps } from '@openstad-headless/multi-project-resource-overview/src/multi-project-resource-overview';
import { Input } from '@/components/ui/input';
import { useForm } from 'react-hook-form';
import * as z from 'zod';
import { useFieldDebounce } from '@/hooks/useFieldDebounce';
import {
  Select,
  SelectContent,
  SelectItem,
  SelectTrigger,
  SelectValue,
} from '@/components/ui/select';
import {Checkbox} from "@/components/ui/checkbox";
import {handleTagCheckboxGroupChange} from "@/lib/form-widget-helpers/TagGroupHelper";
import React, {useEffect, useState} from "react";
import useTags from "@/hooks/use-tags";
import _ from "lodash";
const formSchema = z.object({
  displayBanner: z.boolean(),
  displayMap: z.boolean(),
  displayAsTabs: z.boolean(),
  displayTitle: z.boolean(),
  titleMaxLength: z.coerce.number(),
  displayDescription: z.boolean(),
  descriptionMaxLength: z.coerce.number(),
  displaySummary: z.boolean(),
  summaryMaxLength: z.coerce.number(),
  displayStatusLabel: z.boolean(),
  displayArguments: z.boolean(),
  displayVote: z.boolean(),
  bannerText: z.string().optional(),
  displayDocuments: z.boolean(),
  documentsTitle: z.string().optional(),
  documentsDesc: z.string().optional(),
  displayVariant: z.string().optional(),
  applyText: z.string().optional(),
  resetText: z.string().optional(),
  displayLikeButton: z.boolean(),
  clickableImage: z.boolean(),
  displayBudget: z.boolean(),
  displayLocationFilter: z.boolean(),
  listTabTitle: z.string().optional(),
  mapTabTitle: z.string().optional(),
  // displayRanking: z.boolean(),
  // displayLabel: z.boolean(),
  // displayShareButtons: z.boolean(),
  // displayEditLink: z.boolean(),
  // displayCaption: z.boolean(),
  displayOverviewTagGroups: z.boolean().optional(),
  displayTags: z.boolean().optional(),
  overviewTagGroups: z.array(z.string()).optional(),
  dialogTagGroups: z.array(z.string()).optional(),
});

export default function WidgetResourceOverviewDisplay(
  props: MultiProjectResourceOverviewProps &
    EditFieldProps<MultiProjectResourceOverviewProps>
) {
  type FormData = z.infer<typeof formSchema>;
  async function onSubmit(values: FormData) {
    props.updateConfig({ ...props, ...values });
  }

  const { onFieldChange } = useFieldDebounce(props.onFieldChanged);

  const form = useForm<FormData>({
    resolver: zodResolver<any>(formSchema),
    defaultValues: {
      displayBanner: props?.displayBanner || false,
      displayMap: props?.displayMap || false,
      displayAsTabs: props?.displayAsTabs || false,
      displayTitle: props?.displayTitle || false,
      bannerText: props?.bannerText,
      titleMaxLength: props?.titleMaxLength || 20,
      displayDescription: props?.displayDescription || false,
      descriptionMaxLength: props?.descriptionMaxLength || 20,
      displaySummary: props?.displaySummary || false,
      summaryMaxLength: props?.summaryMaxLength || 30,
      displayArguments: props?.displayArguments || false,
      displayVote: props?.displayVote || false,
      displayStatusLabel: props?.displayStatusLabel || false,
      displayDocuments: props?.displayDocuments || false,
      documentsTitle: props?.documentsTitle || '',
      documentsDesc: props?.documentsDesc || '',
      displayVariant: props?.displayVariant,
      applyText: props?.applyText || 'Toepassen',
      resetText: props?.resetText || 'Reset',
      displayLikeButton: props?.displayLikeButton || false,
      clickableImage: props?.clickableImage || false,
      displayBudget: props?.displayBudget !== false,
      displayTags: props?.displayTags !== false,
      displayLocationFilter: props?.displayLocationFilter === true,
      listTabTitle: typeof (props?.listTabTitle) === 'undefined' ? 'Lijst' : props.listTabTitle,
      mapTabTitle: typeof (props?.mapTabTitle) === 'undefined' ? 'Kaart' : props.mapTabTitle,
      displayOverviewTagGroups: props?.displayOverviewTagGroups || false,
      overviewTagGroups: props?.overviewTagGroups  || [],
      dialogTagGroups: props?.dialogTagGroups || [],
      // displayRanking: props?.displayRanking || false,
      // displayLabel: props?.displayLabel || false,
      // displayShareButtons: props?.displayShareButtons || false,
      // displayEditLink: props?.displayEditLink || false,
      // displayCaption: props?.displayCaption || false,
    },
  });

  const { watch } = form;
  const displayBanner = watch('displayBanner');
  const displayMap = watch('displayMap');
  const displayDocuments = watch('displayDocuments');
  const displayAsTabs = watch('displayAsTabs');
  const displayOverviewTagGroups = watch('displayOverviewTagGroups');
  const displayTags = watch('displayTags');

  const { data: tags } = useTags(props.projectId);
  const [tagGroupNames, setGroupedNames] = useState<string[]>([]);

  type Tag = {
    type: string;
  };

  useEffect(() => {
    if (Array.isArray(tags)) {
      const fetchedTags = tags as Array<Tag>;
      const groupNames = _.chain(fetchedTags).map('type').uniq().value();
      setGroupedNames(groupNames);
    }
  }, [tags]);

  // If props.dialogTagGroups is undefined, set it to all tag groups
  useEffect(() => {
    if (displayTags && typeof props.dialogTagGroups === 'undefined' ) {
      const allTagGroups = tagGroupNames;
      form.setValue('dialogTagGroups', allTagGroups);
      props.onFieldChanged('dialogTagGroups', allTagGroups);
    }
  }, [displayTags, tagGroupNames]);

  return (
    <div className="p-6 bg-white rounded-md">
      <Form {...form}>
        <form
          onSubmit={form.handleSubmit(onSubmit)}
          className="lg:w-3/4 grid grid-cols-1 lg:grid-cols-2 gap-x-4 gap-y-8">

            <Heading size="xl">Algemeen</Heading>
            <Separator style={{margin: "-10px 0 0"}} className="my-4 col-span-full" />

            <FormField
              control={form.control}
              name="displayBanner"
              render={({ field }) => (
                <FormItem>
                  <FormLabel>Titel boven het overzicht weergeven?</FormLabel>
                  {YesNoSelect(field, props)}
                  <FormMessage />
                </FormItem>
              )}
            />

            {displayBanner && (
              <FormField
                control={form.control}
                name="bannerText"
                render={({ field }) => (
                  <FormItem>
                    <FormLabel>Titel boven het overzicht</FormLabel>
                    <FormControl>
                      <Input
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

            <FormField
              control={form.control}
              name="applyText"
              render={({ field }) => (
                <FormItem>
                  <FormLabel>
                    Tekst voor het toepassen van de filters
                  </FormLabel>
                  <FormControl>
                    <Input
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
              name="resetText"
              render={({ field }) => (
                <FormItem>
                  <FormLabel>
                    Tekst voor het resetten van de filters
                  </FormLabel>
                  <FormControl>
                    <Input
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
              name="displayMap"
              render={({ field }) => (
                <FormItem>
                  <FormLabel>Kaart weergeven</FormLabel>
                  {YesNoSelect(field, props)}
                  <FormMessage />
                </FormItem>
              )}
            />

          {displayMap && (
            <FormField
              control={form.control}
              name="displayAsTabs"
              render={({ field }) => (
                <FormItem>
                  <FormLabel>
                    Moet de kaart en de lijst als tabs worden weergegeven?
                  </FormLabel>
                  <FormDescription>
                    De huidige weergave is een lijst met de kaart erboven.
                    Als je dit aanvinkt, worden de kaart en de lijst als tabs weergegeven.
                  </FormDescription>
                  {YesNoSelect(field, props)}
                  <FormMessage />
                </FormItem>
              )}
            />
          )}

          { (displayMap && displayAsTabs) && (
            <>
              <FormField
                control={form.control}
                name="listTabTitle"
                render={({ field }) => (
                  <FormItem>
                    <FormLabel>
                      Titel van de lijst tab
                    </FormLabel>
                    <FormControl>
                      <Input
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
                name="mapTabTitle"
                render={({ field }) => (
                  <FormItem>
                    <FormLabel>
                      Titel van de map tab
                    </FormLabel>
                    <FormControl>
                      <Input
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
            </>
          )}

          <FormField
            control={form.control}
            name="displayLocationFilter"
            render={({ field }) => (
              <FormItem>
                <FormLabel>
                  Locatie filter weergeven
                </FormLabel>
                {YesNoSelect(field, props)}
                <FormMessage />
              </FormItem>
            )}
          />

          <FormField
            control={form.control}
            name="displayOverviewTagGroups"
            render={({ field }) => (
              <FormItem>
                <FormLabel>
                  Tags tonen in de tegels in het overzicht
                </FormLabel>
                {YesNoSelect(field, props)}
                <FormMessage />
              </FormItem>
            )}
          />

          { displayOverviewTagGroups && (
            <FormField
              control={form.control}
              name="overviewTagGroups"
              render={() => (
                <FormItem className="col-span-full">
                  <div>
                    <FormLabel>Selecteer van welke tag groepen de tags getoond moeten worden in de tegels
                    </FormLabel>
                  </div>
                  <div className="grid grid-cols-1 lg:grid-cols-3 gap-x-4 gap-y-2 items-center">
                    {(tagGroupNames || []).map((groupName, index) => (
                      <>
                        <FormField
                          key={`parent${groupName}`}
                          control={form.control}
                          name="overviewTagGroups"
                          render={({ field }) => {
                            return (
                              <FormItem
                                key={groupName}
                                className="flex flex-row items-start space-x-3 space-y-0">
                                <FormControl>
                                  <Checkbox
                                    checked={(field.value ?? []).includes(groupName)}
                                    onCheckedChange={(checked: boolean) => {
                                      let updatedFields = field.value ?? [];
                                      if (checked) {
                                        updatedFields = [...updatedFields, groupName];
                                      } else {
                                        updatedFields = updatedFields.filter((name) => name !== groupName);
                                      }
                                      field.onChange(updatedFields);
                                      props.onFieldChanged(field.name, updatedFields);
                                    }}
                                  />
                                </FormControl>
                                <FormLabel className="font-normal">
                                  {groupName}
                                </FormLabel>
                              </FormItem>
                            );
                          }}
                        />

                      </>
                    ))}
                  </div>
                </FormItem>
              )}
            />
          )}


          <Heading size="xl" className="col-span-full mt-6">Tegels</Heading>
          <Separator style={{margin: "-10px 0 0"}} className="my-4 col-span-full" />

          <FormField
            control={form.control}
            name="displayTitle"
            render={({ field }) => (
              <FormItem>
                <FormLabel>Titel inzending weergeven</FormLabel>
                {YesNoSelect(field, props)}
                <FormMessage />
              </FormItem>
            )}
          />

          <FormField
            control={form.control}
            name="titleMaxLength"
            render={({ field }) => (
              <FormItem>
                <FormLabel>
                  Hoeveelheid karakters van de titel die getoond wordt
                </FormLabel>
                <FormControl>
                  <Input
                    type="number"
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
          {/* <FormField
            control={form.control}
            name="displayRanking"
            render={({ field }) => (
              <FormItem>
                <FormLabel>Ranking weergeven</FormLabel>
                {YesNoSelect(field, props)}
                <FormMessage />
              </FormItem>
            )}
          /> */}
          {/* <FormField
            control={form.control}
            name="displayLabel"
            render={({ field }) => (
              <FormItem>
                <FormLabel>Label weergeven</FormLabel>
                {YesNoSelect(field, props)}
                <FormMessage />
              </FormItem>
            )}
          /> */}
          {/* <FormField
            control={form.control}
            name="displaySummary"
            render={({ field }) => (
              <FormItem>
                <FormLabel>Samenvatting weergeven</FormLabel>
                {YesNoSelect(field, props)}
                <FormMessage />
              </FormItem>
            )}
          /> */}


          <FormField
            control={form.control}
            name="displaySummary"
            render={({ field }) => (
              <FormItem>
                <FormLabel>Samenvatting inzending weergeven</FormLabel>
                {YesNoSelect(field, props)}
                <FormMessage />
              </FormItem>
            )}
          />

          <FormField
            control={form.control}
            name="summaryMaxLength"
            render={({ field }) => (
              <FormItem>
                <FormLabel>
                  Hoeveelheid karakters van de samenvatting die getoond wordt
                </FormLabel>
                <FormControl>
                  <Input
                    type="number"
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
            name="displayDescription"
            render={({ field }) => (
              <FormItem>
                <FormLabel>Beschrijving inzending weergeven</FormLabel>
                {YesNoSelect(field, props)}
                <FormMessage />
              </FormItem>
            )}
          />

          <FormField
            control={form.control}
            name="descriptionMaxLength"
            render={({ field }) => (
              <FormItem>
                <FormLabel>
                  Hoeveelheid karakters van de beschrijving die getoond wordt
                </FormLabel>
                <FormControl>
                  <Input
                    type="number"
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
            name="displayArguments"
            render={({ field }) => (
              <FormItem>
                <FormLabel>Hoeveelheid aan argumenten weergeven</FormLabel>
                {YesNoSelect(field, props)}
                <FormMessage />
              </FormItem>
            )}
          />
          <FormField
            control={form.control}
            name="displayVote"
            render={({ field }) => (
              <FormItem>
                <FormLabel>
                  Hoeveelheid stemmen weergeven
                </FormLabel>
                {YesNoSelect(field, props)}
                <FormMessage />
              </FormItem>
            )}
          />

          <FormField
            control={form.control}
            name="displayStatusLabel"
            render={({ field }) => (
              <FormItem>
                <FormLabel>
                  Status label weergeven
                </FormLabel>
                {YesNoSelect(field, props)}
                <FormMessage />
              </FormItem>
            )}
          />


          {/* <FormField
            control={form.control}
            name="displayShareButtons"
            render={({ field }) => (
              <FormItem>
                <FormLabel>Deel knoppen weergeven</FormLabel>
                {YesNoSelect(field, props)}
                <FormMessage />
              </FormItem>
            )}
          /> */}
          {/* <FormField
            control={form.control}
            name="displayEditLink"
            render={({ field }) => (
              <FormItem>
                <FormLabel>Aanpas-link weergeven voor moderators</FormLabel>
                {YesNoSelect(field, props)}
                <FormMessage />
              </FormItem>
            )}
          /> */}

          <FormField
            control={form.control}
            name="displayVariant"
            render={({ field }) => (
              <FormItem>
                <FormLabel>Weergave versie</FormLabel>
                <Select
                  onValueChange={(value) => {
                    field.onChange(value);
                    props.onFieldChanged(field.name, value);
                  }}
                  value={field.value}>
                  <FormControl>
                    <SelectTrigger>
                      <SelectValue placeholder="Selecteer een optie" />
                    </SelectTrigger>
                  </FormControl>
                  <SelectContent>
                    <SelectItem
                      value={'default'}>
                      Standaard
                    </SelectItem>
                    <SelectItem
                      value={'compact'}>
                      Compact (3 koloms)
                    </SelectItem>
                  </SelectContent>
                </Select>
                <FormMessage />
              </FormItem>
            )}
          />

          <Heading size="xl" className="col-span-full mt-6">Dialog</Heading>
          <Separator style={{margin: "-10px 0 0"}} className="my-4 col-span-full" />

          <FormField
            control={form.control}
            name="displayLikeButton"
            render={({ field }) => (
              <FormItem>
                <FormLabel>
                  Like button weergeven in de dialog
                </FormLabel>
                {YesNoSelect(field, props)}
                <FormMessage />
              </FormItem>
            )}
          />

          <FormField
            control={form.control}
            name="displayBudget"
            render={({ field }) => (
              <FormItem>
                <FormLabel>
                  Budget in dialog weergeven
                </FormLabel>
                {YesNoSelect(field, props)}
                <FormMessage />
              </FormItem>
            )}
          />

          <FormField
            control={form.control}
            name="clickableImage"
            render={({ field }) => (
              <FormItem>
                <FormLabel>
                  Moet de afbeelding in de dialog klikbaar zijn?
                </FormLabel>
                <FormDescription>
                  Als je dit aanvinkt, wordt de afbeelding in de dialog klikbaar en wordt de afbeelding geopend in een nieuw tabblad.
                </FormDescription>
                {YesNoSelect(field, props)}
                <FormMessage />
              </FormItem>
            )}
          />

          <FormField
            control={form.control}
            name="displayDocuments"
            render={({ field }) => (
              <FormItem>
                <FormLabel>
                  Geüploade documenten weergeven
                </FormLabel>
                {YesNoSelect(field, props)}
                <FormMessage />
              </FormItem>
            )}
          />

          {displayDocuments && (
            <>
            <FormField
              control={form.control}
              name="documentsTitle"
              render={({ field }) => (
                <FormItem>
                  <FormLabel>
                    Welke titel moet er boven de download knop(pen) komen?
                  </FormLabel>
                  <FormControl>
                    <Input
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
              name="documentsDesc"
              render={({ field }) => (
                <FormItem>
                  <FormLabel>
                    Welke beschrijving moet er boven de download knop(pen) komen?
                  </FormLabel>
                  <FormControl>
                    <Input
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
            </>
          )}

            <FormField
              control={form.control}
              name="displayTags"
              render={({ field }) => (
                <FormItem>
                  <FormLabel>
                    Tags in dialog weergeven
                  </FormLabel>
                  {YesNoSelect(field, props)}
                  <FormMessage />
                </FormItem>
              )}
            />

              { displayTags && (
                <FormField
                  control={form.control}
                  name="dialogTagGroups"
                  render={() => (
                    <FormItem className="col-span-full">
                      <div>
                        <FormLabel>Selecteer van welke tag groepen de tags getoond moeten worden in de dialog
                        </FormLabel>
                      </div>
                      <div className="grid grid-cols-1 lg:grid-cols-3 gap-x-4 gap-y-2 items-center">
                        {(tagGroupNames || []).map((groupName, index) => (
                          <>
                            <FormField
                              key={`parent${groupName}`}
                              control={form.control}
                              name="dialogTagGroups"
                              render={({ field }) => {
                                return (
                                  <FormItem
                                    key={groupName}
                                    className="flex flex-row items-start space-x-3 space-y-0">
                                    <FormControl>
                                      <Checkbox
                                        checked={(field.value ?? []).includes(groupName)}
                                        onCheckedChange={(checked: boolean) => {
                                          let updatedFields = field.value ?? [];
                                          if (checked) {
                                            updatedFields = [...updatedFields, groupName];
                                          } else {
                                            updatedFields = updatedFields.filter((name) => name !== groupName);
                                          }
                                          field.onChange(updatedFields);
                                          props.onFieldChanged(field.name, updatedFields);
                                        }}
                                      />
                                    </FormControl>
                                    <FormLabel className="font-normal">
                                      {groupName}
                                    </FormLabel>
                                  </FormItem>
                                );
                              }}
                            />

                          </>
                        ))}
                      </div>
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
