import ImageGalleryStyle from '@/components/image-gallery-style';
import { ImageUploader } from '@/components/image-uploader';
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
import useTags from '@/hooks/use-tags';
import { useWidgetConfig } from '@/hooks/use-widget-config';
import { YesNoSelect } from '@/lib/form-widget-helpers';
import { EditFieldProps } from '@/lib/form-widget-helpers/EditFieldProps';
import { zodResolver } from '@hookform/resolvers/zod';
import {
  ChoiceGuideProps,
  ChoiceOptions,
  Item,
  Option,
} from '@openstad-headless/choiceguide/src/props';
import {
  Matrix,
  MatrixOption,
} from '@openstad-headless/enquete/src/types/enquete-props';
import { ArrowDown, ArrowLeft, ArrowRight, ArrowUp, X } from 'lucide-react';
import dynamic from 'next/dynamic';
import { useRouter } from 'next/router';
import React, { useEffect, useState } from 'react';
import { useFieldArray, useForm } from 'react-hook-form';
import * as z from 'zod';

const TrixEditor = dynamic(
  () =>
    import('@openstad-headless/ui/src/form-elements/text/index').then(
      (mod) => mod.TrixEditor
    ),
  {
    ssr: false,
    loading: () => (
      <div className="h-32 bg-gray-100 animate-pulse rounded border" />
    ),
  }
);

const weightSchema: z.ZodSchema = z.object({
  weightX: z.any().optional(),
  weightY: z.any().optional(),
  weightAB: z.any().optional(),
  weightABY: z.any().optional(),
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
  placeholder: z.string().optional(),
  minCharacters: z.string().optional(),
  maxCharacters: z.string().optional(),
  maxChoices: z.string().optional(),
  maxChoicesMessage: z.string().optional(),
  variant: z.string().optional(),
  multiple: z.boolean().optional(),
  options: z
    .array(
      z.object({
        trigger: z.string(),
        titles: z.array(
          z.object({
            text: z.string().optional(),
            key: z.string(),
            weights: z.record(weightSchema).optional(),
            isOtherOption: z.boolean().optional(),
            defaultValue: z.boolean().optional(),
            image: z.string().optional(),
            hideLabel: z.boolean().optional(),
          })
        ),
      })
    )
    .optional(),
  matrix: z
    .object({
      columns: z.array(
        z.object({
          trigger: z.string(),
          text: z.string().optional(),
        })
      ),
      rows: z.array(
        z.object({
          trigger: z.string(),
          text: z.string().optional(),
        })
      ),
    })
    .optional(),
  matrixMultiple: z.boolean().optional(),
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
  defaultValue: z.string().optional(),
  weights: z.record(weightSchema).optional(),
  skipQuestion: z.boolean().optional(),
  skipQuestionAllowExplanation: z.boolean().optional(),
  skipQuestionExplanation: z.string().optional(),
  skipQuestionLabel: z.string().optional(),
  routingInitiallyHide: z.boolean().optional(),
  createImageSlider: z.boolean().optional(),
  imageClickable: z.boolean().optional(),
  routingSelectedQuestion: z.string().optional(),
  routingSelectedAnswer: z.string().optional(),
  imageOptionUpload: z.string().optional(),
  images: z
    .array(
      z.object({
        url: z.string(),
        name: z.string().optional(),
        imageDescription: z.string().optional(),
        imageAlt: z.string().optional(),
      })
    )
    .optional()
    .default([]),

  // Keeping this for backwards compatibility
  infoImage: z.string().optional(),
});

const matrixDefault = {
  columns: [],
  rows: [],
};

