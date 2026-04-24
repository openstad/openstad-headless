import ImageGalleryStyle from '@/components/image-gallery-style';
import MapInput from '@/components/maps/leaflet-input';
import { SimpleCalendar } from '@/components/simple-calender-popup';
import { Button } from '@/components/ui/button';
import { CodeEditor } from '@/components/ui/code-editor';
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
import { Separator } from '@/components/ui/separator';
import { Textarea } from '@/components/ui/textarea';
import { Heading } from '@/components/ui/typography';
import { useProject } from '@/hooks/use-project';
import useResource from '@/hooks/use-resource';
import useStatuses from '@/hooks/use-statuses';
import useTags from '@/hooks/use-tags';
import { zodResolver } from '@hookform/resolvers/zod';
import {
  ArrowDown,
  ArrowLeft,
  ArrowRight,
  ArrowUp,
  Plus,
  X,
} from 'lucide-react';
import dynamic from 'next/dynamic';
import { useRouter } from 'next/router';
import React, { useCallback, useEffect, useState } from 'react';
import { useFieldArray, useForm } from 'react-hook-form';
import toast from 'react-hot-toast';
import * as z from 'zod';

import { CheckboxList } from './checkbox-list';
import { DocumentUploader } from './document-uploader';
import { ImageUploader } from './image-uploader';

const TrixEditor = dynamic(
  () =>
    import('@openstad-headless/ui/src/form-elements/text/index').then(
      (mod) => mod.TrixEditor
    ),
  { ssr: false }
);

const onlyNumbersMessage = 'Dit veld mag alleen nummers bevatten';
const minError = (field: string, nr: number) =>
  `${field} moet minimaal ${nr} karakters bevatten`;
const maxError = (field: string, nr: number) =>
  `${field} mag maximaal ${nr} karakters bevatten`;

const baseSchema = z.object({
  userId: z.coerce
    .number({ invalid_type_error: onlyNumbersMessage })
    .optional(),

  title: z.string().default(''),
  summary: z.string().default(''),
  description: z.string().default(''),

  budget: z.coerce
    .number({ invalid_type_error: onlyNumbersMessage })
    .default(0),
  budgetMin: z.coerce
    .number({ invalid_type_error: onlyNumbersMessage })
    .optional(),
  budgetMax: z.coerce
    .number({ invalid_type_error: onlyNumbersMessage })
    .optional(),
  budgetInterval: z.coerce
    .number({ invalid_type_error: onlyNumbersMessage })
    .optional(),

  startDate: z.date(),
  publishDate: z.date().optional(),

  modBreaks: z
    .array(
      z.object({
        id: z.string(),
        description: z.string().default(''),
        authorName: z.string().optional().default(''),
        modBreakDate: z.string().optional().default(''),
      })
    )
    .optional()
    .default([]),

  location: z.string().optional(),
  image: z.string().optional(),
  imageDescription: z.string().optional(),
  images: z
    .array(
      z.object({
        url: z.string(),
        name: z.string().optional(),
        description: z.string().optional(),
      })
    )
    .optional()
    .default([]),
  document: z.string().optional(),
  documents: z
    .array(
      z.object({ url: z.string().optional(), name: z.string().optional() })
    )
    .optional()
    .default([]),

  extraData: z
    .object({
      originalId: z.coerce
        .number({ invalid_type_error: onlyNumbersMessage })
        .optional(),
    })
    .default({}),
  tags: z.number().array().default([]),
  statuses: z.number().array().default([]),
});

const formSchema = (
  titleLimits: { min: number; max: number },
  summaryLimits: { min: number; max: number },
  descriptionLimits: { min: number; max: number }
) =>
  baseSchema.extend({
    title: z
      .string()
      .min(titleLimits.min, minError('Titel', titleLimits.min))
      .max(titleLimits.max, maxError('Titel', titleLimits.max))
      .default(''),
    summary: z
      .string()
      .min(summaryLimits.min, minError('Samenvatting', summaryLimits.min))
      .max(summaryLimits.max, maxError('Samenvatting', summaryLimits.max))
      .default(''),
    description: z
      .string()
      .min(
        descriptionLimits.min,
        minError('Beschrijving', descriptionLimits.min)
      )
      .max(
        descriptionLimits.max,
        maxError('Beschrijving', descriptionLimits.max)
      )
      .default(''),
  });

