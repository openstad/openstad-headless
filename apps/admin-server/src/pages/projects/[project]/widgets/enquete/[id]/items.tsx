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
  SelectGroup,
  SelectLabel,
} from '@/components/ui/select';
import { Separator } from '@/components/ui/separator';
import { Textarea } from '@/components/ui/textarea';
import { Heading } from '@/components/ui/typography';
import { EditFieldProps } from '@/lib/form-widget-helpers/EditFieldProps';
import { zodResolver } from '@hookform/resolvers/zod';
import { EnqueteWidgetProps } from '@openstad-headless/enquete/src/enquete';
import { Item, Matrix, MatrixOption, Option } from '@openstad-headless/enquete/src/types/enquete-props';
import { ArrowDown, ArrowUp, X } from 'lucide-react';
import React, { useEffect, useState } from 'react';
import { useForm } from 'react-hook-form';
import * as z from 'zod';
import InfoDialog from '@/components/ui/info-hover';
import { useRouter } from 'next/router';
import { YesNoSelect } from "@/lib/form-widget-helpers";
import { ProjectSettingProps } from "@openstad-headless/types";
import { info } from 'console';

const formSchema = z.object({
  trigger: z.string(),
  title: z.string().optional(),
  key: z.string(),
  description: z.string().optional(),
  questionType: z.string().optional(),
  fieldKey: z.string(),
  minCharacters: z.string().optional(),
  maxCharacters: z.string().optional(),
  nextPageText: z.string().optional(),
  prevPageText: z.string().optional(),
  variant: z.string().optional(),
  key_b: z.string().optional(),
  description_b: z.string().optional(),
  image_b: z.string().optional(),
  options: z
    .array(
      z.object({
        trigger: z.string(),
        titles: z.array(z.object({
          text: z.string().optional(),
          key: z.string(),
          infoField: z.string().optional(),
          infofieldExplanation: z.boolean().optional(),
          explanationRequired: z.boolean().optional(),
          description: z.string().optional(),
          image: z.string().optional(),
          isOtherOption: z.boolean().optional(),
          defaultValue: z.boolean().optional(),
          hideLabel: z.boolean().optional(),
          key_b: z.string().optional(),
          description_b: z.string().optional(),
          image_b: z.string().optional(),
        })),
      })
    )
    .optional(),
  matrix:
    z.object({
      columns: z.array(z.object({
        trigger: z.string(),
        text: z.string().optional(),
      })),
      rows: z.array(z.object({
        trigger: z.string(),
        text: z.string().optional(),
      })),
    })
    .optional(),
  multiple: z.boolean().optional(),
  randomizeItems: z.boolean().optional(),
  image: z.string().optional(),
  imageAlt: z.string().optional(),
  imageDescription: z.string().optional(),
  imageUpload: z.string().optional(),
  fieldRequired: z.boolean().optional(),
  maxChoices: z.string().optional(),
  maxChoicesMessage: z.string().optional(),
  showSmileys: z.boolean().optional(),
  placeholder: z.string().optional(),
  defaultValue: z.string().optional(),
  imageOptionUpload: z.string().optional(),
  matrixMultiple: z.boolean().optional(),
  routingInitiallyHide: z.boolean().optional(),
  routingSelectedQuestion: z.string().optional(),
  routingSelectedAnswer: z.string().optional(),
  infoBlockStyle: z.string().optional(),
  infoBlockShareButton: z.boolean().optional(),
  infoBlockExtraButton: z.string().optional(),
  infoBlockExtraButtonTitle: z.string().optional(),
  infoField: z.string().optional(),
  infofieldExplanation: z.boolean().optional(),


  // Keeping these for backwards compatibility
  image1Upload: z.string().optional(),
  image1: z.string().optional(),
  text1: z.string().optional(),
  key1: z.string().optional(),
  image2: z.string().optional(),
  image2Upload: z.string().optional(),
  text2: z.string().optional(),
  key2: z.string().optional(),
});

const matrixDefault = {
  columns: [],
  rows: [],
}

