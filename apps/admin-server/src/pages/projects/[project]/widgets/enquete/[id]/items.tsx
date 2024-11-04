import { ImageUploader } from '@/components/image-uploader';
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
import { EnqueteWidgetProps } from '@openstad-headless/enquete/src/enquete';
import { Item, Option } from '@openstad-headless/enquete/src/types/enquete-props';
import { ArrowDown, ArrowUp, X } from 'lucide-react';
import React, { useEffect, useState } from 'react';
import { useForm } from 'react-hook-form';
import * as z from 'zod';
import InfoDialog from '@/components/ui/info-hover';
import { Checkbox } from "@/components/ui/checkbox";

const formSchema = z.object({
  trigger: z.string(),
  title: z.string().optional(),
  key: z.string(),
  description: z.string().optional(),
  questionType: z.string().optional(),
  fieldKey: z.string(),
  minCharacters: z.string().optional(),
  maxCharacters: z.string().optional(),
  variant: z.string().optional(),
  options: z
    .array(
      z.object({
        trigger: z.string(),
        titles: z.array(z.object({ text: z.string(), key: z.string(), isOtherOption: z.boolean().optional() })),
      })
    )
    .optional(),
  image1Upload: z.string().optional(),
  image1: z.string().optional(),
  text1: z.string().optional(),
  key1: z.string().optional(),
  image2: z.string().optional(),
  image2Upload: z.string().optional(),
  text2: z.string().optional(),
  key2: z.string().optional(),
  multiple: z.boolean().optional(),
  image: z.string().optional(),
  imageAlt: z.string().optional(),
  imageDescription: z.string().optional(),
  imageUpload: z.string().optional(),
  fieldRequired: z.boolean().optional(),
  showSmileys: z.boolean().optional(),
  placeholder: z.string().optional(),
});

