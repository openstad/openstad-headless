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
import { EditFieldProps } from '@/lib/form-widget-helpers/EditFieldProps';
import { zodResolver } from '@hookform/resolvers/zod';
import {ArrowDown, ArrowUp, X} from 'lucide-react';
import React, { useEffect, useState } from 'react';
import { useForm } from 'react-hook-form';
import * as z from 'zod';
import useTags from "@/hooks/use-tags";
import { useRouter } from "next/router";
import {ImageUploader} from "@/components/image-uploader";
import {useWidgetConfig} from "@/hooks/use-widget-config";
import {Item, Option, ChoiceGuideProps, ChoiceOptions} from '@openstad-headless/choiceguide/src/props';

const weightSchema: z.ZodSchema = z.object({
  weightX: z.string().optional(),
  weightY: z.string().optional(),
  weightAB: z.string().optional(),
  choice: z.record(z.lazy(() => weightSchema)).optional(),
});

const formSchema = z.object({
  trigger: z.string(),
  title: z.string().optional(),
  description: z.string().optional(),
  type: z.string().optional(),
  tags: z.string().optional(),
  fieldRequired: z.boolean().optional(),
  onlyForModerator: z.boolean().optional(),
  minCharacters: z.string().optional(),
  maxCharacters: z.string().optional(),
  variant: z.string().optional(),
  multiple: z.boolean().optional(),
  options: z
    .array(
      z.object({
        trigger: z.string(),
        titles: z.array(z.object({
          text: z.string(),
          key: z.string(),
          weights: z.record(weightSchema).optional()
        }))
      })
    )
    .optional(),
  infoImage: z.string().optional(),
  uploadInfoImage: z.string().optional(),
  showMoreInfo: z.boolean().optional(),
  moreInfoButton: z.string().optional(),
  moreInfoContent: z.string().optional(),
  labelA: z.string().optional(),
  labelB: z.string().optional(),
  sliderTitleUnderA: z.string().optional(),
  sliderTitleUnderB: z.string().optional(),
  explanationA: z.string().optional(),
  explanationB: z.string().optional(),
  imageA: z.string().optional(),
  imageB: z.string().optional(),
  imageUploadA: z.string().optional(),
  imageUploadB: z.string().optional(),
  weights: z.record(weightSchema).optional(),
});