const matrixList: { type: 'rows' | 'columns', heading: string, description: string }[] = [
  {
    type: 'rows',
    heading: 'Lijst van onderwerpen',
    description: 'Dit zijn de onderwerpen die in de matrix worden weergegeven. Deze komen in de eerste kolom (verticaal) van de matrix.',
  }, {
    type: 'columns',
    heading: 'Lijst van kopjes',
    description: 'Dit zijn de kopjes die gekozen kunnen worden per onderwerp. Deze komen in de eerste rij (horizontaal) van de matrix.',
  }
];

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

  const [matrixOptions, setMatrixOptions] = useState<Matrix>(matrixDefault);
  const [matrixOption, setMatrixOption] = useState<MatrixOption & { type: 'rows' | 'columns' } | null>(null);

  const router = useRouter();
  const { project } = router.query;

  // adds item to items array if no item is selected, otherwise updates the selected item
  async function onSubmit(values: FormData) {
    if (values?.options) {
      values.options = options;
    }

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
          nextPageText: values.nextPageText || '',
          prevPageText: values.prevPageText || '',
          variant: values.variant || 'text input',
          options: values.options || [],
          multiple: values.multiple || false,
          randomizeItems: values.randomizeItems || false,
          image: values.image || '',
          image_b: values.image_b || '',
          description_b: values.description_b || '',
          key_b: values.key_b || '',
          imageAlt: values.imageAlt || '',
          imageDescription: values.imageDescription || '',
          fieldRequired: values.fieldRequired || false,
          maxChoices: values.maxChoices || '',
          maxChoicesMessage: values.maxChoicesMessage || '',
          showSmileys: values.showSmileys || false,
          defaultValue: values.defaultValue || '',
          placeholder: values.placeholder || '',
          matrix: values.matrix || matrixDefault,
          matrixMultiple: values.matrixMultiple || false,
          routingInitiallyHide: values.routingInitiallyHide || false,
          routingSelectedQuestion: values.routingSelectedQuestion || '',
          routingSelectedAnswer: values.routingSelectedAnswer || '',
          infoField: values.infoField || '',
          infofieldExplanation: values.infofieldExplanation || false,
          // Keeping these for backwards compatibility
          image1: values.image1 || '',
          text1: values.text1 || '',
          key1: values.key1 || '',
          image2: values.image2 || '',
          text2: values.text2 || '',
          key2: values.key2 || '',
        },
      ]);
    }

    form.reset(defaults);
    setOptions([]);
    setMatrixOptions(matrixDefault);
  }

  // adds link to options array if no option is selected, otherwise updates the selected option
  function handleAddOption(values: FormData) {
    if (selectedOption) {
      setOptions((currentOptions) => {
        const updatedOptions = currentOptions.map((option) => {
          if (option.trigger === selectedOption.trigger) {
            const newTitles =
              values.options?.find((o) => o.trigger === option.trigger)?.titles || [];

            return {
              ...option,
              titles: newTitles,
            };
          }

          return typeof (option?.trigger) !== "undefined" ? option : false;
        })
          .filter((option) => option !== false);

        return updatedOptions;
      });

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

  function handleAddMatrixOption(values: FormData, updatedMatrixOption: 'rows' | 'columns') {
    if (matrixOption) {
      setMatrixOptions((currentMatrix) => {
        const updatedMatrix = { ...currentMatrix };

        if (updatedMatrixOption === 'rows') {
          updatedMatrix.rows = updatedMatrix.rows.map((row) =>
            row.trigger === matrixOption.trigger
              ? { ...row, text: values.matrix?.rows?.find((r) => r.trigger === row.trigger)?.text || '' }
              : row
          );
        } else {
          updatedMatrix.columns = updatedMatrix.columns.map((column) =>
            column.trigger === matrixOption.trigger
              ? { ...column, text: values.matrix?.columns?.find((c) => c.trigger === column.trigger)?.text || '' }
              : column
          );
        }

        return updatedMatrix;
      });

      setMatrixOption(null);
    } else {
      const newTrigger = (values?.matrix && values?.matrix?.[updatedMatrixOption]?.length > 0)
        ? values?.matrix?.[updatedMatrixOption].reduce((max, option) => {
          return (parseInt(option?.trigger || '0') > max ? parseInt(option?.trigger || '0') : max);
        }, 0) + 1
        : '0';

      const newTextObj = (values?.matrix && values?.matrix?.[updatedMatrixOption]?.length > 0)
        ? values?.matrix?.[updatedMatrixOption]?.find((option: { trigger?: string }) => typeof (option?.trigger) === 'undefined')
        : { text: '' };

      const newText = newTextObj?.text || '';

      const newMatrixOption: MatrixOption = {
        trigger: newTrigger.toString(),
        text: newText
      };

      setMatrixOptions((currentMatrix) => ({
        rows: updatedMatrixOption === 'rows' ? [...currentMatrix.rows, newMatrixOption] : currentMatrix.rows,
        columns: updatedMatrixOption === 'columns' ? [...currentMatrix.columns, newMatrixOption] : currentMatrix.columns,
      }));
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
    nextPageText: 'Volgende',
    prevPageText: 'Vorige',
    variant: 'text input',
    options: [],
    multiple: false,
    randomizeItems: false,
    image: '',
    imageAlt: '',
    imageDescription: '',
    infoBlockStyle: 'default',
    infoBlockShareButton: false,
    infoBlockExtraButton: '',
    infoBlockExtraButtonTitle: '',
    fieldRequired: false,
    maxChoices: '',
    maxChoicesMessage: '',
    showSmileys: false,
    defaultValue: '',
    placeholder: '',
    matrix: matrixDefault,
    matrixMultiple: false,
    routingInitiallyHide: false,
    routingSelectedQuestion: '',
    routingSelectedAnswer: '',
    infoField: '',

    // Keeping these for backwards compatibility
    image1: '',
    text1: '',
    key1: '',
    image2: '',
    text2: '',
    key2: '',
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
        nextPageText: selectedItem.nextPageText || '',
        prevPageText: selectedItem.prevPageText || '',
        variant: selectedItem.variant || '',
        options: selectedItem.options || [],
        multiple: selectedItem.multiple || false,
        randomizeItems: selectedItem.randomizeItems || false,
        image: selectedItem.image || '',
        imageAlt: selectedItem.imageAlt || '',
        imageDescription: selectedItem.imageDescription || '',
        infoBlockStyle: selectedItem.infoBlockStyle || 'default',
        infoBlockShareButton: selectedItem.infoBlockShareButton || false,
        infoBlockExtraButton: selectedItem.infoBlockExtraButton || '',
        infoBlockExtraButtonTitle: selectedItem.infoBlockExtraButtonTitle || '',
        fieldRequired: selectedItem.fieldRequired || false,
        maxChoices: selectedItem.maxChoices || '',
        maxChoicesMessage: selectedItem.maxChoicesMessage || '',
        showSmileys: selectedItem.showSmileys || false,
        defaultValue: selectedItem.defaultValue || '',
        placeholder: selectedItem.placeholder || '',
        matrix: selectedItem.matrix || matrixDefault,
        matrixMultiple: selectedItem.matrixMultiple || false,
        routingInitiallyHide: selectedItem.routingInitiallyHide || false,
        routingSelectedQuestion: selectedItem.routingSelectedQuestion || '',
        routingSelectedAnswer: selectedItem.routingSelectedAnswer || '',
        infoField: selectedItem.infoField || '',
        infofieldExplanation: selectedItem.infofieldExplanation || false,


        // Keeping these for backwards compatibility
        image1: selectedItem.image1 || '',
        text1: selectedItem.text1 || '',
        key1: selectedItem.key1 || '',
        image2: selectedItem.image2 || '',
        text2: selectedItem.text2 || '',
        key2: selectedItem.key2 || '',
      });
      setOptions(selectedItem.options || []);
      setMatrixOptions(selectedItem.matrix || matrixDefault);
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

  useEffect(() => {
    form.reset({
      ...form.getValues(),
      matrix: matrixOptions
    });
  }, [matrixOption, form, matrixOptions]);

  const handleAction = (
    actionType: 'moveUp' | 'moveDown' | 'delete',
    clickedTrigger: string,
    isItemAction: boolean, // Determines if the action is for items or options
    isMatrixAction: boolean = false,
    matrixType: 'rows' | 'columns' = 'rows'
  ) => {
    if (isItemAction) {
      setItems((currentItems) => {
        return handleMovementOrDeletion(
          currentItems,
          actionType,
          clickedTrigger
        ) as Item[];
      });
    } else if (isMatrixAction) {
      let newMatrixOptions: Matrix;

      const updatedRows = matrixType === 'rows'
        ? handleMovementOrDeletion(
          matrixOptions.rows,
          actionType,
          clickedTrigger
        ) as MatrixOption[]
        : matrixOptions.rows;

      const updatedColumns = matrixType === 'columns'
        ? handleMovementOrDeletion(
          matrixOptions.columns,
          actionType,
          clickedTrigger
        ) as MatrixOption[]
        : matrixOptions.columns;

      newMatrixOptions = {
        ...matrixOptions,
        rows: updatedRows,
        columns: updatedColumns,
      }
      setMatrixOptions(newMatrixOptions);

      form.setValue('matrix', newMatrixOptions);
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
    list: Array<Item | Option | MatrixOption>,
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
    const updatedProps = { ...props };

    Object.keys(updatedProps).forEach((key: string) => {
      if (key.startsWith("options.") || key.startsWith("matrix.")) {
        // @ts-ignore
        delete updatedProps[key];
      }
    });

    props.updateConfig({ ...updatedProps, items });
    setOptions([]);
    setMatrixOptions(matrixDefault);
  }


  const hasOptions = () => {
    switch (form.watch('questionType')) {
      case 'multiplechoice':
      case 'swipe':
      case 'dilemma':
      case 'multiple':
      case 'images':
      case 'matrix':
      case 'sort':
        return true;
      default:
        return false;
    }
  };

  const hasList = () => {
    switch (form.watch('questionType')) {
      case 'multiplechoice':
      case 'multiple':
      case 'swipe':
      case 'dilemma':
      case 'images':
      case 'sort':
        return true;
      default:
        return false;
    }
  };

  function resetForm() {
    form.reset(defaults());
    setOptions([]);
    setMatrixOptions(matrixDefault);
    setItem(null);
  }

  function handleSaveOptions() {
    form.setValue('options', options);
    setSettingOptions(false);
  }

  function handleSaveMatrixOptions() {
    form.setValue('matrix', matrixOptions);
    setSettingOptions(false);
    setMatrixOption(null);
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
                          className={`flex cursor-pointer justify-between border border-secondary 
                            ${(item.questionType === 'pagination' && item.trigger !== selectedItem?.trigger ) ? 'bg-[#f8f8f8]' : ''}
                            ${item.trigger == selectedItem?.trigger && 'bg-secondary'}`}>
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
                            onClick={() => {
                              setItem(item);
                              setOptions([]);
                              setMatrixOptions(matrixDefault);
                              setSettingOptions(false);
                            }}
                            dangerouslySetInnerHTML={{__html: `${ item.title || (item?.questionType === 'pagination' ? '--- Nieuwe pagina ---' : (item?.questionType === 'swipe' ? 'Swipe' : 'Geen titel'))}`}}
                            >
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
                {form.watch("questionType") === "matrix" ? (
                  matrixList.map((matrixItem) => (
                    <>
                      <div className="flex flex-col justify-between">
                        <div className="flex flex-col gap-y-2">
                          <Heading size="xl">{matrixItem.heading}</Heading>
                          <FormDescription>{matrixItem.description}</FormDescription>
                          <Separator className="mt-2" />

                          <div className="flex flex-col gap-1">
                            {matrixOptions?.[matrixItem.type]?.length > 0
                              ? matrixOptions?.[matrixItem.type]
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
                                            false,
                                            true,
                                            matrixItem.type
                                          )
                                        }
                                      />
                                      <ArrowDown
                                        className="cursor-pointer"
                                        onClick={() =>
                                          handleAction(
                                            'moveDown',
                                            option.trigger,
                                            false,
                                            true,
                                            matrixItem.type
                                          )
                                        }
                                      />
                                    </span>
                                    <span
                                      className="py-3 px-2 w-full"
                                      onClick={() => setMatrixOption({
                                        ...option,
                                        type: matrixItem.type
                                      })}>
                                      {option?.text}
                                    </span>
                                    <span className="py-3 px-2">
                                      <X
                                        className="cursor-pointer"
                                        onClick={() =>
                                          handleAction(
                                            'delete',
                                            option.trigger,
                                            false,
                                            true,
                                            matrixItem.type
                                          )
                                        }
                                      />
                                    </span>
                                  </div>
                                ))
                              : ''}
                          </div>

                          {(() => {
                            const currentOption = matrixOptions?.[matrixItem.type].findIndex((option) => option.trigger === matrixOption?.trigger);
                            const activeOption = currentOption !== -1 ? currentOption : matrixOptions?.[matrixItem.type]?.length;

                            return (
                              <FormField
                                control={form.control}
                                name={`matrix.${matrixItem.type}.${activeOption}.text`}
                                render={({ field }) => (
                                  <FormItem>
                                    <Input {...field} />
                                    <FormMessage />
                                  </FormItem>
                                )}
                              />
                            )
                          })()}

                          <Button
                            className="w-full bg-secondary text-black hover:text-white mt-4"
                            type="button"
                            onClick={() => handleAddMatrixOption(form.getValues(), matrixItem.type)}>
                            {(matrixOption && matrixOption.type === matrixItem.type)
                              ? 'Sla wijzigingen op'
                              : 'Voeg optie toe aan lijst'}
                          </Button>
                        </div>

                        {matrixItem.type === 'rows' && (
                          <div className="flex gap-2">
                            <Button
                              className="w-fit mt-4 bg-secondary text-black hover:text-white"
                              type="button"
                              onClick={() => {
                                setSettingOptions(() => !settingOptions),
                                  setMatrixOption(null);
                              }}>
                              Annuleer
                            </Button>
                            <Button
                              className="w-fit mt-4"
                              type="button"
                              onClick={() => handleSaveMatrixOptions()}>
                              Sla antwoordopties op
                            </Button>
                          </div>
                        )}
                      </div>
                    </>
                  ))) : (
                  <div className="flex flex-col justify-between">
                    <div className="flex flex-col gap-y-2">
                      <Heading size="xl">Antwoordopties</Heading>
                      <Separator className="mt-2" />
                      {hasList() && (
                        (() => {
                          const currentOption = options.findIndex((option) => option.trigger === selectedOption?.trigger);
                          const activeOption = currentOption !== -1 ? currentOption : options.length;
                          return (form.watch("questionType") !== "images" && form.watch("questionType") !== "swipe" && form.watch("questionType") !== "dilemma") ? (
                            <>
                              <FormField
                                control={form.control}
                                name={`options.${activeOption}.titles.0.key`}
                                render={({ field }) => (
                                  <FormItem>
                                    <FormLabel>Optie tekst</FormLabel>
                                    <Input {...field} />
                                    <FormMessage />
                                  </FormItem>
                                )}
                              />

                              {form.watch('questionType') !== 'sort' && (
                                <FormField
                                  control={form.control}
                                  // @ts-ignore
                                  name={`options.${activeOption}.titles.0.isOtherOption`}
                                  render={({ field }) => (
                                    <>
                                      <FormItem
                                        style={{
                                          display: 'flex',
                                          alignItems: 'center',
                                          justifyContent: 'flex-start',
                                          flexDirection: 'row',
                                          marginTop: '10px'
                                        }}>
                                        {YesNoSelect(field, props)}
                                        <FormLabel
                                          style={{ marginTop: 0, marginLeft: '6px' }}>Is &apos;Anders, namelijk...&apos;</FormLabel>
                                        <FormMessage />
                                      </FormItem>
                                      <FormDescription>
                                        Als je deze optie selecteert, wordt er automatisch een tekstveld toegevoegd aan het
                                        formulier.
                                        Het tekstveld wordt zichtbaar wanneer deze optie wordt geselecteerd.
                                      </FormDescription>
                                    </>
                                  )}
                                />
                              )}
                              {form.watch('questionType') !== 'sort' && (
                                <FormField
                                  control={form.control}
                                  // @ts-ignore
                                  name={`options.${activeOption}.titles.0.isOtherOption`}
                                  render={({ field }) => (
                                    <>
                                      <FormItem
                                        style={{
                                          display: 'flex',
                                          alignItems: 'center',
                                          justifyContent: 'flex-start',
                                          flexDirection: 'row',
                                          marginTop: '10px'
                                        }}>
                                        {YesNoSelect(field, props)}
                                        <FormLabel
                                          style={{ marginTop: 0, marginLeft: '6px' }}>Is &apos;Anders, namelijk...&apos;</FormLabel>
                                        <FormMessage />
                                      </FormItem>
                                      <FormDescription>
                                        Als je deze optie selecteert, wordt er automatisch een tekstveld toegevoegd aan het
                                        formulier.
                                        Het tekstveld wordt zichtbaar wanneer deze optie wordt geselecteerd.
                                      </FormDescription>
                                    </>
                                  )}
                                />
                              )}

                              {form.watch('questionType') === 'multiple' && (
                                <FormField
                                  control={form.control}
                                  // @ts-ignore
                                  name={`options.${activeOption}.titles.0.defaultValue`}
                                  render={({ field }) => (
                                    <>
                                      <FormItem
                                        style={{
                                          display: 'flex',
                                          alignItems: 'center',
                                          justifyContent: 'flex-start',
                                          flexDirection: 'row',
                                          marginTop: '10px'
                                        }}>
                                        {YesNoSelect(field, props)}
                                        <FormLabel
                                          style={{ marginTop: 0, marginLeft: '6px' }}>Standaard aangevinkt?</FormLabel>
                                        <FormMessage />
                                      </FormItem>
                                      <FormDescription>
                                        Als je deze optie selecteert, wordt deze optie standaard aangevinkt.
                                      </FormDescription>
                                    </>
                                  )}
                                />
                              )}
                            </>
                          ) : (
                            <>
                              {form.watch("questionType") === "dilemma" && <b>Dilemma A</b>}
                              <ImageUploader
                                form={form}
                                project={project as string}
                                fieldName="imageOptionUpload"
                                imageLabel="Afbeelding"
                                allowedTypes={["image/*"]}
                                onImageUploaded={(imageResult) => {
                                  const image = imageResult ? imageResult.url : '';

                                  form.setValue(`options.${activeOption}.titles.0.image`, image);
                                  form.resetField('imageOptionUpload');
                                }}
                              />

                              {!!form.getValues(`options.${activeOption}.titles.0.image`) && (
                                <div style={{ position: 'relative' }}>
                                  <img src={form.getValues(`options.${activeOption}.titles.0.image`)} />
                                </div>
                              )}

                              <FormField
                                control={form.control}
                                name={`options.${activeOption}.titles.0.key`}
                                render={({ field }) => (
                                  <FormItem>
                                    <FormLabel>Titel</FormLabel>
                                    {(form.watch('questionType') !== 'swipe' && form.watch('questionType') !== 'dilemma') && (
                                      <FormDescription>
                                        Dit veld wordt gebruikt voor de alt tekst van de afbeelding. Dit is nodig voor toegankelijkheid.
                                        De titel wordt ook gebruikt als bijschrift onder de afbeelding, behalve als je de optie selecteert om de titel te verbergen.
                                      </FormDescription>
                                    )}
                                    <Input {...field} />
                                    <FormMessage />
                                  </FormItem>
                                )}
                              />
                              {form.watch("questionType") === "dilemma" && (
                                <>
                                  <FormField
                                    control={form.control}
                                    name={`options.${activeOption}.titles.0.description`}
                                    render={({ field }) => (
                                      <FormItem
                                        style={{
                                          marginTop: '10px'
                                        }}>
                                        <FormLabel>Beschrijving</FormLabel>
                                        <Textarea rows={6} {...field} />
                                        <FormMessage />
                                      </FormItem>
                                    )}
                                  />

                                  <br />
                                  <hr />
                                  <br />

                                  <b>Dilemma B</b>
                                  <ImageUploader
                                    form={form}
                                    project={project as string}
                                    fieldName="imageOptionUpload"
                                    imageLabel="Afbeelding"
                                    allowedTypes={["image/*"]}
                                    onImageUploaded={(imageResult) => {
                                      const image = imageResult ? imageResult.url : '';

                                      form.setValue(`options.${activeOption}.titles.0.image_b`, image);
                                      form.resetField('imageOptionUpload');
                                    }}
                                  />
                                  {!!form.getValues(`options.${activeOption}.titles.0.image_b`) && (
                                    <div style={{ position: 'relative' }}>
                                      <img src={form.getValues(`options.${activeOption}.titles.0.image_b`)} />
                                    </div>
                                  )}
                                  <FormField
                                    control={form.control}
                                    name={`options.${activeOption}.titles.0.key_b`}
                                    render={({ field }) => (
                                      <FormItem>
                                        <FormLabel>Titel</FormLabel>
                                        {(form.watch('questionType') !== 'swipe' && form.watch('questionType') !== 'dilemma') && (
                                          <FormDescription>
                                            Dit veld wordt gebruikt voor de alt tekst van de afbeelding. Dit is nodig voor toegankelijkheid.
                                            De titel wordt ook gebruikt als bijschrift onder de afbeelding, behalve als je de optie selecteert om de titel te verbergen.
                                          </FormDescription>
                                        )}
                                        <Input {...field} />
                                        <FormMessage />
                                      </FormItem>
                                    )}
                                  />
                                  <FormField
                                    control={form.control}
                                    name={`options.${activeOption}.titles.0.description_b`}
                                    render={({ field }) => (
                                      <FormItem
                                        style={{
                                          marginTop: '10px'
                                        }}>
                                        <FormLabel>Beschrijving</FormLabel>
                                        <Textarea rows={6} {...field} />
                                        <FormMessage />
                                      </FormItem>
                                    )}
                                  />

                                  <br />
                                  <hr />
                                  <br />


                                  <FormField
                                    control={form.control}
                                    name={`options.${activeOption}.titles.0.infoField`}
                                    render={({ field }) => (
                                      <FormItem
                                        style={{
                                          marginTop: '10px'
                                        }}>
                                        <FormLabel>Extra info veld</FormLabel>
                                        <Textarea rows={6} {...field} />
                                        <FormMessage />
                                      </FormItem>
                                    )}
                                  />
                                  <FormField
                                    control={form.control}
                                    name={`options.${activeOption}.titles.0.infofieldExplanation`}
                                    render={({ field }) => (
                                      <>
                                        <FormItem
                                          style={{
                                            display: 'flex',
                                            alignItems: 'center',
                                            justifyContent: 'flex-start',
                                            flexDirection: 'row',
                                            marginTop: '10px'
                                          }}>
                                          {YesNoSelect(field, props)}
                                          <FormLabel
                                            style={{ marginTop: 0, marginLeft: '6px' }}>Toelichting vragen</FormLabel>
                                          <FormMessage />
                                        </FormItem>
                                        <FormDescription>
                                          Als je deze optie selecteert, wordt er na deze vraag om een toelichting gevraagd.
                                        </FormDescription>
                                      </>
                                    )}
                                  />
                                </>

                              )}



                              {(form.watch("questionType") !== "swipe" && form.watch("questionType") !== "dilemma") && (
                                <FormField
                                  control={form.control}
                                  // @ts-ignore
                                  name={`options.${activeOption}.titles.0.hideLabel`}
                                  render={({ field }) => (
                                    <>
                                      <FormItem
                                        style={{
                                          display: 'flex',
                                          alignItems: 'center',
                                          justifyContent: 'flex-start',
                                          flexDirection: 'row',
                                          marginTop: '10px'
                                        }}>
                                        {YesNoSelect(field, props)}
                                        <FormLabel
                                          style={{ marginTop: 0, marginLeft: '6px' }}>Titel verbergen?</FormLabel>
                                        <FormMessage />
                                      </FormItem>
                                      <FormDescription>
                                        Als je deze optie selecteert, wordt de titel van de afbeelding verborgen.
                                      </FormDescription>
                                    </>
                                  )}
                                />
                              )}
                              {form.watch("questionType") === "swipe" && (
                                <FormField
                                  control={form.control}
                                  name={`options.${activeOption}.titles.0.infoField`}
                                  render={({ field }) => (
                                    <FormItem
                                      style={{
                                        marginTop: '10px'
                                      }}>
                                      <FormLabel>Extra informatie</FormLabel>
                                      <Textarea rows={6} {...field} />
                                      <FormMessage />
                                    </FormItem>
                                  )}
                                />
                              )}

                              {form.watch("questionType") === "swipe" && (
                                <FormField
                                  control={form.control}
                                  name={`options.${activeOption}.titles.0.explanationRequired`}
                                  render={({ field }) => (
                                    <>
                                      <FormItem
                                        style={{
                                          display: 'flex',
                                          alignItems: 'center',
                                          justifyContent: 'flex-start',
                                          flexDirection: 'row',
                                          marginTop: '10px'
                                        }}>
                                        {YesNoSelect(field, props)}
                                        <FormLabel
                                          style={{ marginTop: 0, marginLeft: '6px' }}>Toelichting vragen</FormLabel>
                                        <FormMessage />
                                      </FormItem>
                                      <FormDescription>
                                        Als je deze optie selecteert, wordt er na deze vraag om een toelichting gevraagd.
                                      </FormDescription>
                                    </>
                                  )}
                                />
                              )}
                            </>
                          );
                        })()
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
                            setOption(null);
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
                )}
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
                                {option?.titles?.[0].key}
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
                    {(form.watch('questionType') !== 'swipe' && form.watch('questionType') !== 'pagination') && (
                      <>
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
                        {(form.watch('questionType') !== 'dilemma' && form.watch('questionType') !== 'swipe') && (
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
                        )}
                      </>
                    )}

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
                                Antwoordopties met afbeeldingen
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
                              <SelectItem value="documentUpload">Document upload</SelectItem>
                              <SelectItem value="matrix">Matrix vraag</SelectItem>
                              <SelectItem value="pagination">Voeg pagina toe</SelectItem>
                              <SelectItem value="sort">Sorteren</SelectItem>
                              <SelectItem value="swipe">Swipe</SelectItem>
                              <SelectItem value="dilemma">Dilemma</SelectItem>
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

                    {form.watch('questionType') === 'pagination' && (
                      <>
                        <FormField
                          control={form.control}
                          name="prevPageText"
                          render={({ field }) => (
                            <FormItem>
                              <FormLabel>Tekst voor: Vorige pagina</FormLabel>
                              <Input {...field} />
                              <FormMessage />
                            </FormItem>
                          )}
                        />
                        <FormField
                          control={form.control}
                          name="nextPageText"
                          render={({ field }) => (
                            <FormItem>
                              <FormLabel>Tekst voor: Volgende pagina</FormLabel>
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
                          project={project as string}
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
                        {props.formStyle === 'youth' && (

                          <FormField
                            control={form.control}
                            name="infoBlockStyle"
                            render={({ field }) => (
                              <FormItem>
                                <FormLabel>Informatie blok stijl</FormLabel>
                                <Select
                                  value={field.value}
                                  onValueChange={field.onChange}>
                                  <FormControl>
                                    <SelectTrigger>
                                      <SelectValue placeholder="Kies type" />
                                    </SelectTrigger>
                                  </FormControl>
                                  <SelectContent>

                                    <SelectItem value="default">
                                      Standaard uiterlijk
                                    </SelectItem>
                                    <SelectGroup>
                                      <SelectLabel>Jongeren widgets</SelectLabel>
                                      <SelectItem value="youth-intro">
                                        - Introductie
                                      </SelectItem>
                                      <SelectItem value="youth-page">
                                        - Tussenpagina
                                      </SelectItem>
                                      <SelectItem value="youth-outro">
                                        - Afsluiting
                                      </SelectItem>
                                    </SelectGroup>
                                  </SelectContent>
                                </Select>
                                <FormMessage />
                              </FormItem>

                            )}
                          />
                        )}
                        {(form.watch('infoBlockStyle') === 'youth-outro' && props.formStyle === 'youth') && (
                          <div className="border border-secondary p-6 rounded-md bg-secondary/60">
                            <FormField
                              control={form.control}
                              name={'infoBlockShareButton'}

                              render={({ field }) => (
                                <>
                                  <FormItem>
                                    <FormLabel
                                      style={{ marginTop: 0, marginLeft: '6px' }}>Toon &apos;Deel&apos; knop?</FormLabel>
                                    <FormMessage />
                                    {YesNoSelect(field, props)}
                                  </FormItem>
                                </>
                              )}
                            />
                            <br />
                            <hr />
                            <br />
                            <div className="flex gap-4">
                              <FormField
                                control={form.control}
                                name="infoBlockExtraButtonTitle"
                                render={({ field }) => (
                                  <FormItem>
                                    <FormLabel>Titel</FormLabel>
                                    <Input {...field} />
                                    <FormMessage />
                                  </FormItem>
                                )}
                              />
                              <FormField
                                control={form.control}
                                name="infoBlockExtraButton"
                                render={({ field }) => (
                                  <FormItem>
                                    <FormLabel>Link</FormLabel>
                                    <Input {...field} />
                                    <FormMessage />
                                  </FormItem>
                                )}
                              />
                            </div>
                          </div>
                        )}

                        <hr />

                      </>
                    )}

                    {(form.watch('questionType') === 'imageUpload' || form.watch('questionType') === 'images' || form.watch('questionType') === 'documentUpload') && (
                      <FormField
                        control={form.control}
                        name="multiple"
                        render={({ field }) => (
                          <FormItem>
                            {(form.watch('questionType') === 'imageUpload' || form.watch('questionType') === 'documentUpload') ? (
                              <FormLabel>Mogen er meerdere {form.watch('questionType') === 'documentUpload' ? 'documenten' : 'afbeeldingen'} tegelijkertijd geüpload worden?</FormLabel>
                            ) : (
                              <FormLabel>Mogen er meerdere afbeeldingen geselecteerd worden?</FormLabel>
                            )}
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

                    {form.watch('questionType') !== 'pagination' && form.watch('questionType') !== 'sort' && (
                      <FormField
                        control={form.control}
                        name="fieldRequired"
                        render={({ field }) => (
                          <FormItem>
                            <FormLabel>
                              Is dit veld verplicht?
                            </FormLabel>
                            {form.watch("questionType") === "matrix" && (
                              <FormDescription>
                                Als je het veld <b>verplicht</b> maakt moeten gebruikers bij elke rij een antwoord selecteren.
                                Als je het veld <b>niet verplicht</b> maakt kunnen gebruikers elke rij overslaan en invullen wat ze willen.
                              </FormDescription>
                            )}
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

                    {form.watch("questionType") === "matrix" && (
                      <FormField
                        control={form.control}
                        name="matrixMultiple"
                        render={({ field }) => (
                          <FormItem>
                            <FormLabel>
                              Mogen er meerdere antwoorden per rij worden geselecteerd?
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
                    )}

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

                    {form.watch('questionType') === 'open' && (
                      <FormField
                        control={form.control}
                        name="defaultValue"
                        render={({ field }) => (
                          <FormItem>
                            <FormLabel>Standaard ingevulde waarde</FormLabel>
                            <Input {...field} />
                            <FormMessage />
                          </FormItem>
                        )}
                      />
                    )}

                    {form.watch('questionType') === 'multiple' && (
                      <>
                        <FormField
                          control={form.control}
                          name="maxChoices"
                          render={({ field }) => (
                            <FormItem>
                              <FormLabel>Maximaal te selecteren opties</FormLabel>
                              <FormDescription>
                                <em className='text-xs'>Als je wilt dat er maximaal een aantal opties geselecteerd kunnen worden, vul dan hier het aantal in.</em>
                              </FormDescription>
                              <Input {...field} />
                              <FormMessage />
                            </FormItem>
                          )}
                        />
                        <FormField
                          control={form.control}
                          name="maxChoicesMessage"
                          render={({ field }) => (
                            <FormItem>
                              <FormLabel>
                                Maximaal aantal bereikt melding
                              </FormLabel>
                              <FormDescription>
                                <em className='text-xs'>Als het maximaal aantal opties is geselecteerd, geef dan een melding aan de gebruiker. Dit is optioneel.</em>
                              </FormDescription>
                              <Input {...field} />
                              <FormMessage />
                            </FormItem>
                          )}
                        />
                      </>
                    )}

                    {form.watch('questionType') !== 'pagination' && (
                      <FormField
                        control={form.control}
                        name="routingInitiallyHide"
                        render={({ field }) => (
                          <FormItem>
                            <FormLabel>Is deze vraag altijd zichtbaar?</FormLabel>
                            <Select
                              onValueChange={(e: string) => field.onChange(e === 'true')}
                              value={field.value ? 'true' : 'false'}>
                              <FormControl>
                                <SelectTrigger>
                                  <SelectValue placeholder="Kies een optie" />
                                </SelectTrigger>
                              </FormControl>
                              <SelectContent>
                                {/* True and false are deliberately switched */}
                                <SelectItem value="true">Nee</SelectItem>
                                <SelectItem value="false">Ja</SelectItem>
                              </SelectContent>
                            </Select>
                            <FormMessage />
                          </FormItem>
                        )}
                      />
                    )}

                    {(form.watch('questionType') === 'multiplechoice' || form.watch('questionType') === 'multiple') && (
                      <FormField
                        control={form.control}
                        // @ts-ignore
                        name={`randomizeItems`}
                        render={({ field }) => (
                          <>
                            <FormItem
                              style={{
                                display: 'flex',
                                alignItems: 'center',
                                justifyContent: 'flex-start',
                                flexDirection: 'row',
                                marginTop: '10px'
                              }}>
                              {YesNoSelect(field, props)}
                              <FormLabel
                                style={{ marginTop: 0, marginLeft: '6px' }}>Willekeurige volgorde</FormLabel>
                              <FormMessage />
                            </FormItem>
                          </>
                        )}
                      />
                    )}

                    {form.watch('routingInitiallyHide') && (
                      <>
                        <FormField
                          control={form.control}
                          name="routingSelectedQuestion"
                          render={({ field }) => {
                            const formFields = items || [];
                            let formMultipleChoiceFields = formFields
                              .filter((f: any) =>
                                (
                                  f.questionType === 'multiplechoice'
                                  || f.questionType === 'multiple'
                                  || f.questionType === 'images'
                                  || f.questionType === 'select'
                                )
                                && f.trigger !== form.watch('trigger'));

                            return (
                              <FormItem>
                                <FormLabel>Welke vraag beïnvloedt de zichtbaarheid van deze vraag?</FormLabel>

                                {formMultipleChoiceFields.length === 0 ? (
                                  <p
                                    className="text-sm"
                                    style={{
                                      padding: "11px",
                                      borderLeft: "4px solid red",
                                      backgroundColor: "#ffdbd7",
                                      borderTopRightRadius: '5px',
                                      borderBottomRightRadius: '5px',
                                      marginTop: '12px',
                                    }}
                                  >
                                    Je hebt nog geen meerkeuze, multiplechoice of afbeelding keuze vragen toegevoegd. Voeg deze eerst toe om deze vraag te kunnen tonen op basis van een ander antwoord.
                                  </p>
                                ) : (
                                  <Select
                                    value={field.value}
                                    onValueChange={field.onChange}>
                                    <FormControl>
                                      <SelectTrigger>
                                        <SelectValue placeholder="Kies een vraag" />
                                      </SelectTrigger>
                                    </FormControl>
                                    <SelectContent>
                                      {formMultipleChoiceFields.map((f: any) => (
                                        <SelectItem key={f.trigger} value={f.trigger}>{f.title || f.fieldKey}</SelectItem>
                                      ))}
                                    </SelectContent>
                                  </Select>
                                )}

                                <FormMessage />
                              </FormItem>
                            )
                          }}
                        />

                        {form.watch("routingSelectedQuestion") !== '' && (
                          <FormField
                            control={form.control}
                            name="routingSelectedAnswer"
                            render={({ field }) => {
                              const selectedQuestion = items?.find((i: any) => i.trigger === form.watch("routingSelectedQuestion"));
                              const options = selectedQuestion?.options || [];

                              return (
                                <FormItem>
                                  <FormLabel>Bij welk antwoord moet deze vraag getoond worden?</FormLabel>

                                  {options.length === 0 ? (
                                    <p
                                      className="text-sm"
                                      style={{
                                        padding: "11px",
                                        borderLeft: "4px solid red",
                                        backgroundColor: "#ffdbd7",
                                        borderTopRightRadius: '5px',
                                        borderBottomRightRadius: '5px',
                                        marginTop: '12px',
                                      }}
                                    >
                                      De geselecteerde vraag heeft nog geen antwoordopties. Voeg deze eerst toe om deze vraag te kunnen tonen op basis van een ander antwoord.
                                    </p>
                                  ) : (
                                    <Select
                                      value={field.value}
                                      onValueChange={field.onChange}>
                                      <FormControl>
                                        <SelectTrigger>
                                          <SelectValue placeholder="Kies een antwoord" />
                                        </SelectTrigger>
                                      </FormControl>
                                      <SelectContent>
                                        {options.map((o: any) => (
                                          <SelectItem key={o.trigger} value={o.trigger}>{o.titles?.[0]?.key || o.trigger}</SelectItem>
                                        ))}
                                      </SelectContent>
                                    </Select>
                                  )}

                                  <FormMessage />
                                </FormItem>
                              )
                            }}
                          />
                        )}
                      </>
                    )}

                    {hasOptions() && (
                      <FormItem>
                        <Button
                          className="w-fit mt-4 bg-secondary text-black hover:text-white"
                          type="button"
                          onClick={() => setSettingOptions(!settingOptions)}>
                          {form.watch("questionType") === "matrix"
                            ? `Matrix antwoordopties aanpassen`
                            : `Antwoordopties (${options.length}) aanpassen`}
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
                        onSubmit(form.getValues());
                        setOptions([]);
                        setMatrixOptions(matrixDefault);
                      }}
                      disabled={(!form.watch('fieldKey') || !isFieldKeyUnique) && form.watch('questionType') !== 'none' && form.watch('questionType') !== 'pagination' && form.watch('questionType') !== 'swipe'}
                    >
                      {selectedItem
                        ? 'Sla wijzigingen op'
                        : 'Voeg item toe aan lijst'}
                    </Button>
                  </div>
                  {(!form.watch('fieldKey') || !isFieldKeyUnique) && form.watch('questionType') !== 'pagination' && form.watch('questionType') !== 'swipe' && (
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
    </div >
  );
}