const matrixList: {
  type: 'rows' | 'columns';
  heading: string;
  description: string;
}[] = [
  {
    type: 'rows',
    heading: 'Lijst van onderwerpen',
    description:
      'Dit zijn de onderwerpen die in de matrix worden weergegeven. Deze komen in de eerste kolom (verticaal) van de matrix.',
  },
  {
    type: 'columns',
    heading: 'Lijst van kopjes',
    description:
      'Dit zijn de kopjes die gekozen kunnen worden per onderwerp. Deze komen in de eerste rij (horizontaal) van de matrix.',
  },
];

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
  const [matrixOptions, setMatrixOptions] = useState<Matrix>(matrixDefault);
  const [matrixOption, setMatrixOption] = useState<
    (MatrixOption & { type: 'rows' | 'columns' }) | null
  >(null);
  const [imageIndexOpen, setImageIndexOpen] = useState<number | null>(null);

  const { data: widget } = useWidgetConfig<any>();

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
          item.trigger === selectedItem.trigger
            ? { ...item, ...values, weights: selectedItemWeights }
            : item
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
          labelA: values.labelA || '',
          labelB: values.labelB || '',
          sliderTitleUnderA: values.sliderTitleUnderA || '',
          sliderTitleUnderB: values.sliderTitleUnderB || '',
          explanationA: values.explanationA || '',
          explanationB: values.explanationB || '',
          imageA: values.imageA || '',
          imageB: values.imageB || '',
          placeholder: values.placeholder || '',
          maxChoices: values.maxChoices || '',
          maxChoicesMessage: values.maxChoicesMessage || '',
          defaultValue: values.defaultValue || '',
          weights: values.weights || {},
          skipQuestion: values.skipQuestion || false,
          skipQuestionAllowExplanation:
            values.skipQuestionAllowExplanation || false,
          skipQuestionExplanation: values.skipQuestionExplanation || '',
          skipQuestionLabel: values.skipQuestionLabel || 'Sla vraag over',
          matrix: values.matrix || matrixDefault,
          matrixMultiple: values.matrixMultiple || false,
          routingInitiallyHide: values.routingInitiallyHide || false,
          createImageSlider: values.createImageSlider || false,
          imageClickable: values.imageClickable || false,
          images: values?.images || [],
          routingSelectedQuestion: values.routingSelectedQuestion || '',
          routingSelectedAnswer: values.routingSelectedAnswer || '',

          // Keeping this for backwards compatibility
          image: values.infoImage || '',
        },
      ]);
    }
    form.reset(defaults);
    setOptions([]);
    setActiveTab('1');
    setMatrixOptions(matrixDefault);
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
        trigger: `${
          options.length > 0
            ? parseInt(options[options.length - 1].trigger) + 1
            : 0
        }`,
        titles: values.options?.[values.options.length - 1].titles || [],
      };
      setOptions((currentOptions) => [...currentOptions, newOption]);
    }
  }

  function handleAddMatrixOption(
    values: FormData,
    updatedMatrixOption: 'rows' | 'columns'
  ) {
    if (matrixOption) {
      setMatrixOptions((currentMatrix) => {
        const updatedMatrix = { ...currentMatrix };

        if (updatedMatrixOption === 'rows') {
          updatedMatrix.rows = updatedMatrix.rows.map((row) =>
            row.trigger === matrixOption.trigger
              ? {
                  ...row,
                  text:
                    values.matrix?.rows?.find((r) => r.trigger === row.trigger)
                      ?.text || '',
                }
              : row
          );
        } else {
          updatedMatrix.columns = updatedMatrix.columns.map((column) =>
            column.trigger === matrixOption.trigger
              ? {
                  ...column,
                  text:
                    values.matrix?.columns?.find(
                      (c) => c.trigger === column.trigger
                    )?.text || '',
                }
              : column
          );
        }

        return updatedMatrix;
      });

      setMatrixOption(null);
    } else {
      const newTrigger =
        values?.matrix && values?.matrix?.[updatedMatrixOption]?.length > 0
          ? values?.matrix?.[updatedMatrixOption].reduce((max, option) => {
              return parseInt(option?.trigger || '0') > max
                ? parseInt(option?.trigger || '0')
                : max;
            }, 0) + 1
          : '0';

      const newTextObj =
        values?.matrix && values?.matrix?.[updatedMatrixOption]?.length > 0
          ? values?.matrix?.[updatedMatrixOption]?.find(
              (option: { trigger?: string }) =>
                typeof option?.trigger === 'undefined'
            )
          : { text: '' };

      const newText = newTextObj?.text || '';

      const newMatrixOption: MatrixOption = {
        trigger: newTrigger.toString(),
        text: newText,
      };

      setMatrixOptions((currentMatrix) => ({
        rows:
          updatedMatrixOption === 'rows'
            ? [...currentMatrix.rows, newMatrixOption]
            : currentMatrix.rows,
        columns:
          updatedMatrixOption === 'columns'
            ? [...currentMatrix.columns, newMatrixOption]
            : currentMatrix.columns,
      }));
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
    placeholder: '',
    maxChoices: '',
    maxChoicesMessage: '',
    defaultValue: '',
    weights: {},
    skipQuestion: false,
    skipQuestionAllowExplanation: false,
    skipQuestionExplanation: '',
    skipQuestionLabel: 'Sla vraag over',
    matrix: matrixDefault,
    matrixMultiple: false,
    routingInitiallyHide: false,
    createImageSlider: false,
    imageClickable: false,
    routingSelectedQuestion: '',
    routingSelectedAnswer: '',
    images: [],

    // Keeping this for backwards compatibility
    infoImage: '',
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
      // Migrate fallback image fields to images array if needed
      let images = selectedItem.images || [];
      if ((!images || images.length === 0) && selectedItem.infoImage) {
        images = [
          {
            url: selectedItem.infoImage,
            imageAlt: '',
            imageDescription: '',
          },
        ];
      }

      const formValues = {
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
        labelA: selectedItem.labelA || '',
        labelB: selectedItem.labelB || '',
        sliderTitleUnderA: selectedItem.sliderTitleUnderA || '',
        sliderTitleUnderB: selectedItem.sliderTitleUnderB || '',
        explanationA: selectedItem.explanationA || '',
        explanationB: selectedItem.explanationB || '',
        placeholder: selectedItem.placeholder || '',
        imageA: selectedItem.imageA || '',
        imageB: selectedItem.imageB || '',
        maxChoices: selectedItem.maxChoices || '',
        maxChoicesMessage: selectedItem.maxChoicesMessage || '',
        defaultValue: selectedItem.defaultValue || '',
        weights: selectedItem.weights || {},
        skipQuestion: selectedItem.skipQuestion || false,
        skipQuestionAllowExplanation:
          selectedItem.skipQuestionAllowExplanation || false,
        skipQuestionExplanation: selectedItem.skipQuestionExplanation || '',
        skipQuestionLabel: selectedItem.skipQuestionLabel || 'Sla vraag over',
        matrix: selectedItem.matrix || matrixDefault,
        matrixMultiple: selectedItem.matrixMultiple || false,
        routingInitiallyHide: selectedItem.routingInitiallyHide || false,
        createImageSlider: selectedItem.createImageSlider || false,
        imageClickable: selectedItem.imageClickable || false,
        routingSelectedQuestion: selectedItem.routingSelectedQuestion || '',
        routingSelectedAnswer: selectedItem.routingSelectedAnswer || '',
        images,

        // Keeping this for backwards compatibility
        infoImage: '',
      };

      form.reset(formValues);
      setOptions(selectedItem.options || []);
      setMatrixOptions(selectedItem.matrix || matrixDefault);
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

  useEffect(() => {
    form.reset({
      ...form.getValues(),
      matrix: matrixOptions,
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

      const updatedRows =
        matrixType === 'rows'
          ? (handleMovementOrDeletion(
              matrixOptions.rows,
              actionType,
              clickedTrigger
            ) as MatrixOption[])
          : matrixOptions.rows;

      const updatedColumns =
        matrixType === 'columns'
          ? (handleMovementOrDeletion(
              matrixOptions.columns,
              actionType,
              clickedTrigger
            ) as MatrixOption[])
          : matrixOptions.columns;

      newMatrixOptions = {
        ...matrixOptions,
        rows: updatedRows,
        columns: updatedColumns,
      };
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

  useEffect(() => {
    const chosenType = form.watch('type') || '';
    const chosenConfig = widget?.config?.choiceGuide?.choicesType || 'default';

    let dimensions = chosenConfig === 'plane' ? ['X', 'Y'] : ['X'];

    const typeWithoutDimension = [
      'none',
      'matrix',
      'map',
      'imageUpload',
      'documentUpload',
      'text',
    ].includes(chosenType);

    const finalDimensions =
      chosenConfig === 'hidden' || typeWithoutDimension ? [] : dimensions;

    if (finalDimensions.length > 0) {
      form.setValue('weights', {});
    }

    setDimensions(finalDimensions);
  }, [form.watch('type')]);

  function handleSaveItems() {
    const updatedProps = { ...props };

    Object.keys(updatedProps).forEach((key: string) => {
      if (key.startsWith('options.')) {
        // @ts-ignore
        delete updatedProps[key];
      }
    });

    props.updateConfig({ ...updatedProps, items });
    setMatrixOptions(matrixDefault);
    window.location.reload();
  }

  const hasOptions = () => {
    switch (form.watch('type')) {
      case 'checkbox':
      case 'select':
      case 'radiobox':
      case 'images':
      case 'matrix':
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
      case 'images':
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

  function swapArrayElements(arr: any[], indexA: number, indexB: number) {
    const newArr = [...arr];
    const temp = newArr[indexA];
    newArr[indexA] = newArr[indexB];
    newArr[indexB] = temp;
    return newArr;
  }

  const moveUpImage = (index: number) => {
    const images = form.getValues('images');
    if (index <= 0) return;
    const reordered = swapArrayElements(images, index, index - 1);
    form.setValue('images', reordered);
  };

  const moveDownImage = (index: number) => {
    const images = form.getValues('images');
    if (index >= images.length - 1) return;
    const reordered = swapArrayElements(images, index, index + 1);
    form.setValue('images', reordered);
  };

  type ImageArray = {
    url: string;
    name?: string;
    imageAlt?: string;
    imageDescription?: string;
  };

  const { fields: imageFields, remove: removeImage } = useFieldArray({
    control: form.control,
    name: 'images',
  });

  // Create component for heading dimensions
  const DimensionHeading = (version: number = 1) => (
    <div
      className={`w-full col-span-full grid-cols-${dimensions.length + (form.watch('type') === 'a-b-slider' ? dimensions.length : 1)} grid gap-y-${version === 1 ? '2' : '0'} gap-x-${version === 1 ? '2' : '4'}`}>
      {version === 1 && <Heading size="lg">Vraaggroep titel</Heading>}
      {dimensions.length > 0 &&
        dimensions.map((XY, i) => (
          <React.Fragment key={i}>
            <Heading
              size="lg"
              style={{
                fontSize: version === 1 ? '18px' : '14px',
              }}>
              Weging {XY}
            </Heading>

            {form.watch('type') === 'a-b-slider' && (
              <Heading
                size="lg"
                style={{
                  fontSize: version === 1 ? '18px' : '14px',
                }}>
                Weging A/B {XY}
              </Heading>
            )}
          </React.Fragment>
        ))}
    </div>
  );

  const weightFields = (
    group: { title?: string; id?: string | number },
    index: number
  ) => (
    <div
      className={`w-full col-span-full grid-cols-${dimensions.length + (form.watch('type') === 'a-b-slider' ? dimensions.length : 1)} grid gap-x-${form.watch('type') === 'a-b-slider' ? 4 : 2} gap-y-${form.watch('type') === 'a-b-slider' ? 0 : 2} items-center`}
      key={index}>
      <p
        style={{
          margin: form.watch('type') === 'a-b-slider' ? '20px 0 10px 0' : '0',
        }}>
        {group.title}
      </p>

      {form.watch('type') === 'a-b-slider' &&
        DimensionHeading(form.watch('type') === 'a-b-slider' ? 2 : 1)}

      {dimensions.length > 0 &&
        dimensions.map((XY, i) => {
          const weightFieldAppend = XY === 'Y' ? 'Y' : '';

          return (
            <>
              <FormField
                control={form.control}
                name={`weights.${group.id}.weight${XY}`}
                key={`2-${i}`}
                render={({ field }) => {
                  const value = field.value ?? 0;
                  const watchValue = form.watch(
                    `weights.${group.id}.weight${XY}`
                  );

                  if (value !== watchValue) {
                    form.setValue(
                      `weights.${group.id}.weight${XY}`,
                      field.value ?? 0
                    );
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
                      <FormMessage />
                    </FormItem>
                  );
                }}
              />
              <FormField
                control={form.control}
                name={`weights.${group.id}.weightAB${weightFieldAppend}`}
                key={`3-${i}`}
                render={({ field }) => {
                  const value = field.value || 'A';
                  const watchValue = form.watch(
                    `weights.${group.id}.weightAB${weightFieldAppend}`
                  );

                  if (value !== watchValue) {
                    form.setValue(
                      `weights.${group.id}.weightAB${weightFieldAppend}`,
                      field.value || 'A'
                    );
                  }

                  return (
                    <FormItem>
                      <FormControl>
                        <Select
                          onValueChange={(e: string) => field.onChange(e)}
                          value={field.value || 'A'}>
                          <FormControl>
                            <SelectTrigger>
                              <SelectValue placeholder="Kies een optie" />
                            </SelectTrigger>
                          </FormControl>
                          <SelectContent>
                            <SelectItem value="A">A</SelectItem>
                            <SelectItem value="B">B</SelectItem>
                          </SelectContent>
                        </Select>
                      </FormControl>
                      <FormMessage />
                    </FormItem>
                  );
                }}
              />
            </>
          );
        })}
    </div>
  );

  const weightOptionsFields = (
    group: { title?: string; id?: string | number },
    index: number
  ) => (
    <div key={`0-${index}`} className="w-full col-span-full grid-cols-1 grid">
      <Heading size="lg" className="mt-3">
        {group.title}
      </Heading>
      <div
        className={`w-full col-span-full grid-cols-${dimensions.length + (form.watch('type') === 'a-b-slider' ? dimensions.length : 1)} grid gap-2 gap-y-2 items-center`}
        key={index}>
        {options.length > 0 &&
          options.map((option, j) => (
            <React.Fragment key={`1-${j}`}>
              <p>{option.titles[0].key}</p>

              {dimensions.length > 0 &&
                dimensions.map((XY, i) => {
                  const safeKey = option?.titles[0]?.key?.replace(
                    /\./g,
                    '_DOT_'
                  );

                  return (
                    <FormField
                      control={form.control}
                      name={`weights.${group.id}.choice.${safeKey}.weight${XY}`}
                      key={`0-${group.id}-${safeKey}`}
                      render={({ field }) => (
                        <FormItem>
                          <FormControl>
                            <div
                              className={`weight-${XY.toLowerCase()}-container`}>
                              <Input
                                type="number"
                                min={0}
                                max={100}
                                {...field}
                              />
                            </div>
                          </FormControl>
                          <FormMessage />
                        </FormItem>
                      )}
                    />
                  );
                })}
            </React.Fragment>
          ))}
      </div>
    </div>
  );

  return (
    <div>
      <ImageGalleryStyle />
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
                            className={`flex cursor-pointer justify-between border border-secondary ${
                              item.trigger == selectedItem?.trigger &&
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
                              onClick={() => {
                                setItem(item);
                                setOptions([]);
                                setMatrixOptions(matrixDefault);
                                setSettingOptions(false);
                              }}>
                              <span
                                dangerouslySetInnerHTML={{
                                  __html: item.title || 'Geen titel',
                                }}
                              />
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
                {form.watch('type') === 'matrix' ? (
                  matrixList.map((matrixItem) => (
                    <>
                      <div className="flex flex-col justify-between">
                        <div className="flex flex-col gap-y-2">
                          <Heading size="xl">{matrixItem.heading}</Heading>
                          <FormDescription>
                            {matrixItem.description}
                          </FormDescription>
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
                                      className={`flex cursor-pointer justify-between border border-secondary ${
                                        option.trigger ==
                                          selectedOption?.trigger &&
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
                                        onClick={() =>
                                          setMatrixOption({
                                            ...option,
                                            type: matrixItem.type,
                                          })
                                        }>
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
                            const currentOption = matrixOptions?.[
                              matrixItem.type
                            ].findIndex(
                              (option) =>
                                option.trigger === matrixOption?.trigger
                            );
                            const activeOption =
                              currentOption !== -1
                                ? currentOption
                                : matrixOptions?.[matrixItem.type]?.length;

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
                            );
                          })()}

                          <Button
                            className="w-full bg-secondary text-black hover:text-white mt-4"
                            type="button"
                            onClick={() =>
                              handleAddMatrixOption(
                                form.getValues(),
                                matrixItem.type
                              )
                            }>
                            {matrixOption &&
                            matrixOption.type === matrixItem.type
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
                                (setSettingOptions(() => !settingOptions),
                                  setMatrixOption(null));
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
                  ))
                ) : (
                  <div className="flex flex-col justify-between">
                    <div className="flex flex-col gap-y-2">
                      <Heading size="xl">Antwoordopties</Heading>
                      <Separator className="mt-2" />
                      {hasList() &&
                        (() => {
                          const currentOption = options.findIndex(
                            (option) =>
                              option.trigger === selectedOption?.trigger
                          );
                          const activeOption =
                            currentOption !== -1
                              ? currentOption
                              : options.length;

                          return form.watch('type') !== 'images' ? (
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
                                        marginTop: '10px',
                                      }}>
                                      {YesNoSelect(field, props)}
                                      <FormLabel
                                        style={{
                                          marginTop: 0,
                                          marginLeft: '6px',
                                        }}>
                                        Is &apos;Anders, namelijk...&apos;
                                      </FormLabel>
                                      <FormMessage />
                                    </FormItem>
                                    <FormDescription>
                                      Als je deze optie selecteert, wordt er
                                      automatisch een tekstveld toegevoegd aan
                                      het formulier. Het tekstveld wordt
                                      zichtbaar wanneer deze optie wordt
                                      geselecteerd.
                                    </FormDescription>
                                  </>
                                )}
                              />

                              {form.watch('type') === 'checkbox' && (
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
                                          marginTop: '10px',
                                        }}>
                                        {YesNoSelect(field, props)}
                                        <FormLabel
                                          style={{
                                            marginTop: 0,
                                            marginLeft: '6px',
                                          }}>
                                          Standaard aangevinkt?
                                        </FormLabel>
                                        <FormMessage />
                                      </FormItem>
                                      <FormDescription>
                                        Als je deze optie selecteert, wordt deze
                                        optie standaard aangevinkt.
                                      </FormDescription>
                                    </>
                                  )}
                                />
                              )}
                            </>
                          ) : (
                            <>
                              <ImageUploader
                                form={form}
                                project={project as string}
                                fieldName="imageOptionUpload"
                                imageLabel="Afbeelding"
                                allowedTypes={['image/*']}
                                onImageUploaded={(imageResult) => {
                                  const image = imageResult
                                    ? imageResult.url
                                    : '';

                                  form.setValue(
                                    `options.${activeOption}.titles.0.image`,
                                    image
                                  );
                                  form.resetField('imageOptionUpload');
                                }}
                              />

                              {!!form.getValues(
                                `options.${activeOption}.titles.0.image`
                              ) && (
                                <div style={{ position: 'relative' }}>
                                  <img
                                    src={form.getValues(
                                      `options.${activeOption}.titles.0.image`
                                    )}
                                  />
                                </div>
                              )}

                              <FormField
                                control={form.control}
                                name={`options.${activeOption}.titles.0.key`}
                                render={({ field }) => (
                                  <FormItem>
                                    <FormLabel>Titel</FormLabel>
                                    <FormDescription>
                                      Dit veld wordt gebruikt voor de alt tekst
                                      van de afbeelding. Dit is nodig voor
                                      toegankelijkheid. De titel wordt ook
                                      gebruikt als bijschrift onder de
                                      afbeelding, behalve als je de optie
                                      selecteert om de titel te verbergen.
                                    </FormDescription>
                                    <Input {...field} />
                                    <FormMessage />
                                  </FormItem>
                                )}
                              />

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
                                        marginTop: '10px',
                                      }}>
                                      {YesNoSelect(field, props)}
                                      <FormLabel
                                        style={{
                                          marginTop: 0,
                                          marginLeft: '6px',
                                        }}>
                                        Titel verbergen?
                                      </FormLabel>
                                      <FormMessage />
                                    </FormItem>
                                    <FormDescription>
                                      Als je deze optie selecteert, wordt de
                                      titel van de afbeelding verborgen.
                                    </FormDescription>
                                  </>
                                )}
                              />
                            </>
                          );
                        })()}

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
                          (setSettingOptions(() => !settingOptions),
                            setOption(null),
                            setOptions([]));
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
                                className={`flex cursor-pointer justify-between border border-secondary ${
                                  option.trigger == selectedOption?.trigger &&
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
              <div className="p-0 bg-transparent rounded-md flex flex-col justify-start col-span-2">
                <div className="w-full px-4 py-3 bg-white border-b-0 mb-4 rounded-md improvised-tab-list flex gap-4">
                  <button
                    type="button"
                    className={`
                      improvised-tabs 
                      px-2
                      ${activeTab === '1' ? 'active' : ''}`}
                    onClick={() => setActiveTab('1')}
                    style={{
                      color:
                        activeTab === '1'
                          ? 'hsl(222,84%,5%)'
                          : 'rgb(100, 116, 139)',
                      fontSize: '14px',
                    }}>
                    Instellingen & content
                  </button>
                  {dimensions.length > 0 && (
                    <button
                      type="button"
                      className={`
                        improvised-tabs 
                        px-2
                        ${activeTab === '2' ? 'active' : ''}`}
                      onClick={() => setActiveTab('2')}
                      style={{
                        color:
                          activeTab === '2'
                            ? 'hsl(222,84%,5%)'
                            : 'rgb(100, 116, 139)',
                        fontSize: '14px',
                      }}>
                      Weging
                    </button>
                  )}
                </div>

                <div className="p-6 bg-white rounded-md flex flex-col justify-between col-span-2">
                  <div
                    style={{ display: activeTab === '1' ? 'block' : 'none' }}>
                    <Heading size="xl">Keuzewijzer items</Heading>
                    <Separator className="my-4" />
                    <div className="w-full flex flex-col gap-y-8">
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
                                <SelectItem value="none">
                                  Informatie blok
                                </SelectItem>
                                <SelectItem value="radiobox">
                                  Radio buttons
                                </SelectItem>
                                <SelectItem value="text">Tekstveld</SelectItem>
                                <SelectItem value="checkbox">
                                  Checkboxes
                                </SelectItem>
                                <SelectItem value="map">Locatie</SelectItem>
                                <SelectItem value="imageUpload">
                                  Afbeelding upload
                                </SelectItem>
                                <SelectItem value="documentUpload">
                                  Document upload
                                </SelectItem>
                                <SelectItem value="select">Dropdown</SelectItem>
                                <SelectItem value="a-b-slider">
                                  Van A naar B slider
                                </SelectItem>
                                <SelectItem value="matrix">
                                  Matrix vraag
                                </SelectItem>
                                <SelectItem value="images">
                                  Antwoordopties met afbeeldingen
                                </SelectItem>
                              </SelectContent>
                            </Select>
                            <FormMessage />
                          </FormItem>
                        )}></FormField>
                      <FormField
                        control={form.control}
                        name="title"
                        render={({ field }) => (
                          <FormItem>
                            <FormLabel>Titel/Vraag</FormLabel>
                            <FormControl>
                              <TrixEditor
                                value={field.value || ''}
                                onChange={(val) => field.onChange(val)}
                              />
                            </FormControl>
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
                            <FormControl>
                              <TrixEditor
                                value={field.value || ''}
                                onChange={(val) => field.onChange(val)}
                              />
                            </FormControl>
                            <FormMessage />
                          </FormItem>
                        )}
                      />

                      <>
                        <ImageUploader
                          form={form}
                          project={project as string}
                          fieldName="uploadInfoImage"
                          imageLabel="Afbeeldingen uploaden boven de vraag"
                          description="Je kunt hier meerdere afbeeldingen tegelijk uploaden. Klik na het uploaden op een afbeelding om extra informatie toe te voegen, zoals een beschrijving of alternatieve tekst voor schermlezers."
                          allowedTypes={['image/*']}
                          allowMultiple={true}
                          onImageUploaded={(imageResult) => {
                            let defaultImageArr: ImageArray[] = [];

                            if (!!form.watch('infoImage')) {
                              defaultImageArr = [
                                {
                                  url: form.getValues('infoImage') || '',
                                  name: '',
                                  imageAlt: '',
                                  imageDescription: '',
                                },
                              ];

                              form.setValue('infoImage', '');
                            }

                            let array = [
                              ...(form.getValues('images') || defaultImageArr),
                            ];
                            array.push(imageResult);
                            form.setValue('images', array);
                            form.resetField('uploadInfoImage');
                            form.trigger('images');
                          }}
                        />

                        <div className="space-y-2 col-span-full md:col-span-1 flex flex-col">
                          {imageFields.length > 0 && (
                            <div className="grid">
                              <section className="grid col-span-full grid-cols-3 gap-y-8 gap-x-8 mb-4">
                                {imageFields.map(({ id, url }, index) => {
                                  return (
                                    <div
                                      key={id}
                                      className={`relative grid ${index === imageIndexOpen ? 'col-span-full' : 'tile'} gap-x-4 items-center image-gallery`}
                                      style={{
                                        gridTemplateColumns:
                                          index === imageIndexOpen
                                            ? '1fr 2fr 40px'
                                            : '1fr',
                                      }}>
                                      <div className="image-container">
                                        <img
                                          src={url}
                                          alt={url}
                                          onClick={() => {
                                            if (index === imageIndexOpen) {
                                              setImageIndexOpen(-1);
                                            } else {
                                              setImageIndexOpen(index);
                                            }
                                          }}
                                        />
                                      </div>
                                      <Button
                                        color="red"
                                        onClick={() => {
                                          removeImage(index);
                                        }}
                                        className="absolute left-0 top-0">
                                        <X size={24} />
                                      </Button>

                                      <div
                                        className="grid gap-y-4 items-center"
                                        style={{
                                          display:
                                            index === imageIndexOpen
                                              ? 'grid'
                                              : 'none',
                                        }}>
                                        <FormField
                                          control={form.control}
                                          name={`images.${index}.imageAlt`}
                                          render={({ field }) => (
                                            <FormItem className="col-span-full sm:col-span-2 md:col-span-2 lg:col-span-2">
                                              <FormLabel>
                                                Afbeelding beschrijving voor
                                                screenreaders
                                              </FormLabel>
                                              <FormControl>
                                                <Input {...field} />
                                              </FormControl>
                                              <FormMessage />
                                            </FormItem>
                                          )}
                                        />

                                        <FormField
                                          control={form.control}
                                          name={`images.${index}.imageDescription`}
                                          render={({ field }) => (
                                            <FormItem className="col-span-full sm:col-span-2 md:col-span-2 lg:col-span-2">
                                              <FormLabel>
                                                Beschrijving afbeelding
                                              </FormLabel>
                                              <FormControl>
                                                <Input {...field} />
                                              </FormControl>
                                              <FormMessage />
                                            </FormItem>
                                          )}
                                        />
                                      </div>

                                      <span className="grid gap-2 py-3 px-2 col-span-full justify-between arrow-container">
                                        <ArrowLeft
                                          className="cursor-pointer"
                                          onClick={() => moveUpImage(index)}
                                        />
                                        <ArrowRight
                                          className="cursor-pointer"
                                          onClick={() => moveDownImage(index)}
                                        />
                                      </span>
                                    </div>
                                  );
                                })}
                              </section>
                            </div>
                          )}
                        </div>

                        <FormField
                          control={form.control}
                          name="createImageSlider"
                          render={({ field }) => (
                            <FormItem>
                              <FormLabel>
                                Wil je van de afbeeldingen een slider maken?
                              </FormLabel>
                              <Select
                                onValueChange={(e: string) =>
                                  field.onChange(e === 'true')
                                }
                                value={field.value ? 'true' : 'false'}>
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

                        <FormField
                          control={form.control}
                          name="imageClickable"
                          render={({ field }) => (
                            <FormItem>
                              <FormLabel>
                                Moeten de afbeeldingen uitvergroot worden als
                                erop geklikt wordt?
                              </FormLabel>
                              <Select
                                onValueChange={(e: string) =>
                                  field.onChange(e === 'true')
                                }
                                value={field.value ? 'true' : 'false'}>
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
                      </>

                      <FormField
                        control={form.control}
                        name="showMoreInfo"
                        render={({ field }) => (
                          <FormItem>
                            <FormLabel>Extra info</FormLabel>
                            <FormDescription>
                              Wil je een blok met uitklapbare tekst toevoegen?
                              (bijvoorbeeld met extra uitleg)
                            </FormDescription>
                            <Select
                              onValueChange={(e: string) =>
                                field.onChange(e === 'true')
                              }
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

                      {form.watch('showMoreInfo') && (
                        <>
                          <FormField
                            control={form.control}
                            name="moreInfoButton"
                            render={({ field }) => (
                              <FormItem>
                                <FormLabel>
                                  Meer informatie knop tekst
                                </FormLabel>
                                <Input {...field} />
                                <FormMessage />
                              </FormItem>
                            )}
                          />

                          <FormField
                            control={form.control}
                            name="moreInfoContent"
                            render={({ field }) => (
                              <FormItem>
                                <FormLabel>Meer informatie tekst</FormLabel>
                                <Textarea rows={5} {...field} />
                                <FormMessage />
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
                              <FormLabel>Is dit veld verplicht?</FormLabel>
                              {form.watch('type') === 'matrix' && (
                                <FormDescription>
                                  Als je het veld <b>verplicht</b> maakt moeten
                                  gebruikers bij elke rij een antwoord
                                  selecteren. Als je het veld{' '}
                                  <b>niet verplicht</b> maakt kunnen gebruikers
                                  elke rij overslaan en invullen wat ze willen.
                                </FormDescription>
                              )}
                              <Select
                                onValueChange={(e: string) =>
                                  field.onChange(e === 'true')
                                }
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
                      {form.watch('type') === 'text' && (
                        <>
                          <FormField
                            control={form.control}
                            name="variant"
                            render={({ field }) => (
                              <FormItem>
                                <FormLabel>
                                  Is het veld qua grootte 1 regel of een
                                  tekstvak?
                                </FormLabel>
                                <Select
                                  value={field.value || 'text input'}
                                  onValueChange={field.onChange}>
                                  <FormControl>
                                    <SelectTrigger>
                                      <SelectValue placeholder="Kies een optie" />
                                    </SelectTrigger>
                                  </FormControl>
                                  <SelectContent>
                                    <SelectItem value="text input">
                                      1 regel
                                    </SelectItem>
                                    <SelectItem value="textarea">
                                      Tekstvak
                                    </SelectItem>
                                  </SelectContent>
                                </Select>
                                <FormMessage />
                              </FormItem>
                            )}
                          />

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

                      {form.watch('type') === 'matrix' && (
                        <FormField
                          control={form.control}
                          name="matrixMultiple"
                          render={({ field }) => (
                            <FormItem>
                              <FormLabel>
                                Mogen er meerdere antwoorden per rij worden
                                geselecteerd?
                              </FormLabel>
                              <Select
                                onValueChange={(e: string) =>
                                  field.onChange(e === 'true')
                                }
                                value={field.value ? 'true' : 'false'}>
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

                      {(form.watch('type') === 'imageUpload' ||
                        form.watch('type') === 'images' ||
                        form.watch('type') === 'documentUpload') && (
                        <FormField
                          control={form.control}
                          name="multiple"
                          render={({ field }) => (
                            <FormItem>
                              {form.watch('type') === 'imageUpload' ||
                              form.watch('type') === 'documentUpload' ? (
                                <FormLabel>
                                  Mogen er meerdere{' '}
                                  {form.watch('type') === 'documentUpload'
                                    ? 'documenten'
                                    : 'afbeeldingen'}{' '}
                                  tegelijkertijd geüpload worden?
                                </FormLabel>
                              ) : (
                                <FormLabel>
                                  Mogen er meerdere afbeeldingen geselecteerd
                                  worden?
                                </FormLabel>
                              )}
                              <Select
                                onValueChange={(e: string) =>
                                  field.onChange(e === 'true')
                                }
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
                            name="sliderTitleUnderB"
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

                          <FormField
                            control={form.control}
                            name="explanationA"
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
                            name="explanationB"
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

                          <div className="col-span-full md:col-span-1 flex flex-col">
                            <ImageUploader
                              form={form}
                              project={project as string}
                              imageLabel="Upload hier afbeelding A"
                              fieldName="imageUploadA"
                              allowedTypes={['image/*']}
                              onImageUploaded={(imageResult) => {
                                const result =
                                  typeof imageResult.url !== 'undefined'
                                    ? imageResult.url
                                    : '';
                                form.setValue('imageA', result);
                                form.resetField('imageUploadA');
                              }}
                            />
                          </div>

                          <div className="col-span-full md:col-span-1 flex flex-col">
                            <ImageUploader
                              form={form}
                              project={project as string}
                              imageLabel="Upload hier afbeelding B"
                              fieldName="imageUploadB"
                              allowedTypes={['image/*']}
                              onImageUploaded={(imageResult) => {
                                const result =
                                  typeof imageResult.url !== 'undefined'
                                    ? imageResult.url
                                    : '';
                                form.setValue('imageB', result);
                                form.resetField('imageUploadB');
                              }}
                            />
                          </div>

                          <div className="col-span-full md:col-span-1 flex flex-col my-2">
                            {!!form.watch('imageA') && (
                              <>
                                <label className="text-sm font-medium leading-none peer-disabled:cursor-not-allowed peer-disabled:opacity-70">
                                  Afbeelding A
                                </label>
                                <section className="grid col-span-full grid-cols-3 gap-x-4 gap-y-8 ">
                                  <div style={{ position: 'relative' }}>
                                    <img
                                      src={form.watch('imageA')}
                                      alt={form.watch('imageA')}
                                    />
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
                                <label className="text-sm font-medium leading-none peer-disabled:cursor-not-allowed peer-disabled:opacity-70">
                                  Afbeelding B
                                </label>
                                <section className="grid col-span-full grid-cols-3 gap-x-4 gap-y-8 ">
                                  <div style={{ position: 'relative' }}>
                                    <img
                                      src={form.watch('imageB')}
                                      alt={form.watch('imageB')}
                                    />
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

                          <div className="col-span-full md:col-span-1 flex flex-col gap-y-4 mb-4">
                            <FormField
                              control={form.control}
                              name="skipQuestion"
                              render={({ field }) => (
                                <FormItem>
                                  <FormLabel>
                                    Mogelijkheid om deze vraag over te slaan?
                                  </FormLabel>
                                  <FormDescription>
                                    Als je wil dat de gebruiker de vraag kan
                                    overslaan, selecteer dan &apos;Ja&apos;. Als
                                    de gebruiker de vraag overslaat, wordt de
                                    vraag niet meegenomen in de weging.
                                  </FormDescription>
                                  <Select
                                    onValueChange={(e: string) =>
                                      field.onChange(e === 'true')
                                    }
                                    value={field.value ? 'true' : 'false'}>
                                    <FormControl>
                                      <SelectTrigger>
                                        <SelectValue placeholder="Nee" />
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

                            {form.watch('skipQuestion') && (
                              <>
                                <FormField
                                  control={form.control}
                                  name="skipQuestionLabel"
                                  render={({ field }) => (
                                    <FormItem>
                                      <FormLabel>
                                        Tekst bij de checkbox voor het overslaan
                                      </FormLabel>
                                      <FormControl>
                                        <Input {...field} />
                                      </FormControl>
                                      <FormMessage />
                                    </FormItem>
                                  )}
                                />
                                <FormField
                                  control={form.control}
                                  name="skipQuestionAllowExplanation"
                                  render={({ field }) => (
                                    <FormItem>
                                      <FormLabel>
                                        Mogelijkheid voor de gebruiker om
                                        toelichting te geven voor het overslaan?
                                      </FormLabel>
                                      <Select
                                        onValueChange={(e: string) =>
                                          field.onChange(e === 'true')
                                        }
                                        value={field.value ? 'true' : 'false'}>
                                        <FormControl>
                                          <SelectTrigger>
                                            <SelectValue placeholder="Nee" />
                                          </SelectTrigger>
                                        </FormControl>
                                        <SelectContent>
                                          <SelectItem value="true">
                                            Ja
                                          </SelectItem>
                                          <SelectItem value="false">
                                            Nee
                                          </SelectItem>
                                        </SelectContent>
                                      </Select>
                                      <FormMessage />
                                    </FormItem>
                                  )}
                                />

                                {form.watch('skipQuestionAllowExplanation') && (
                                  <FormField
                                    control={form.control}
                                    name="skipQuestionExplanation"
                                    render={({ field }) => (
                                      <FormItem>
                                        <FormLabel>
                                          Titel boven het tekstveld van de
                                          toelichting
                                        </FormLabel>
                                        <FormControl>
                                          <Input {...field} />
                                        </FormControl>
                                        <FormMessage />
                                      </FormItem>
                                    )}
                                  />
                                )}
                              </>
                            )}
                          </div>
                        </div>
                      )}

                      {form.watch('type') === 'text' && (
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

                      {(form.watch('type') === 'checkbox' ||
                        (form.watch('type') === 'images' &&
                          form.watch('multiple'))) && (
                        <>
                          <FormField
                            control={form.control}
                            name="maxChoices"
                            render={({ field }) => (
                              <FormItem>
                                <FormLabel>
                                  Maximaal te selecteren opties
                                </FormLabel>
                                <FormDescription>
                                  <em className="text-xs">
                                    Als je wilt dat er maximaal een aantal
                                    opties geselecteerd kunnen worden, vul dan
                                    hier het aantal in.
                                  </em>
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
                                  <em className="text-xs">
                                    Als het maximaal aantal opties is
                                    geselecteerd, geef dan een melding aan de
                                    gebruiker. Dit is optioneel.
                                  </em>
                                </FormDescription>
                                <Input {...field} />
                                <FormMessage />
                              </FormItem>
                            )}
                          />
                        </>
                      )}

                      <FormField
                        control={form.control}
                        name="routingInitiallyHide"
                        render={({ field }) => (
                          <FormItem>
                            <FormLabel>
                              Is deze vraag altijd zichtbaar?
                            </FormLabel>
                            <Select
                              onValueChange={(e: string) =>
                                field.onChange(e === 'true')
                              }
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

                      {form.watch('routingInitiallyHide') && (
                        <>
                          <FormField
                            control={form.control}
                            name="routingSelectedQuestion"
                            render={({ field }) => {
                              const formFields = items || [];
                              let formMultipleChoiceFields = formFields.filter(
                                (f: any) =>
                                  (f.type === 'select' ||
                                    f.type === 'radiobox' ||
                                    f.type === 'images' ||
                                    f.type === 'checkbox') &&
                                  f.trigger !== form.watch('trigger')
                              );

                              return (
                                <FormItem>
                                  <FormLabel>
                                    Welke vraag beïnvloedt de zichtbaarheid van
                                    deze vraag?
                                  </FormLabel>

                                  {formMultipleChoiceFields.length === 0 ? (
                                    <p
                                      className="text-sm"
                                      style={{
                                        padding: '11px',
                                        borderLeft: '4px solid red',
                                        backgroundColor: '#ffdbd7',
                                        borderTopRightRadius: '5px',
                                        borderBottomRightRadius: '5px',
                                        marginTop: '12px',
                                      }}>
                                      Je hebt nog geen meerkeuze, multiplechoice
                                      of afbeelding keuze vragen toegevoegd.
                                      Voeg deze eerst toe om deze vraag te
                                      kunnen tonen op basis van een ander
                                      antwoord.
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
                                        {formMultipleChoiceFields.map(
                                          (f: any) => (
                                            <SelectItem
                                              key={f.trigger}
                                              value={f.trigger}>
                                              {f.title || f.fieldKey}
                                            </SelectItem>
                                          )
                                        )}
                                      </SelectContent>
                                    </Select>
                                  )}

                                  <FormMessage />
                                </FormItem>
                              );
                            }}
                          />

                          {form.watch('routingSelectedQuestion') !== '' && (
                            <FormField
                              control={form.control}
                              name="routingSelectedAnswer"
                              render={({ field }) => {
                                const selectedQuestion = items?.find(
                                  (i: any) =>
                                    i.trigger ===
                                    form.watch('routingSelectedQuestion')
                                );
                                const options = selectedQuestion?.options || [];

                                return (
                                  <FormItem>
                                    <FormLabel>
                                      Bij welk antwoord moet deze vraag getoond
                                      worden?
                                    </FormLabel>

                                    {options.length === 0 ? (
                                      <p
                                        className="text-sm"
                                        style={{
                                          padding: '11px',
                                          borderLeft: '4px solid red',
                                          backgroundColor: '#ffdbd7',
                                          borderTopRightRadius: '5px',
                                          borderBottomRightRadius: '5px',
                                          marginTop: '12px',
                                        }}>
                                        De geselecteerde vraag heeft nog geen
                                        antwoordopties. Voeg deze eerst toe om
                                        deze vraag te kunnen tonen op basis van
                                        een ander antwoord.
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
                                            <SelectItem
                                              key={o.trigger}
                                              value={o.trigger}>
                                              {o.titles?.[0]?.key || o.trigger}
                                            </SelectItem>
                                          ))}
                                        </SelectContent>
                                      </Select>
                                    )}

                                    <FormMessage />
                                  </FormItem>
                                );
                              }}
                            />
                          )}
                        </>
                      )}

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

                      {hasOptions() && (
                        <FormItem>
                          <Button
                            className="w-fit mt-4 bg-secondary text-black hover:text-white"
                            type="button"
                            onClick={() => setSettingOptions(!settingOptions)}>
                            {form.watch('type') === 'matrix'
                              ? `Matrix antwoordopties aanpassen`
                              : `Antwoordopties (${options.length}) aanpassen`}
                          </Button>
                          <FormMessage />
                        </FormItem>
                      )}
                    </div>
                  </div>

                  <div
                    className="p-0"
                    style={{ display: activeTab === '2' ? 'block' : 'none' }}>
                    <div className="p-6 bg-white rounded-md flex flex-col justify-between col-span-2">
                      <Heading size="xl">
                        Bepaal de weging per vraaggroep
                      </Heading>

                      {form.watch('type') === 'a-b-slider' && (
                        <p
                          style={{
                            fontSize: '14px',
                            marginTop: '10px',
                          }}>
                          In dit scherm vind je de keuze opties die je in het
                          tabblad &apos;Keuze opties&apos; kunt aanmaken. Per
                          vraag stel je hier in welke weging je meegeeft aan de
                          antwoorden. Zo werkt dat:
                          <ul
                            style={{
                              listStyleType: 'disc',
                              paddingLeft: '20px',
                              marginTop: '10px',
                              marginBottom: '10px',
                            }}>
                            <li key="li-0">
                              Kies of een A/B slider helemaal naar links (A) of
                              naar rechts (B) moet worden gesleept voor de
                              maximale weging;
                            </li>
                            <li key="li-1">
                              Geef een getal mee voor hoeveel de vraag meetelt
                              in de totale weging. 0 = geen weging, 100 =
                              maximale weging. Als je een keuze optie niet wilt
                              beïnvloeden met een vraag, vul dan 0 in.
                            </li>
                          </ul>
                          Heb je de weergave van de voorkeuren ingesteld als
                          &apos;In een vlak&apos;? Dan kun je ook een verticale
                          weging meegeven. De opties &apos;Y&apos; bepalen die
                          verticale weging.
                        </p>
                      )}

                      <Separator className="my-4" />

                      {form.watch('type') !== 'a-b-slider' &&
                        DimensionHeading()}

                      <div className="w-full mt-4 flex flex-col gap-y-4">
                        {(() => {
                          const isPlaneType =
                            widget?.config?.choiceGuide?.choicesType ===
                            'plane';
                          const isCheckboxType = [
                            'checkbox',
                            'radiobox',
                            'select',
                            'images',
                          ].includes(form.watch('type') || '');

                          if (isCheckboxType && isPlaneType) {
                            return weightOptionsFields({ id: 'plane' }, 999);
                          }

                          if (isCheckboxType) {
                            return widget?.config?.choiceOption?.choiceOptions?.map(
                              (singleGroup: ChoiceOptions, index: number) =>
                                weightOptionsFields(singleGroup, index)
                            );
                          }

                          if (isPlaneType) {
                            return weightFields({ id: 'plane' }, 999);
                          }

                          return widget?.config?.choiceOption?.choiceOptions?.map(
                            (singleGroup: ChoiceOptions, index: number) =>
                              weightFields(singleGroup, index)
                          );
                        })()}
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