export default function WidgetEnqueteItems(
  props: EnqueteWidgetProps & EditFieldProps<EnqueteWidgetProps>
) {
  type FormData = z.infer<typeof formSchema>;
  const [items, setItems] = useState<Item[]>([]);
  const [options, setOptions] = useState<Option[]>([]);
  const [selectedItem, setItem] = useState<Item | null>(null);
  const [selectedOption, setOption] = useState<Option | null>(null);
  const [settingOptions, setSettingOptions] = useState<boolean>(false);
  const [file, setFile] = useState<File>();
  const [isFieldKeyUnique, setIsFieldKeyUnique] = useState(true);

  // adds item to items array if no item is selected, otherwise updates the selected item
  async function onSubmit(values: FormData) {
    if (selectedItem) {
      setItems((currentItems) =>
        currentItems.map((item) =>
          item.trigger === selectedItem.trigger ? { ...item, ...values } : item
        )
      );
      setItem(null);
    } else {
      setItems((currentItems) => [
        ...currentItems,
        {
          trigger: `${currentItems.length > 0
            ? parseInt(currentItems[currentItems.length - 1].trigger) + 1
            : 1
            }`,
          title: values.title,
          key: values.key,
          description: values.description,
          questionType: values.questionType,
          fieldKey: values.fieldKey,
          minCharacters: values.minCharacters,
          maxCharacters: values.maxCharacters,
          variant: values.variant || 'text input',
          options: values.options || [],
          image1: values.image1 || '',
          text1: values.text1 || '',
          key1: values.key1 || '',
          image2: values.image2 || '',
          text2: values.text2 || '',
          key2: values.key2 || '',
          multiple: values.multiple || false,
          image: values.image || '',
          imageAlt: values.imageAlt || '',
          imageDescription: values.imageDescription || '',
          fieldRequired: values.fieldRequired || false,
          showSmileys: values.showSmileys || false,
          placeholder: values.placeholder || '',
        },
      ]);
    }

    form.reset(defaults);
    setOptions([]);
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
    key: '',
    description: '',
    question: '',
    questionSubtitle: '',
    questionType: '',
    fieldKey: '',
    minCharacters: '',
    maxCharacters: '',
    variant: 'text input',
    options: [],
    image1: '',
    text1: '',
    key1: '',
    image2: '',
    text2: '',
    key2: '',
    multiple: false,
    image: '',
    imageAlt: '',
    imageDescription: '',
    fieldRequired: false,
    showSmileys: false,
    placeholder: '',
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
        fieldKey: selectedItem.fieldKey || '',
        description: selectedItem.description || '',
        questionType: selectedItem.questionType || '',
        minCharacters: selectedItem.minCharacters || '',
        maxCharacters: selectedItem.maxCharacters || '',
        variant: selectedItem.variant || '',
        options: selectedItem.options || [],
        image1: selectedItem.image1 || '',
        text1: selectedItem.text1 || '',
        key1: selectedItem.key1 || '',
        image2: selectedItem.image2 || '',
        text2: selectedItem.text2 || '',
        key2: selectedItem.key2 || '',
        multiple: selectedItem.multiple || false,
        image: selectedItem.image || '',
        imageAlt: selectedItem.imageAlt || '',
        imageDescription: selectedItem.imageDescription || '',
        fieldRequired: selectedItem.fieldRequired || false,
        showSmileys: selectedItem.showSmileys || false,
        placeholder: selectedItem.placeholder || '',
      });
      setOptions(selectedItem.options || []);
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

  function handleSaveItems() {
    props.updateConfig({ ...props, items });
  }

  const hasOptions = () => {
    switch (form.watch('questionType')) {
      case 'multiplechoice':
        return true;
      case 'multiple':
        return true;
      default:
        return false;
    }
  };

  const hasList = () => {
    switch (form.watch('questionType')) {
      case 'multiplechoice':
        return true;
      case 'multiple':
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

  useEffect(() => {
    const key = form.watch("fieldKey");

    if (key) {
      const isUnique = items.every((item) =>
        (selectedItem && item.trigger === selectedItem.trigger) || item.fieldKey !== key
      );

      setIsFieldKeyUnique(isUnique);
    }
  }, [form.watch("fieldKey"), selectedItem]);

  return (
    <div>
      <Form {...form}>
        <form
          onSubmit={form.handleSubmit(onSubmit)}
          className="w-full grid gap-x-4 gap-y-8">
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

                        <FormField
                          control={form.control}
                          // @ts-ignore
                          name={`options.${options.length - 1}.isOtherOption`}
                          render={({ field }) => (
                            <>
                              <FormItem
                                style={{ display: 'flex', alignItems: 'center', justifyContent: 'flex-start', flexDirection: 'row', marginTop: '10px' }}>
                                <Checkbox
                                  onCheckedChange={(checked: boolean) => {
                                    form.setValue(`options.${options.length - 1}.titles.0.isOtherOption`, checked);
                                  }}
                                />
                                <FormLabel
                                  style={{ marginTop: 0, marginLeft: '6px' }}>Is &apos;Anders, namelijk...&apos;</FormLabel>
                                <FormMessage />
                              </FormItem>
                              <FormDescription>
                                Als je deze optie selecteert, wordt er automatisch een tekstveld toegevoegd aan het formulier.
                                Het tekstveld wordt zichtbaar wanneer deze optie wordt geselecteerd.
                              </FormDescription>
                            </>
                          )}
                        />
                      </>
                    )}

                    {/* <FormField
                          control={form.control}
                          name={`options.${options.length - 1}.key`}
                          render={({ field }) => (
                            <FormItem>
                              <FormLabel>Key</FormLabel>
                              <Input {...field} />
                              <FormMessage />
                            </FormItem>
                          )}
                        /> */}

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
              <div className="p-6 bg-white rounded-md flex flex-col justify-between col-span-2">
                <div>
                  <Heading size="xl">Enquete items</Heading>
                  <Separator className="my-4" />
                  <div className="w-full lg:w-2/3 flex flex-col grid gap-y-4">
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
                    {form.watch('questionType') !== 'none' && (
                      <FormField
                        control={form.control}
                        name="fieldKey"
                        render={({ field }) => (
                          <FormItem>
                            <FormLabel>
                              Key voor het opslaan
                              <InfoDialog content={'Voor de volgende types zijn deze velden altijd veplicht: Titel, Samenvatting en Beschrijving'} />
                            </FormLabel>
                            <em className='text-xs'>Deze moet uniek zijn bijvoorbeeld: ‘samenvatting’</em>
                            <Input {...field} />
                            {(!field.value || !isFieldKeyUnique) && (
                              <FormMessage>
                                {!field.value ? 'Key is verplicht' : 'Key moet uniek zijn'}
                              </FormMessage>
                            )}
                          </FormItem>
                        )}
                      />
                    )}
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

                    {form.watch('questionType') === 'open' && (

                      <FormField
                        control={form.control}
                        name="placeholder"
                        render={({ field }) => (
                          <FormItem>
                            <FormLabel>Placeholder</FormLabel>
                            <Input {...field} />
                            <FormMessage />
                          </FormItem>
                        )}
                      />
                    )}
                    <FormField
                      control={form.control}
                      name="questionType"
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
                              <SelectItem value="none">
                                Informatie blok
                              </SelectItem>
                              <SelectItem value="images">
                                Twee antwoordopties met afbeeldingen
                              </SelectItem>
                              <SelectItem value="multiplechoice">
                                Multiplechoice
                              </SelectItem>
                              <SelectItem value="open">Open vraag</SelectItem>
                              <SelectItem value="multiple">
                                Meerkeuze
                              </SelectItem>
                              <SelectItem value="map">Locatie</SelectItem>
                              <SelectItem value="scale">Schaal</SelectItem>
                              <SelectItem value="imageUpload">Afbeelding upload</SelectItem>
                            </SelectContent>
                          </Select>
                          <FormMessage />
                        </FormItem>
                      )}
                    />
                    {form.watch('questionType') === 'open' && (
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
                    )}

                    {form.watch('questionType') === 'none' && (
                      <>
                        <ImageUploader
                          form={form}
                          fieldName="imageUpload"
                          imageLabel="Afbeelding 1"
                          allowedTypes={["image/*"]}
                          onImageUploaded={(imageResult) => {
                            const image = imageResult ? imageResult.url : '';

                            form.setValue("image", image);
                            form.resetField('imageUpload');
                          }}
                        />

                        {!!form.getValues('image') && (
                          <div style={{ position: 'relative' }}>
                            <img src={form.getValues('image')} />
                          </div>
                        )}

                        <FormField
                          control={form.control}
                          name="imageAlt"
                          render={({ field }) => (
                            <FormItem>
                              <FormLabel>Afbeelding beschrijving voor screenreaders</FormLabel>
                              <Input {...field} />
                              <FormMessage />
                            </FormItem>
                          )}
                        />
                        <FormField
                          control={form.control}
                          name="imageDescription"
                          render={({ field }) => (
                            <FormItem>
                              <FormLabel>Beschrijving afbeelding</FormLabel>
                              <Input {...field} />
                              <FormMessage />
                            </FormItem>
                          )}
                        />

                      </>
                    )}

                    {form.watch('questionType') === 'images' && (
                      <>
                        <ImageUploader
                          form={form}
                          fieldName="image1Upload"
                          imageLabel="Afbeelding 1"
                          allowedTypes={["image/*"]}
                          onImageUploaded={(imageResult) => {
                            const image = imageResult ? imageResult.url : '';

                            form.setValue("image1", image);
                            form.resetField('image1Upload');
                          }}
                        />

                        {!!form.getValues('image1') && (
                          <div style={{ position: 'relative' }}>
                            <img src={form.getValues('image1')} />
                          </div>
                        )}

                        <FormField
                          control={form.control}
                          name="key1"
                          render={({ field }) => (
                            <FormItem>
                              <FormLabel>Key afbeelding 1</FormLabel>
                              <Input {...field} />
                              <FormMessage />
                            </FormItem>
                          )}
                        />
                        <FormField
                          control={form.control}
                          name="text1"
                          render={({ field }) => (
                            <FormItem>
                              <FormLabel>Titel afbeelding 1</FormLabel>
                              <Input {...field} />
                              <FormMessage />
                            </FormItem>
                          )}
                        />

                        <ImageUploader
                          form={form}
                          fieldName="image2Upload"
                          imageLabel="Afbeelding 2"
                          allowedTypes={["image/*"]}
                          onImageUploaded={(imageResult) => {
                            const image = imageResult ? imageResult.url : '';

                            form.setValue("image2", image);
                            form.resetField('image2Upload');
                          }}
                        />

                        {!!form.getValues('image2') && (
                          <div style={{ position: 'relative' }}>
                            <img src={form.getValues('image2')} />
                          </div>
                        )}

                        <FormField
                          control={form.control}
                          name="key2"
                          render={({ field }) => (
                            <FormItem>
                              <FormLabel>Key afbeelding 2</FormLabel>
                              <Input {...field} />
                              <FormMessage />
                            </FormItem>
                          )}
                        />
                        <FormField
                          control={form.control}
                          name="text2"
                          render={({ field }) => (
                            <FormItem>
                              <FormLabel>Titel afbeelding 2</FormLabel>
                              <Input {...field} />
                              <FormMessage />
                            </FormItem>
                          )}
                        />
                      </>
                    )}

                    {form.watch('questionType') === 'imageUpload' && (
                      <FormField
                        control={form.control}
                        name="multiple"
                        render={({ field }) => (
                          <FormItem>
                            <FormLabel>Mogen er meerdere afbeeldingen tegelijkertijd geüpload worden?</FormLabel>
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
                              <SelectItem value="false">Nee</SelectItem>
                              <SelectItem value="true">Ja</SelectItem>
                            </SelectContent>
                          </Select>
                          <FormMessage />
                        </FormItem>
                      )}
                    />

                    {form.watch('questionType') === 'scale' && (
                      <FormField
                        control={form.control}
                        name="showSmileys"
                        render={({ field }) => (
                          <FormItem>
                            <FormLabel>
                              Wil je smileys tonen in plaats van een schaal?
                            </FormLabel>
                            <FormDescription>
                              De schaal toont normaal gesproken een getal van 1 tot 5. Als je smileys wilt tonen, kies dan voor ja.
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
                                <SelectItem value="false">Nee</SelectItem>
                                <SelectItem value="true">Ja</SelectItem>
                              </SelectContent>
                            </Select>
                            <FormMessage />
                          </FormItem>
                        )}
                      />
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

                <div>
                  <div className="flex gap-2">
                    {selectedItem && (
                      <Button
                        className="w-fit mt-4 bg-secondary text-black hover:text-white"
                        type="button"
                        onClick={() => {
                          resetForm();
                        }}>
                        Annuleer
                      </Button>
                    )}

                    <Button
                      className="w-fit mt-4"
                      type="submit"
                      onClick={(e) => {
                        e.preventDefault();
                        onSubmit(form.getValues())
                      }}
                      disabled={(!form.watch('fieldKey') || !isFieldKeyUnique) && form.watch('questionType') !== 'none'}
                    >
                      {selectedItem
                        ? 'Sla wijzigingen op'
                        : 'Voeg item toe aan lijst'}
                    </Button>
                  </div>
                  {(!form.watch('fieldKey') || !isFieldKeyUnique) && (
                    <FormMessage>
                      {!form.watch('fieldKey') ? 'Key is verplicht' : 'Key moet uniek zijn'}
                    </FormMessage>
                  )}
                </div>
              </div>
            )}
          </div>
        </form>
      </Form>
    </div>
  );
}