type FormType = z.infer<typeof baseSchema>;

type Props = {
  onFormSubmit: (body: FormType) => Promise<any>;
};

export default function ResourceForm({ onFormSubmit }: Props) {
  const router = useRouter();
  const { project, id } = router.query;
  const { data: projectData } = useProject();

  const {
    data: existingData,
    error,
    mutate,
  } = useResource(project as string, id as string);

  const titleLimits = {
    min: projectData?.config?.resources?.titleMinLength || 10,
    max: projectData?.config?.resources?.titleMaxLength || 50,
  };

  const summaryLimits = {
    min: projectData?.config?.resources?.summaryMinLength || 20,
    max: projectData?.config?.resources?.summaryMaxLength || 140,
  };

  const descriptionLimits = {
    min: projectData?.config?.resources?.descriptionMinLength || 140,
    max: projectData?.config?.resources?.descriptionMaxLength || 5000,
  };

  const { data: tags, error: tagError } = useTags(project as string);
  const { data: statuses, error: statusError } = useStatuses(project as string);

  let loadedTags = (tags || []) as {
    id: number;
    name: string;
    type?: string;
  }[];

  let loadedStatuses = (statuses || []) as {
    id: number;
    name: string;
  }[];

  loadedTags = loadedTags.sort((a, b) => {
    const aType = a.type ?? '';
    const bType = b.type ?? '';

    if (aType < bType) return -1;
    if (aType > bType) return 1;

    if (a.name < b.name) return -1;
    if (a.name > b.name) return 1;
    return 0;
  });
  const budgetFallback = (existingData: any, key: string = '') => {
    if (!existingData) return 0;

    if (typeof existingData?.budget === 'number') {
      return existingData.budget;
    }

    return existingData[key] || 0;
  };

  const defaults = useCallback(
    (): FormType => ({
      userId: existingData?.userId || undefined,

      title: existingData?.title || '',
      summary: existingData?.summary || '',
      description: existingData?.description || '',
      budget: budgetFallback(existingData),
      budgetMin: budgetFallback(existingData, 'min'),
      budgetMax: budgetFallback(existingData, 'max'),
      budgetInterval: budgetFallback(existingData, 'interval'),
      tags:
        existingData?.tags?.map((t: any) => t.id) ||
        projectData?.config?.resources?.defaultTagIds ||
        [],
      statuses:
        existingData?.statuses?.map((t: any) => t.id) ||
        projectData?.config?.resources?.defaultStatusIds ||
        [],
      startDate: existingData?.startDate
        ? new Date(existingData?.startDate)
        : new Date(),
      publishDate: existingData?.publishDate
        ? new Date(existingData.publishDate)
        : new Date(),

      modBreaks:
        existingData?.modBreaks?.map((mb: any) => ({
          id: mb.id || crypto.randomUUID(),
          description: mb.description || '',
          authorName: mb.authorName || '',
          modBreakDate: mb.modBreakDate
            ? mb.modBreakDate.includes('T')
              ? mb.modBreakDate.slice(0, 16)
              : mb.modBreakDate + 'T00:00'
            : '',
        })) || [],

      location: existingData?.location
        ? JSON.stringify(existingData?.location)
        : '',
      image: '',
      images: existingData?.images || [],
      document: '',
      documents: existingData?.documents || [],
      extraData: {
        originalId: existingData?.extraData?.originalId || undefined,
      },
    }),
    [existingData]
  );
  const [extraData, setExtraData] = useState(existingData?.extraData || '');
  const [imageIndexOpen, setImageIndexOpen] = useState<number>(-1);

  const [targetUser, setTargetUser] = useState<{
    name?: string;
    email?: string;
    displayName?: string;
  } | null>(null);
  const [isLoadingTargetUser, setIsLoadingTargetUser] = useState(false);
  const [pendingUserId, setPendingUserId] = useState<number | null>(null);

  useEffect(() => {
    if (!pendingUserId || !project || pendingUserId === existingData?.userId) {
      setTargetUser(null);
      return;
    }

    const timeoutId = setTimeout(async () => {
      setIsLoadingTargetUser(true);
      try {
        const res = await fetch(
          `/api/openstad/api/project/${project}/user/${pendingUserId}`
        );
        if (res.ok) {
          const userData = await res.json();
          setTargetUser(userData);
        } else {
          setTargetUser(null);
        }
      } catch {
        setTargetUser(null);
      } finally {
        setIsLoadingTargetUser(false);
      }
    }, 500);

    return () => clearTimeout(timeoutId);
  }, [pendingUserId, project, existingData?.userId]);

  const form = useForm<FormType>({
    resolver: zodResolver<any>(
      formSchema(titleLimits, summaryLimits, descriptionLimits)
    ),
    defaultValues: defaults(),
  });

  function onSubmit(values: FormType) {
    // Add extraData if its valid JSON
    try {
      if (extraData !== values.extraData) {
        values.extraData = JSON.parse(extraData);
      }
    } catch (e) {}

    onFormSubmit(values)
      .then(() => {
        toast.success(`Plan successvol ${id ? 'aangepast' : 'aangemaakt'}`);
        router.push(`/projects/${project}/resources`);

        // SWR reload
        const url = `/api/openstad/api/project/${project}/resource/${id}`;
        mutate(url);
      })
      .catch((e) => {
        toast.error(`Plan kon niet ${id ? 'aangepast' : 'aangemaakt'} worden`);
      });
  }

  useEffect(() => {
    if (existingData) {
      form.reset(defaults());
    } else {
      let resetValues: { tags?: number[]; statuses?: number[] } = {};
      if (projectData?.config?.resources?.defaultTagIds) {
        const selectedTags = form.getValues('tags') || [];

        if (selectedTags.length === 0) {
          const projectTags = Array.isArray(
            projectData.config.resources.defaultTagIds
          )
            ? projectData.config.resources.defaultTagIds
            : [];
          resetValues.tags = Array.from(
            new Set([...selectedTags, ...projectTags])
          );
        }
      }
      if (projectData?.config?.resources?.defaultStatusIds) {
        const selectedStatuses = form.getValues('statuses') || [];

        if (selectedStatuses.length === 0) {
          const projectStatuses = Array.isArray(
            projectData.config.resources.defaultStatusIds
          )
            ? projectData.config.resources.defaultStatusIds
            : [];
          resetValues.statuses = Array.from(
            new Set([...selectedStatuses, ...projectStatuses])
          );
        }
      }
      form.reset(resetValues);
    }
  }, [
    existingData,
    form,
    defaults,
    projectData?.config?.resources?.defaultTagIds,
    projectData?.config?.resources?.defaultStatusIds,
  ]);

  const {
    fields: imageFields,
    remove: removeImage,
    swap: swapImage,
  } = useFieldArray({
    control: form.control,
    name: 'images',
  });

  const { fields: documentFields, remove: removeFile } = useFieldArray({
    control: form.control,
    name: 'documents',
  });

  const {
    fields: modBreakFields,
    append: appendModBreak,
    remove: removeModBreak,
    swap: swapModBreak,
  } = useFieldArray({
    control: form.control,
    name: 'modBreaks',
  });

  const moveUpModBreak = (index: number) => {
    if (index <= 0) return;
    swapModBreak(index, index - 1);
  };

  const moveDownModBreak = (index: number) => {
    if (index >= modBreakFields.length - 1) return;
    swapModBreak(index, index + 1);
  };

  const modbreakTitle = projectData?.config?.resources?.modbreakTitle || '';

  const moveUpImage = (index: number) => {
    if (index <= 0) return;
    swapImage(index, index - 1);
  };

  const moveDownImage = (index: number) => {
    if (index >= imageFields.length - 1) return;
    swapImage(index, index + 1);
  };

  const handleLocationSelect = useCallback(
    (location: string) => {
      if (location !== '') {
        let formatted = location.split(',');
        form.setValue(
          'location',
          JSON.stringify({
            lat: parseFloat(formatted[0]),
            lng: parseFloat(formatted[1]),
          })
        );
      }
    },
    [form]
  );

  return (
    <div className="p-6 bg-white rounded-md">
      <ImageGalleryStyle />
      <Form {...form}>
        <Heading size="xl">{id ? 'Aanpassen' : 'Toevoegen'}</Heading>
        <Separator className="my-4" />
        <form
          onSubmit={form.handleSubmit(onSubmit)}
          className="lg:w-3/3 grid grid-cols-2 lg:auto-rows-fit gap-10">
          <FormField
            control={form.control}
            name="title"
            render={({ field }) => (
              <FormItem className="col-span-full lg:col-span-1">
                <FormLabel>Titel</FormLabel>
                <FormControl>
                  <Input placeholder="" {...field} />
                </FormControl>
                <FormMessage />
              </FormItem>
            )}
          />
          <FormField
            control={form.control}
            name="summary"
            render={({ field }) => (
              <FormItem className="col-span-full lg:col-span-1">
                <FormLabel>Samenvatting</FormLabel>
                <FormControl>
                  <Input {...field} />
                </FormControl>
                <FormMessage />
              </FormItem>
            )}
          />
          <FormField
            control={form.control}
            name="description"
            render={({ field }) => (
              <FormItem className="col-span-full sm:col-span-2 md:col-span-2 lg:col-span-2">
                <FormLabel>Beschrijving</FormLabel>
                <FormControl>
                  {typeof window !== 'undefined' && (
                    <TrixEditor
                      value={field.value || ''}
                      onChange={(val) => field.onChange(val)}
                    />
                  )}
                </FormControl>
                <FormMessage />
              </FormItem>
            )}
          />

          <ImageUploader
            form={form}
            project={project as string}
            fieldName="image"
            allowedTypes={['image/*']}
            allowMultiple={true}
            onImageUploaded={(imageResult) => {
              let array = [...(form.getValues('images') || [])];
              array.push(imageResult);
              form.setValue('images', array);
              form.resetField('image');
              form.trigger('images');
            }}
          />

          <DocumentUploader
            form={form}
            project={project as string}
            fieldName="document"
            allowMultiple={true}
            allowedTypes={[
              'application/pdf',
              'application/msword',
              'application/vnd.openxmlformats-officedocument.wordprocessingml.document',
              'application/vnd.ms-excel',
              'application/vnd.openxmlformats-officedocument.spreadsheetml.sheet',
              'application/vnd.ms-powerpoint',
              'application/vnd.openxmlformats-officedocument.presentationml.presentation',
            ]}
            onDocumentUploaded={(documentResult) => {
              let array = [...(form.getValues('documents') || [])];
              array.push(documentResult);
              form.setValue('documents', array);
              form.resetField('document');
              form.trigger('documents');
            }}
          />

          <div className="space-y-2 col-span-full md:col-span-1 flex flex-col">
            {imageFields.length > 0 && (
              <div className="grid">
                <label className="text-sm font-medium leading-none peer-disabled:cursor-not-allowed peer-disabled:opacity-70 mb-1">
                  Afbeeldingen
                </label>
                <p className="text-sm text-muted-foreground mb-2">
                  Klik op een afbeelding om het beschrijvingsveld te openen.
                </p>
                <section className="grid col-span-full grid-cols-3 gap-y-8 gap-x-8 mb-4">
                  {imageFields.map(({ id, url }, index) => {
                    return (
                      <div
                        key={id}
                        className={`relative grid ${
                          index === imageIndexOpen ? 'col-span-full' : 'tile'
                        } gap-x-4 items-center image-gallery`}
                        style={{
                          gridTemplateColumns:
                            index === imageIndexOpen ? '1fr 2fr 40px' : '1fr',
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
                            display: index === imageIndexOpen ? 'grid' : 'none',
                          }}>
                          <FormField
                            control={form.control}
                            name={`images.${index}.description`}
                            render={({ field }) => (
                              <FormItem className="col-span-full sm:col-span-2 md:col-span-2 lg:col-span-2">
                                <FormLabel>Beschrijving</FormLabel>
                                <FormDescription>
                                  Op de detailpagina van de inzending is er een
                                  optie waarmee je deze beschrijving kunt tonen.
                                </FormDescription>
                                <FormControl>
                                  <Input {...field} />
                                </FormControl>
                                <FormMessage />
                              </FormItem>
                            )}
                          />
                        </div>
                        {imageFields.length > 1 && (
                          <span className="grid gap-2 py-3 px-2 col-span-full justify-between arrow-container">
                            <button
                              type="button"
                              onClick={() => moveUpImage(index)}
                              aria-label="Move image left">
                              <ArrowLeft className="cursor-pointer" />
                            </button>
                            <button
                              type="button"
                              onClick={() => moveDownImage(index)}
                              aria-label="Move image right">
                              <ArrowRight className="cursor-pointer" />
                            </button>
                          </span>
                        )}
                      </div>
                    );
                  })}
                </section>
              </div>
            )}
          </div>

          <div className="space-y-2 col-span-full md:col-span-1 flex flex-col">
            {documentFields.length > 0 && (
              <>
                <label className="text-sm font-medium leading-none peer-disabled:cursor-not-allowed peer-disabled:opacity-70">
                  Documenten
                </label>
                <section className="grid col-span-full grid-cols-1 gap-x-4 gap-y-8 ">
                  {documentFields.map(({ id, url, name }, index) => {
                    return (
                      <div key={id} className="relative flex flex-wrap">
                        <div className="relative flex">
                          <Button
                            color="red"
                            onClick={() => {
                              removeFile(index);
                            }}
                            className="relative right-0 top-0 p-1">
                            <X size={24} />
                          </Button>
                          <p>
                            <a
                              className="text-blue-500 underline text-base leading-5"
                              href={url}
                              target="_blank">
                              {url}
                            </a>
                          </p>
                        </div>
                        <Input
                          className="block w-full"
                          type="text"
                          name="name"
                          defaultValue={name}
                          onBlur={(e) => {
                            let array = [
                              ...(form.getValues('documents') || []),
                            ];

                            if (
                              e.target.value &&
                              array.length > 0 &&
                              typeof array[index] !== 'undefined' &&
                              typeof array[index].name !== 'undefined' &&
                              e.target.value !== array[index].name
                            ) {
                              array[index].name = e.target.value;

                              form.setValue('documents', array);
                              form.trigger('documents');
                            }
                          }}
                        />
                      </div>
                    );
                  })}
                </section>
              </>
            )}
          </div>
          <FormField
            control={form.control}
            name="budget"
            render={({ field }) => (
              <FormItem className="col-span-1">
                <FormLabel>Budget</FormLabel>
                <FormControl>
                  <Input placeholder="" {...field} />
                </FormControl>
                <FormMessage />
              </FormItem>
            )}
          />

          <FormField
            control={form.control}
            name="extraData.originalId"
            render={({ field }) => (
              <FormItem className="col-span-full col-span-1">
                <FormLabel>
                  Resource ID van het originele resource (optioneel)
                </FormLabel>
                <FormControl>
                  <Input type="number" placeholder="1" {...field} />
                </FormControl>
                <FormMessage />
              </FormItem>
            )}
          />
          <FormField
            control={form.control}
            name="userId"
            render={({ field }) => (
              <FormItem className="col-span-full lg:col-span-1">
                <FormLabel>
                  ID van de gebruiker die aan deze resource is gekoppeld
                  (optioneel)
                </FormLabel>
                <FormControl>
                  <Input
                    placeholder="1"
                    {...field}
                    onChange={(e) => {
                      field.onChange(e);
                      const value = parseInt(e.target.value);
                      setPendingUserId(value || null);
                    }}
                  />
                </FormControl>
                {existingData?.user && (
                  <FormDescription className="text-sm text-gray-600">
                    Huidige gebruiker:{' '}
                    {existingData.user.displayName ||
                      existingData.user.name ||
                      'Onbekend'}
                    {existingData.user.email && ` (${existingData.user.email})`}
                  </FormDescription>
                )}
                {isLoadingTargetUser && (
                  <FormDescription className="text-sm text-gray-500">
                    Gebruiker zoeken...
                  </FormDescription>
                )}
                {targetUser && !isLoadingTargetUser && (
                  <FormDescription className="text-sm text-blue-600">
                    Nieuwe gebruiker:{' '}
                    {targetUser.displayName || targetUser.name || 'Onbekend'}
                    {targetUser.email && ` (${targetUser.email})`}
                  </FormDescription>
                )}
                {pendingUserId &&
                  !isLoadingTargetUser &&
                  !targetUser &&
                  pendingUserId !== existingData?.userId && (
                    <FormDescription className="text-sm text-red-600">
                      Gebruiker niet gevonden
                    </FormDescription>
                  )}
                <FormMessage />
              </FormItem>
            )}
          />

          {/* <FormField
            control={form.control}
            name="budgetMin"
            render={({ field }) => (
              <FormItem className="col-span-1">
                <FormLabel>Minimum budget (optioneel)</FormLabel>
                <FormControl>
                  <Input placeholder="" {...field} />
                </FormControl>
                <FormMessage />
              </FormItem>
            )}
          />

          <FormField
            control={form.control}
            name="budgetMax"
            render={({ field }) => (
              <FormItem className="col-span-1">
                <FormLabel>Maximum budget (optioneel)</FormLabel>
                <FormControl>
                  <Input type="number" min={0} placeholder="" {...field} />
                </FormControl>
                <FormMessage />
              </FormItem>
            )}
          />

          <FormField
            control={form.control}
            name="budgetInterval"
            render={({ field }) => (
              <FormItem className="col-span-1">
                <FormLabel>Interval budget (optioneel)</FormLabel>
                <FormControl>
                  <Input type="number" min={0} placeholder="" {...field} />
                </FormControl>
                <FormMessage />
              </FormItem>
            )}
          /> */}

          <FormField
            control={form.control}
            name="location"
            render={({ field }) => (
              <MapInput onSelectLocation={handleLocationSelect} field={field} />
            )}
          />

          <Separator className="lg:col-span-2 my-6" />

          <div className="lg:col-span-2 col-span-2">
            <Heading size="xl">Modbreaks</Heading>
            {!modbreakTitle && (
              <p className="text-sm text-orange-600 mb-4">
                Geen standaardnaam ingesteld.{' '}
                <a
                  href={`/projects/${project}/settings/resource`}
                  className="underline hover:no-underline">
                  Stel deze in bij projectinstellingen &rarr;
                </a>
              </p>
            )}
            {modBreakFields.length === 0 && (
              <p className="text-sm text-muted-foreground mb-4">
                Nog geen modbreaks toegevoegd.
              </p>
            )}
            {modBreakFields.map((field, index) => (
              <div key={field.id} className="border rounded-md p-4 mb-4">
                <div className="flex items-center justify-between mb-2">
                  <span className="text-sm font-medium">
                    Modbreak {index + 1}
                  </span>
                  <div className="flex items-center gap-1">
                    <Button
                      type="button"
                      variant="ghost"
                      size="sm"
                      disabled={index === 0}
                      onClick={() => moveUpModBreak(index)}>
                      <ArrowUp size={16} />
                    </Button>
                    <Button
                      type="button"
                      variant="ghost"
                      size="sm"
                      disabled={index === modBreakFields.length - 1}
                      onClick={() => moveDownModBreak(index)}>
                      <ArrowDown size={16} />
                    </Button>
                    <Button
                      type="button"
                      variant="ghost"
                      size="sm"
                      onClick={() => removeModBreak(index)}>
                      <X size={16} />
                    </Button>
                  </div>
                </div>

                <FormField
                  control={form.control}
                  name={`modBreaks.${index}.description`}
                  render={({ field: descField }) => (
                    <FormItem className="mb-4">
                      <FormLabel>Inhoud</FormLabel>
                      <FormControl>
                        <TrixEditor
                          value={descField.value}
                          onChange={(val) => descField.onChange(val)}
                        />
                      </FormControl>
                      <FormMessage />
                    </FormItem>
                  )}
                />

                <div className="grid grid-cols-2 gap-4">
                  <FormField
                    control={form.control}
                    name={`modBreaks.${index}.authorName`}
                    render={({ field: nameField }) => (
                      <FormItem>
                        <FormLabel>Naam</FormLabel>
                        <FormControl>
                          <Input
                            placeholder={
                              modbreakTitle
                                ? `Laat leeg voor: ${modbreakTitle}`
                                : 'Naam van de auteur'
                            }
                            {...nameField}
                          />
                        </FormControl>
                        <FormMessage />
                      </FormItem>
                    )}
                  />

                  <FormField
                    control={form.control}
                    name={`modBreaks.${index}.modBreakDate`}
                    render={({ field: dateField }) => (
                      <FormItem>
                        <FormLabel>Datum en tijd</FormLabel>
                        <FormDescription>
                          Staat de tijd op 00:00? Dan wordt alleen de datum
                          getoond.{' '}
                          <a
                            href="#"
                            className="underline hover:no-underline"
                            onClick={(e) => {
                              e.preventDefault();
                              const dateOnly = dateField.value?.slice(0, 10);
                              if (dateOnly) {
                                dateField.onChange(dateOnly + 'T00:00');
                              }
                            }}>
                            Zet op 00:00
                          </a>
                        </FormDescription>
                        <FormControl>
                          <Input type="datetime-local" {...dateField} />
                        </FormControl>
                        <FormMessage />
                      </FormItem>
                    )}
                  />
                </div>
              </div>
            ))}
            <Button
              type="button"
              variant="outline"
              onClick={() =>
                appendModBreak({
                  id: crypto.randomUUID(),
                  description: '',
                  authorName: '',
                  modBreakDate: (() => {
                    const now = new Date();
                    const pad = (n: number) => String(n).padStart(2, '0');
                    return `${now.getFullYear()}-${pad(now.getMonth() + 1)}-${pad(now.getDate())}T${pad(now.getHours())}:${pad(now.getMinutes())}`;
                  })(),
                })
              }>
              <Plus size={16} className="mr-2" />
              Modbreak toevoegen
            </Button>
          </div>

          <Separator className="lg:col-span-2 my-6" />

          <div className="mt-auto col-span-full lg:col-span-1">
            <SimpleCalendar
              form={form}
              fieldName="publishDate"
              label="Publiceer datum van de resource"
              description="Als er geen publiceer datum is zal de resource worden opgeslagen als concept. Dit houdt in dat de resource niet zichtbaar zal zijn op de site."
              withReset
            />
          </div>
          <div className="col-span-full lg:col-span-1">
            <SimpleCalendar
              form={form}
              fieldName="startDate"
              label="Startdatum resource"
            />
          </div>

          <div className="col-span-full lg:col-span-1">
            <CheckboxList
              form={form}
              fieldName="tags"
              fieldLabel="Selecteer de gewenste tags die bij een resource weergegeven zullen
               worden."
              label={(t) => t.name}
              keyForGrouping="type"
              keyPerItem={(t) => `${t.id}`}
              items={loadedTags}
              layout="vertical"
              selectedPredicate={(t) =>
                form.getValues('tags')?.findIndex((tg) => tg === t.id) > -1
              }
              onValueChange={(tag, checked) => {
                const values = form.getValues('tags');
                form.setValue(
                  'tags',
                  checked
                    ? [...values, tag.id]
                    : values.filter((id) => id !== tag.id)
                );
              }}
            />

            <CheckboxList
              form={form}
              fieldName="statuses"
              fieldLabel="Status"
              layout="vertical"
              label={(t) => t.name}
              keyPerItem={(t) => `${t.id}`}
              items={loadedStatuses}
              selectedPredicate={(t) =>
                form.getValues('statuses')?.findIndex((tg) => tg === t.id) > -1
              }
              onValueChange={(status, checked) => {
                const values = form.getValues('statuses');
                form.setValue(
                  'statuses',
                  checked
                    ? [...values, status.id]
                    : values.filter((id) => id !== status.id)
                );
              }}
            />
          </div>

          <div className="col-span-full lg:col-span-1">
            <FormField
              control={form.control}
              name="extraData"
              render={({ field }) => (
                <FormItem>
                  <Textarea
                    className="hidden"
                    hidden={true}
                    name={'extraData'}
                    value={extraData} // Bind the state to the Textarea value
                    readOnly // Make the Textarea read-only since it's updated programmatically
                  />
                  <FormLabel>Extra data</FormLabel>
                  <FormControl>
                    <CodeEditor
                      initValue={existingData?.extraData}
                      onValueChange={(value) => {
                        try {
                          const parsedValue = JSON.parse(value); // Parse the JSON to make sure it's valid
                          form.setValue('extraData', parsedValue); // Set the value of the field
                          setExtraData(JSON.stringify(parsedValue));
                        } catch (error) {}
                      }}
                    />
                  </FormControl>
                </FormItem>
              )}
            />
          </div>
          <Button className="w-fit col-span-full" type="submit">
            Opslaan
          </Button>
        </form>
      </Form>
    </div>
  );
}