export default function WidgetChoiceGuideItems(
  props: ChoiceGuideProps & EditFieldProps<ChoiceGuideProps>
) {
  type FormData = z.infer<typeof formSchema>;
  const [items, setItems] = useState<Item[]>([]);
  const [options, setOptions] = useState<Option[]>([]);
  const [selectedItem, setItem] = useState<Item | null>(null);
  const [selectedOption, setOption] = useState<Option | null>(null);
  const [settingOptions, setSettingOptions] = useState<boolean>(false);
  const [activeTab, setActiveTab] = useState<string>('1');
  const [dimensions, setDimensions] = useState<string[]>([]);

  const {
    data: widget
  } = useWidgetConfig<any>();

  const router = useRouter();
  const { project } = router.query;

  const { data: allTags } = useTags(project as string);
  const firstTagType = allTags?.[0]?.type ?? '';

  // adds item to items array if no item is selected, otherwise updates the selected item
  async function onSubmit(values: FormData) {
    if (selectedItem) {

      // Ensure weights are defined
      const selectedItemWeights = selectedItem.weights || {};
      const valuesWeights = values.weights || {};

      Object.keys(valuesWeights).forEach((key) => {
        if (valuesWeights[key] !== undefined) {
          selectedItemWeights[key] = valuesWeights[key];
        }
      });

      setItems((currentItems) =>
          currentItems.map((item) =>
              item.trigger === selectedItem.trigger ? { ...item, ...values, weights: selectedItemWeights } : item
          )
      );
      setItem(null);
    } else {
      setItems((currentItems) => [
        ...currentItems,
        {
          trigger: `${currentItems.length > 0 ? parseInt(currentItems[currentItems.length - 1].trigger) + 1 : 1}`,
          title: values.title,
          description: values.description,
          type: values.type,
          fieldRequired: values.fieldRequired || false,
          minCharacters: values.minCharacters,
          maxCharacters: values.maxCharacters,
          variant: values.variant || 'text input',
          multiple: values.multiple || false,
          options: values.options || [],
          showMoreInfo: values.showMoreInfo || false,
          moreInfoButton: values.moreInfoButton || '',
          moreInfoContent: values.moreInfoContent || '',
          infoImage: values.infoImage || '',
          labelA: values.labelA || '',
          labelB: values.labelB || '',
          sliderTitleUnderA: values.sliderTitleUnderA || '',
          sliderTitleUnderB: values.sliderTitleUnderB || '',
          explanationA: values.explanationA || '',
          explanationB: values.explanationB || '',
          imageA: values.imageA || '',
          imageB: values.imageB || '',
          weights: values.weights || {}
        },
      ]);
    }
    form.reset(defaults);
    setOptions([]);
    setActiveTab("1");
  }

  // adds link to options array if no option is selected, otherwise updates the selected option
  function handleAddOption(values: FormData) {
    if (selectedOption) {
      setOptions((currentOptions) =>
        currentOptions.map((option) =>
          option.trigger === selectedOption.trigger
            ? {
              ...option,
              titles:
                values.options?.find((o) => o.trigger === option.trigger)
                  ?.titles || [],
            }
            : option
        )
      );
      setOption(null);
    } else {
      const newOption = {
        trigger: `${options.length > 0
          ? parseInt(options[options.length - 1].trigger) + 1
          : 0
        }`,
        titles: values.options?.[values.options.length - 1].titles || [],
      };
      setOptions((currentOptions) => [...currentOptions, newOption]);
    }
  }

  const defaults = () => ({
    trigger: '0',
    title: '',
    description: '',
    type: '',
    fieldRequired: false,
    minCharacters: '',
    maxCharacters: '',
    variant: 'text input',
    multiple: false,
    options: [],
    infoImage: '',
    showMoreInfo: false,
    moreInfoButton: '',
    moreInfoContent: '',
    labelA: '',
    labelB: '',
    sliderTitleUnderA: '',
    sliderTitleUnderB: '',
    explanationA: '',
    explanationB: '',
    imageA: '',
    imageB: '',
    weights: {}
  });

  const form = useForm<FormData>({
    resolver: zodResolver<any>(formSchema),
    defaultValues: defaults(),
  });

  useEffect(() => {
    if (props?.items && props?.items?.length > 0) {
      setItems(props?.items);
    }
  }, [props?.items]);

  const { onFieldChanged } = props;
  useEffect(() => {
    onFieldChanged('items', items);
  }, [items]);

  // Sets form to selected item values when item is selected
  useEffect(() => {
    if (selectedItem) {
      form.reset({
        trigger: selectedItem.trigger,
        title: selectedItem.title || '',
        description: selectedItem.description || '',
        type: selectedItem.type || '',
        tags: selectedItem.tags || firstTagType,
        options: selectedItem.options || [],
        fieldRequired: selectedItem.fieldRequired || false,
        onlyForModerator: selectedItem.onlyForModerator || false,
        minCharacters: selectedItem.minCharacters || '',
        maxCharacters: selectedItem.maxCharacters || '',
        variant: selectedItem.variant || '',
        multiple: selectedItem.multiple || false,
        showMoreInfo: selectedItem.showMoreInfo || false,
        moreInfoButton: selectedItem.moreInfoButton || '',
        moreInfoContent: selectedItem.moreInfoContent || '',
        infoImage: selectedItem.infoImage || '',
        labelA: selectedItem.labelA || '',
        labelB: selectedItem.labelB || '',
        sliderTitleUnderA: selectedItem.sliderTitleUnderA || '',
        sliderTitleUnderB: selectedItem.sliderTitleUnderB || '',
        explanationA: selectedItem.explanationA || '',
        explanationB: selectedItem.explanationB || '',
        imageA: selectedItem.imageA || '',
        imageB: selectedItem.imageB || '',
        weights: selectedItem.weights || {}
      });
      setOptions(selectedItem.options || []);
      setActiveTab('1');
    }
  }, [selectedItem, form]);

  useEffect(() => {
    if (selectedOption) {
      const updatedOptions = [...options];
      const index = options.findIndex(
        (option) => option.trigger === selectedOption.trigger
      );
      updatedOptions[index] = { ...selectedOption };

      // Use form.reset to update the entire form state
      form.reset({
        ...form.getValues(), // Retains the current values of other fields
        options: updatedOptions,
      });
    }
  }, [selectedOption, form, options]);

  const handleAction = (
    actionType: 'moveUp' | 'moveDown' | 'delete',
    clickedTrigger: string,
    isItemAction: boolean // Determines if the action is for items or options
  ) => {
    if (isItemAction) {
      setItems((currentItems) => {
        return handleMovementOrDeletion(
          currentItems,
          actionType,
          clickedTrigger
        ) as Item[];
      });
    } else {
      setOptions((currentLinks) => {
        return handleMovementOrDeletion(
          currentLinks,
          actionType,
          clickedTrigger
        ) as Option[];
      });
    }
  };

  // This is a helper function to handle moving up, moving down, or deleting an entry
  function handleMovementOrDeletion(
    list: Array<Item | Option>,
    actionType: 'moveUp' | 'moveDown' | 'delete',
    trigger: string
  ) {
    const index = list.findIndex((entry) => entry.trigger === trigger);

    if (actionType === 'delete') {
      return list.filter((entry) => entry.trigger !== trigger);
    }

    if (
      (actionType === 'moveUp' && index > 0) ||
      (actionType === 'moveDown' && index < list.length - 1)
    ) {
      const newItemList = [...list];
      const swapIndex = actionType === 'moveUp' ? index - 1 : index + 1;
      let tempTrigger = newItemList[swapIndex].trigger;
      newItemList[swapIndex].trigger = newItemList[index].trigger;
      newItemList[index].trigger = tempTrigger;
      return newItemList;
    }

    return list; // If no action is performed, return the original list
  }

  useEffect(() => {
    const chosenType = form.watch('type') || "";
    const chosenConfig = widget?.config?.choiceGuide?.choicesType || 'default';

    let dimensions = chosenConfig === 'plane'
      ? ['X', 'Y']
      : ['X'];

    const typeWithoutDimension = ['none', 'map', 'imageUpload', 'documentUpload', 'text'].includes(chosenType);

    const finalDimensions = (chosenConfig === 'hidden' || typeWithoutDimension) ? [] : dimensions;

    if ( finalDimensions.length > 0 ) {
      form.setValue( 'weights', {} );
    }

    setDimensions( finalDimensions )
  }, [ form.watch('type') ])

  function handleSaveItems() {
    props.updateConfig({ ...props, items });
    window.location.reload();
  }

  const hasOptions = () => {
    switch (form.watch('type')) {
      case 'checkbox':
      case 'select':
      case 'radiobox':
        return true;
      default:
        return false;
    }
  };

  const hasList = () => {
    switch (form.watch('type')) {
      case 'checkbox':
      case 'select':
      case 'radiobox':
        return true;
      default:
        return false;
    }
  };

  function resetForm() {
    form.reset(defaults());
    setOptions([]);
    setItem(null);
  }

  function handleSaveOptions() {
    form.setValue('options', options);
    setSettingOptions(false);
  }

  return (
    <div>
      {/* <ImageUploader /> */}
      <Form {...form}>
        <form
          onSubmit={form.handleSubmit(onSubmit)}
          className="w-full grid gap-4">
          <div className="lg:w-full grid grid-cols-1 gap-x-6 lg:grid-cols-3">
            <div className="p-6 bg-white rounded-md flex flex-col justify-between">
              <div>
                <Heading size="xl">Lijst van huidige items</Heading>
                <Separator className="my-4" />
                <div className="flex flex-col gap-1">
                  {items.length > 0
                    ? items
                      .sort(
                        (a, b) => parseInt(a.trigger) - parseInt(b.trigger)
                      )
                      .map((item, index) => (
                        <div
                          key={index}
                          className={`flex cursor-pointer justify-between border border-secondary ${item.trigger == selectedItem?.trigger &&
                          'bg-secondary'
                          }`}>
                                                    <span className="flex gap-2 py-3 px-2">
                                                        <ArrowUp
                                                          className="cursor-pointer"
                                                          onClick={() =>
                                                            handleAction('moveUp', item.trigger, true)
                                                          }
                                                        />
                                                        <ArrowDown
                                                          className="cursor-pointer"
                                                          onClick={() =>
                                                            handleAction('moveDown', item.trigger, true)
                                                          }
                                                        />
                                                    </span>
                          <span
                            className="gap-2 py-3 px-2 w-full"
                            onClick={() => setItem(item)}>
                                                        {`${item.title || 'Geen titel'}`}
                                                    </span>
                          <span className="gap-2 py-3 px-2">
                                                        <X
                                                          className="cursor-pointer"
                                                          onClick={() =>
                                                            handleAction('delete', item.trigger, true)
                                                          }
                                                        />
                                                    </span>
                        </div>
                      ))
                    : 'Geen items'}
                </div>
              </div>
              <div className="flex gap-2">
                <Button
                  className="w-fit mt-4"
                  type="button"
                  onClick={() => handleSaveItems()}>
                  Configuratie opslaan
                </Button>
              </div>
            </div>

            {settingOptions ? (
              <div className="p-6 bg-white rounded-md col-span-2 grid grid-cols-1 lg:grid-cols-2 gap-x-6">
                <div className="flex flex-col justify-between">
                  <div className="flex flex-col gap-y-2">
                    <Heading size="xl">Antwoordopties</Heading>
                    <Separator className="mt-2" />
                    {hasList() && (
                      <>
                        <FormField
                          control={form.control}
                          name={`options.${options.length - 1}.titles.0.key`}
                          render={({ field }) => (
                            <FormItem>
                              <FormLabel>Optie key</FormLabel>
                              <Input {...field} />
                              <FormMessage />
                            </FormItem>
                          )}
                        />
                        <FormField
                          control={form.control}
                          name={`options.${options.length - 1}.titles.0.text`}
                          render={({ field }) => (
                            <FormItem>
                              <FormLabel>Optie tekst</FormLabel>
                              <Input {...field} />
                              <FormMessage />
                            </FormItem>
                          )}
                        />
                      </>
                    )}

                    <Button
                      className="w-full bg-secondary text-black hover:text-white mt-4"
                      type="button"
                      onClick={() => handleAddOption(form.getValues())}>
                      {selectedOption
                        ? 'Sla wijzigingen op'
                        : 'Voeg optie toe aan lijst'}
                    </Button>
                  </div>
                  <div className="flex gap-2">
                    <Button
                      className="w-fit mt-4 bg-secondary text-black hover:text-white"
                      type="button"
                      onClick={() => {
                        setSettingOptions(() => !settingOptions),
                          setOption(null),
                          setOptions([]);
                      }}>
                      Annuleer
                    </Button>
                    <Button
                      className="w-fit mt-4"
                      type="button"
                      onClick={() => handleSaveOptions()}>
                      Sla antwoordopties op
                    </Button>
                  </div>
                </div>
                {hasList() && (
                  <div>
                    <Heading size="xl">Lijst van antwoordopties</Heading>
                    <Separator className="my-4" />
                    <div className="flex flex-col gap-1">
                      {options.length > 0
                        ? options
                          .sort(
                            (a, b) =>
                              parseInt(a.trigger) - parseInt(b.trigger)
                          )
                          .map((option, index) => (
                            <div
                              key={index}
                              className={`flex cursor-pointer justify-between border border-secondary ${option.trigger == selectedOption?.trigger &&
                              'bg-secondary'
                              }`}>
                                                            <span className="flex gap-2 py-3 px-2">
                                                                <ArrowUp
                                                                  className="cursor-pointer"
                                                                  onClick={() =>
                                                                    handleAction(
                                                                      'moveUp',
                                                                      option.trigger,
                                                                      false
                                                                    )
                                                                  }
                                                                />
                                                                <ArrowDown
                                                                  className="cursor-pointer"
                                                                  onClick={() =>
                                                                    handleAction(
                                                                      'moveDown',
                                                                      option.trigger,
                                                                      false
                                                                    )
                                                                  }
                                                                />
                                                            </span>
                              <span
                                className="py-3 px-2 w-full"
                                onClick={() => setOption(option)}>
                                                                {option?.titles?.[0].text}
                                                            </span>
                              <span className="py-3 px-2">
                                                                <X
                                                                  className="cursor-pointer"
                                                                  onClick={() =>
                                                                    handleAction(
                                                                      'delete',
                                                                      option.trigger,
                                                                      false
                                                                    )
                                                                  }
                                                                />
                                                            </span>
                            </div>
                          ))
                        : 'Geen options'}
                    </div>
                  </div>
                )}
              </div>
            ) : (
              <div className="p-0 bg-transparent rounded-md flex flex-col justify-start col-span-2">
                <div className="w-full px-4 py-3 bg-white border-b-0 mb-4 rounded-md improvised-tab-list flex gap-4">
                  <button
                    type="button"
                    className={`
                      improvised-tabs 
                      px-2
                      ${activeTab === '1' ? 'active' : ''}`
                    }
                    onClick={() => setActiveTab('1')}
                    style={{
                      color: (activeTab === '1') ? 'hsl(222,84%,5%)' : 'rgb(100, 116, 139)',
                      fontSize: '14px'
                  }}
                  >
                    Instellingen & content
                  </button>
                  { dimensions.length > 0 && (
                    <button
                      type="button"
                      className={`
                        improvised-tabs 
                        px-2
                        ${activeTab === '2' ? 'active' : ''}`
                      }
                      onClick={() => setActiveTab('2')}
                      style={{
                        color: (activeTab === '2') ? 'hsl(222,84%,5%)' : 'rgb(100, 116, 139)',
                        fontSize: '14px'
                      }}
                    >
                      Weging
                    </button>
                  )}
                </div>

                <div className="p-6 bg-white rounded-md flex flex-col justify-between col-span-2">
                  <div style={{display: (activeTab === '1') ? 'block' : 'none'}}>
                    <Heading size="xl">Keuzewijzer items</Heading>
                    <Separator className="my-4" />
                    <div className="w-full flex flex-col gap-y-4">
                      <FormField
                        control={form.control}
                        name="type"
                        render={({ field }) => (
                          <FormItem>
                            <FormLabel>Type antwoorden</FormLabel>
                            <Select
                              value={field.value}
                              onValueChange={field.onChange}>
                              <FormControl>
                                <SelectTrigger>
                                  <SelectValue placeholder="Kies type" />
                                </SelectTrigger>
                              </FormControl>
                              <SelectContent>
                                <SelectItem value="none">Informatie blok</SelectItem>
                                <SelectItem value="radiobox">Radio buttons</SelectItem>
                                <SelectItem value="text">Tekstveld</SelectItem>
                                <SelectItem value="checkbox">Checkboxes</SelectItem>
                                <SelectItem value="map">Locatie</SelectItem>
                                <SelectItem value="imageUpload">Afbeelding upload</SelectItem>
                                <SelectItem value="documentUpload">Document upload</SelectItem>
                                <SelectItem value="select">Dropdown</SelectItem>
                                <SelectItem value="a-b-slider">Van A naar B slider</SelectItem>
                              </SelectContent>
                            </Select>
                            <FormMessage />
                          </FormItem>
                        )}></FormField>
                      <FormField
                        control={form.control}
                        name="trigger"
                        render={({ field }) => (
                          <FormItem>
                            <Input type="hidden" {...field} />
                            <FormMessage />
                          </FormItem>
                        )}
                      />
                      <FormField
                        control={form.control}
                        name="title"
                        render={({ field }) => (
                          <FormItem>
                            <FormLabel>Titel/Vraag</FormLabel>
                            <Input {...field} />
                            <FormMessage />
                          </FormItem>
                        )}
                      />
                      <FormField
                        control={form.control}
                        name="description"
                        render={({ field }) => (
                          <FormItem>
                            <FormLabel>Beschrijving</FormLabel>
                            <Textarea rows={6} {...field} />
                            <FormMessage />
                          </FormItem>
                        )}
                      />

                      <div className="col-span-full md:col-span-1 flex flex-col">
                        <ImageUploader
                          form={form}
                          imageLabel="Upload een afbeelding voor boven de vraag"
                          fieldName="uploadInfoImage"
                          description="Let op: de afbeelding wordt afgesneden op 300px hoogte. Het is handig om de afbeelding op voorhand zelf bij te snijden tot deze hoogte."
                          allowedTypes={["image/*"]}
                          onImageUploaded={(imageResult) => {
                            const result = typeof (imageResult.url) !== 'undefined' ? imageResult.url : '';
                            form.setValue('infoImage', result);
                            form.resetField('uploadInfoImage')
                          }}
                        />
                      </div>

                      <div className="col-span-full md:col-span-1 flex flex-col my-2">
                        {!!form.watch('infoImage') && (
                          <>
                            <label className="text-sm font-medium leading-none peer-disabled:cursor-not-allowed peer-disabled:opacity-70">Afbeelding boven de vraag</label>
                            <section className="grid col-span-full grid-cols-3 gap-x-4 gap-y-8 ">
                                <div style={{ position: 'relative' }}>
                                  <img src={form.watch('infoImage')} alt={form.watch('infoImage')} />
                                  <Button
                                    color="red"
                                    onClick={() => {
                                      form.setValue('infoImage', '');
                                    }}
                                    style={{
                                      position: 'absolute',
                                      right: 0,
                                      top: 0,
                                    }}>
                                    <X size={24} />
                                  </Button>
                                </div>
                            </section>
                          </>
                        )}
                      </div>

                      <FormField
                        control={form.control}
                        name="showMoreInfo"
                        render={({ field }) => (
                          <FormItem>
                            <FormLabel>
                              Extra info
                            </FormLabel>
                            <FormDescription>
                              Wil je een blok met uitklapbare tekst toevoegen? (bijvoorbeeld met extra uitleg)
                            </FormDescription>
                            <Select
                              onValueChange={(e: string) => field.onChange(e === 'true')}
                              value={field.value ? 'true' : 'false'}
                            >
                              <FormControl>
                                <SelectTrigger>
                                  <SelectValue placeholder="Kies een optie" />
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

                      { form.watch("showMoreInfo") && (
                        <>
                          <FormField
                            control={form.control}
                            name="moreInfoButton"
                            render={({field}) => (
                              <FormItem>
                                <FormLabel>Meer informatie knop tekst</FormLabel>
                                <Input {...field} />
                                <FormMessage/>
                              </FormItem>
                            )}
                          />

                          <FormField
                            control={form.control}
                            name="moreInfoContent"
                            render={({field}) => (
                              <FormItem>
                                <FormLabel>Meer informatie tekst</FormLabel>
                                <Textarea rows={5} {...field} />
                                <FormMessage/>
                              </FormItem>
                            )}
                          />
                        </>
                      )}

                      {form.watch('type') !== 'none' && (
                        <FormField
                          control={form.control}
                          name="fieldRequired"
                          render={({ field }) => (
                              <FormItem>
                                <FormLabel>
                                  Is dit veld verplicht?
                                </FormLabel>
                                <Select
                                  onValueChange={(e: string) => field.onChange(e === 'true')}
                                  value={field.value ? 'true' : 'false'}
                                >
                                  <FormControl>
                                    <SelectTrigger>
                                      <SelectValue placeholder="Kies een optie" />
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
                      )}
                      {form.watch('type') === 'text' && (
                        <>
                          <FormField
                            control={form.control}
                            name="variant"
                            render={({ field }) => (
                              <FormItem>
                                <FormLabel>Is het veld qua grootte 1 regel of een tekstvak?</FormLabel>
                                <Select
                                  value={field.value || 'text input'}
                                  onValueChange={field.onChange}>
                                  <FormControl>
                                    <SelectTrigger>
                                      <SelectValue placeholder="Kies een optie" />
                                    </SelectTrigger>
                                  </FormControl>
                                  <SelectContent>
                                    <SelectItem value="text input">1 regel</SelectItem>
                                    <SelectItem value="textarea">Tekstvak</SelectItem>
                                  </SelectContent>
                                </Select>
                                <FormMessage />
                              </FormItem>
                            )}
                          />
                            <>
                              <FormField
                                control={form.control}
                                name="minCharacters"
                                render={({ field }) => (
                                  <FormItem>
                                    <FormLabel>Minimaal aantal tekens</FormLabel>
                                    <Input {...field} />
                                    <FormMessage />
                                  </FormItem>
                                )}
                              />
                              <FormField
                                control={form.control}
                                name="maxCharacters"
                                render={({ field }) => (
                                  <FormItem>
                                    <FormLabel>Maximaal aantal tekens</FormLabel>
                                    <Input {...field} />
                                    <FormMessage />
                                  </FormItem>
                                )}
                              />
                            </>
                        </>
                      )}

                      { (form.watch('type') === 'imageUpload' || form.watch('type') === 'documentUpload') && (
                        <FormField
                          control={form.control}
                          name="multiple"
                          render={({ field }) => (
                            <FormItem>
                              <FormLabel>Mogen er meerdere {form.watch('type') === 'documentUpload' ? 'documenten' : 'afbeeldingen'} tegelijkertijd geüpload worden?</FormLabel>
                              <Select
                                onValueChange={(e: string) => field.onChange(e === 'true')}
                                value={field.value ? 'true' : 'false'}>
                                <FormControl>
                                  <SelectTrigger>
                                    <SelectValue placeholder="Kies een optie" />
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
                      )}

                      {form.watch('type') === 'a-b-slider' && (
                        <div className="col-span-full grid-cols-2 grid gap-4 gap-y-4">
                        <FormField
                          control={form.control}
                          name="labelA"
                          render={({ field }) => (
                            <FormItem>
                              <FormLabel>Label voor A</FormLabel>
                              <FormControl>
                                <Input {...field} />
                              </FormControl>
                              <FormMessage />
                            </FormItem>
                          )}
                        />

                        <FormField
                        control={form.control}
                        name="labelB"
                        render={({ field }) => (
                        <FormItem>
                        <FormLabel>Label voor B</FormLabel>
                        <FormControl>
                        <Input {...field} />
                        </FormControl>
                        <FormMessage />
                        </FormItem>
                        )}
                        />

                        <FormField
                        control={form.control}
                        name="sliderTitleUnderA"
                        render={({ field }) => (
                        <FormItem>
                        <FormLabel>Label onder slider A</FormLabel>
                        <FormControl>
                        <Input {...field} />
                        </FormControl>
                        <FormMessage />
                        </FormItem>
                        )}
                        />

                        <FormField
                        control={form.control}
                        name="sliderTitleUnderB"
                        render={({ field }) => (
                        <FormItem>
                        <FormLabel>Label onder slider B</FormLabel>
                        <FormControl>
                        <Input {...field} />
                        </FormControl>
                        <FormMessage />
                        </FormItem>
                        )}
                        />

                        <FormField
                        control={form.control}
                        name="explanationA"
                        render={({ field }) => (
                        <FormItem>
                        <FormLabel>Uitleg bij A</FormLabel>
                        <FormControl>
                        <Input {...field} />
                        </FormControl>
                        <FormMessage />
                        </FormItem>
                        )}
                        />

                        <FormField
                        control={form.control}
                        name="explanationB"
                        render={({ field }) => (
                        <FormItem>
                        <FormLabel>Uitleg bij B</FormLabel>
                        <FormControl>
                        <Input {...field} />
                        </FormControl>
                        <FormMessage />
                        </FormItem>
                        )}
                        />

                          <div className="col-span-full md:col-span-1 flex flex-col">
                            <ImageUploader
                              form={form}
                              imageLabel="Upload hier afbeelding A"
                              fieldName="imageUploadA"
                              allowedTypes={["image/*"]}
                              onImageUploaded={(imageResult) => {
                                const result = typeof (imageResult.url) !== 'undefined' ? imageResult.url : '';
                                form.setValue('imageA', result);
                                form.resetField('imageUploadA')
                              }}
                            />
                          </div>

                          <div className="col-span-full md:col-span-1 flex flex-col">
                            <ImageUploader
                              form={form}
                              imageLabel="Upload hier afbeelding B"
                              fieldName="imageUploadB"
                              allowedTypes={["image/*"]}
                              onImageUploaded={(imageResult) => {
                                const result = typeof (imageResult.url) !== 'undefined' ? imageResult.url : '';
                                form.setValue('imageB', result);
                                form.resetField('imageUploadB')
                              }}
                            />
                          </div>

                          <div className="col-span-full md:col-span-1 flex flex-col my-2">
                            {!!form.watch('imageA') && (
                              <>
                                <label className="text-sm font-medium leading-none peer-disabled:cursor-not-allowed peer-disabled:opacity-70">Afbeelding A</label>
                                <section className="grid col-span-full grid-cols-3 gap-x-4 gap-y-8 ">
                                    <div style={{ position: 'relative' }}>
                                      <img src={form.watch('imageA')} alt={form.watch('imageA')} />
                                      <Button
                                        color="red"
                                        onClick={() => {
                                          form.setValue('imageA', '');
                                        }}
                                        style={{
                                          position: 'absolute',
                                          right: 0,
                                          top: 0,
                                        }}>
                                        <X size={24} />
                                      </Button>
                                    </div>
                                </section>
                              </>
                            )}
                          </div>

                          <div className="col-span-full md:col-span-1 flex flex-col my-2">
                            {!!form.watch('imageB') && (
                              <>
                                <label className="text-sm font-medium leading-none peer-disabled:cursor-not-allowed peer-disabled:opacity-70">Afbeelding B</label>
                                <section className="grid col-span-full grid-cols-3 gap-x-4 gap-y-8 ">
                                    <div style={{ position: 'relative' }}>
                                      <img src={form.watch('imageB')} alt={form.watch('imageB')} />
                                      <Button
                                        color="red"
                                        onClick={() => {
                                          form.setValue('imageB', '');
                                        }}
                                        style={{
                                          position: 'absolute',
                                          right: 0,
                                          top: 0,
                                        }}>
                                        <X size={24} />
                                      </Button>
                                    </div>
                                </section>
                              </>
                            )}
                          </div>
                        </div>
                      )}

                      {hasOptions() && (
                        <FormItem>
                          <Button
                            className="w-fit mt-4 bg-secondary text-black hover:text-white"
                            type="button"
                            onClick={() => setSettingOptions(!settingOptions)}>
                            {`Antwoordopties (${options.length}) aanpassen`}
                          </Button>
                          <FormMessage />
                        </FormItem>
                      )}
                    </div>
                </div>

                <div className="p-0" style={{display: (activeTab === '2') ? 'block' : 'none'}} >
                  <div className="p-6 bg-white rounded-md flex flex-col justify-between col-span-2">
                    <Heading size="xl">Bepaal de weging per vraaggroep</Heading>
                    <Separator className="my-4" />
                    <div className={`w-full col-span-full grid-cols-${dimensions.length + (form.watch('type') === 'a-b-slider' ? 2 : 1)} grid gap-2 gap-y-2`} >
                      <Heading size="lg">Vraaggroep titel</Heading>
                      {dimensions.length > 0 && dimensions.map((XY, i) => (
                        <Heading key={i} size="lg">Weging {XY}</Heading>
                      ))}

                      {form.watch('type') === 'a-b-slider' && (
                        <Heading size="lg">Weging A of B</Heading>
                      )}

                    </div>
                    <div className="w-full mt-4 flex flex-col gap-y-4">
                      {['checkbox', 'radiobox', 'select'].includes(form.watch('type') || "") ? (
                        <>
                          {widget?.config?.choiceOption?.choiceOptions?.map((singleGroup: ChoiceOptions, index: number) => (

                            <div key={index} className="w-full col-span-full grid-cols-1 grid">
                              <Heading size="lg" className="mt-3">
                                {singleGroup.title}
                              </Heading>
                              <div className={`w-full col-span-full grid-cols-${dimensions.length + (form.watch('type') === 'a-b-slider' ? 2 : 1)} grid gap-2 gap-y-2 items-center`} key={index}>

                                {options.length > 0 && options.map((option, j) => (
                                  <React.Fragment key={j}>
                                    <p>
                                      {option.titles[0].text}
                                    </p>

                                  {dimensions.length > 0 && dimensions.map((XY, i) => (
                                    <FormField
                                      control={form.control}
                                      name={`weights.${singleGroup.id}.choice.${option.titles[0].text}.weight${XY}`}
                                      key={i}
                                      render={({ field }) => (
                                        <FormItem>
                                          <FormControl>
                                            <div className={`weight-${XY.toLowerCase()}-container`}>
                                              <Input
                                                type="number"
                                                min={0}
                                                max={100}
                                                {...field}
                                                value={ field.value ?? 0 }
                                                />
                                              </div>
                                              </FormControl>
                                              <FormMessage />
                                            </FormItem>
                                          )}
                                        />
                                      ))}
                                  </React.Fragment>
                                ))}
                              </div>
                            </div>
                          ))}
                        </>
                      ) : (
                        <>
                          {widget?.config?.choiceOption?.choiceOptions?.map((singleGroup: ChoiceOptions, index: number) => (
                            <div className={`w-full col-span-full grid-cols-${dimensions.length + (form.watch('type') === 'a-b-slider' ? 2 : 1)} grid gap-2 gap-y-2 items-center`} key={index}>
                              <p>
                                {singleGroup.title}
                              </p>
                              {dimensions.length > 0 && dimensions.map((XY, i) => (
                                  <>
                                    <FormField
                                      control={form.control}
                                      name={`weights.${singleGroup.id}.weight${XY}`}
                                      key={i}
                                      render={({ field }) => {
                                        const value = field.value ?? 0;
                                        const watchValue = form.watch(`weights.${singleGroup.id}.weight${XY}`);

                                        if ( value !== watchValue ) {
                                          form.setValue(`weights.${singleGroup.id}.weight${XY}`, field.value ?? 0);
                                        }

                                        return (
                                            <FormItem>
                                              <FormControl>
                                                <div className={`weight-${XY.toLowerCase()}-container`}>
                                                  <Input
                                                      type="number"
                                                      min={0}
                                                      max={100}
                                                      {...field}
                                                      value={field.value ?? 0}
                                                  />
                                                </div>
                                              </FormControl>
                                              <FormMessage/>
                                            </FormItem>
                                        )
                                      }}
                                    />
                                    <FormField
                                      control={form.control}
                                      name={`weights.${singleGroup.id}.weightAB`}
                                      key={i}
                                      render={({ field }) => {
                                        const value = field.value || 'A';
                                        const watchValue = form.watch(`weights.${singleGroup.id}.weightAB`);

                                        if ( value !== watchValue ) {
                                          form.setValue(`weights.${singleGroup.id}.weightAB`, field.value || 'A');
                                        }

                                        return (
                                            <FormItem>
                                              <FormControl>
                                                <Select
                                                    onValueChange={(e: string) => field.onChange(e)}
                                                    value={field.value || 'A'}
                                                >
                                                  <FormControl>
                                                    <SelectTrigger>
                                                      <SelectValue placeholder="Kies een optie"/>
                                                    </SelectTrigger>
                                                  </FormControl>
                                                  <SelectContent>
                                                    <SelectItem value="A">A</SelectItem>
                                                    <SelectItem value="B">B</SelectItem>
                                                  </SelectContent>
                                                </Select>
                                              </FormControl>
                                              <FormMessage/>
                                            </FormItem>
                                        )
                                      }}
                                      />
                                  </>
                              ))}
                            </div>
                          ))}
                        </>
                      )}
                    </div>
                  </div>
                </div>

                <div className="flex gap-2">
                  {selectedItem && (
                    <Button
                      className="w-fit mt-4 bg-secondary text-black hover:text-white"
                      type="button"
                      onClick={() => {
                        resetForm();
                        setActiveTab('1');
                      }}>
                      Annuleer
                    </Button>
                  )}
                  <Button className="w-fit mt-4" type="submit">
                    {selectedItem
                      ? 'Sla wijzigingen op'
                      : 'Voeg item toe aan lijst'}
                  </Button>
                </div>
              </div>
            </div>
            )}
          </div>
        </form>
      </Form>
    </div>
  );
}
