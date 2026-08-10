import ImageGalleryStyle from '@/components/image-gallery-style';
import MapInput from '@/components/maps/leaflet-input';
import { SimpleCalendar } from '@/components/simple-calender-popup';
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
import { Separator } from '@/components/ui/separator';
import { Textarea } from '@/components/ui/textarea';
import { Heading } from '@/components/ui/typography';
import { useProject } from '@/hooks/use-project';
import useResource from '@/hooks/use-resource';
import useTags from '@/hooks/use-tags';
import { zodResolver } from '@hookform/resolvers/zod';
import * as Switch from '@radix-ui/react-switch';
import {
  ArrowDown,
  ArrowLeft,
  ArrowRight,
  ArrowUp,
  Link2,
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
  startDate: z.date(),
  publishDate: z.date().optional(),
  modBreak: z.coerce.string().optional(),
  modBreakUserId: z.coerce
    .number({ invalid_type_error: onlyNumbersMessage })
    .optional(),
  modBreakDate: z.date().optional(),
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
      reactionDeadline: z.string().optional(),
      hideTijdlijn: z.boolean().optional(),
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
      .refine(
        (val) =>
          (val || '').replace(/<[^>]*>/g, '').length >= summaryLimits.min,
        minError('Samenvatting', summaryLimits.min)
      )
      .refine(
        (val) =>
          (val || '').replace(/<[^>]*>/g, '').length <= summaryLimits.max,
        maxError('Samenvatting', summaryLimits.max)
      )
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
type TijdlijnLink = {
  trigger: string;
  title: string;
  url: string;
  openInNewWindow: boolean;
};
type TijdlijnItem = {
  trigger: string;
  date?: string;
  title: string;
  description: string;
  active: boolean;
  highlighted?: boolean;
  links?: TijdlijnLink[];
};
type Props = { onFormSubmit: (body: any) => Promise<any> };

export default function ProjectResourceForm({ onFormSubmit }: Props) {
  const router = useRouter();
  const { project, id } = router.query;
  const { data: projectData } = useProject();
  const { data: existingData, mutate } = useResource(
    project as string,
    id as string
  );

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

  const { data: tags } = useTags(project as string);
  const allTags = (tags || []) as {
    id: number;
    name: string;
    type?: string;
    description?: string;
    extraData?: any;
  }[];
  const faseTags = allTags.filter((t) => t.type === 'fase');
  const initiatiefnemerTags = allTags.filter(
    (t) => t.type === 'initiatiefnemer'
  );
  const stadsdeelTags = allTags.filter((t) => t.type === 'stadsdeel');
  const wijkTags = allTags.filter((t) => t.type === 'wijk');
  const otherTags = allTags.filter(
    (t) =>
      !['fase', 'initiatiefnemer', 'stadsdeel', 'wijk'].includes(t.type || '')
  );

  const budgetFallback = (d: any, key = '') => {
    if (!d) return 0;
    if (typeof d?.budget === 'number') return d.budget;
    return d[key] || 0;
  };

  const [tijdlijnItems, setTijdlijnItems] = useState<TijdlijnItem[]>([]);
  const [selectedTijdlijnItem, setSelectedTijdlijnItem] =
    useState<TijdlijnItem | null>(null);
  const [tijdlijnTitle, setTijdlijnTitle] = useState('');
  const [tijdlijnDate, setTijdlijnDate] = useState<string>('');
  const [tijdlijnDescription, setTijdlijnDescription] = useState('');
  const [tijdlijnActive, setTijdlijnActive] = useState(true);
  const [tijdlijnHighlighted, setTijdlijnHighlighted] = useState(false);
  const [tijdlijnLinks, setTijdlijnLinks] = useState<TijdlijnLink[]>([]);
  const [linkTitle, setLinkTitle] = useState('');
  const [linkUrl, setLinkUrl] = useState('');
  const [linkNewWindow, setLinkNewWindow] = useState(false);
  const [editingLinkIndex, setEditingLinkIndex] = useState<number | null>(null);
  const [showLinkForm, setShowLinkForm] = useState(false);

  const defaults = useCallback(
    (): FormType => ({
      userId: existingData?.userId || undefined,
      title: existingData?.title || '',
      summary: existingData?.summary || '',
      description: existingData?.description || '',
      budget: budgetFallback(existingData),
      tags:
        existingData?.tags?.map((t: any) => t.id) ||
        projectData?.config?.resources?.defaultTagIds ||
        [],
      statuses: existingData?.statuses?.map((t: any) => t.id) || [],
      startDate: existingData?.startDate
        ? new Date(existingData?.startDate)
        : new Date(),
      publishDate: existingData?.publishDate
        ? new Date(existingData.publishDate)
        : new Date(),
      modBreak: existingData?.modBreak || '',
      modBreakUserId: existingData?.modBreakUserId || undefined,
      modBreakDate: existingData?.modBreakDate
        ? new Date(existingData.modBreakDate)
        : undefined,
      location: existingData?.location
        ? JSON.stringify(existingData?.location)
        : '',
      image: '',
      images: existingData?.images || [],
      document: '',
      documents: existingData?.documents || [],
      extraData: {
        originalId: existingData?.extraData?.originalId || undefined,
        reactionDeadline: existingData?.extraData?.reactionDeadline || '',
        hideTijdlijn: existingData?.extraData?.hideTijdlijn || false,
      },
    }),
    [existingData]
  );

  const [extraData, setExtraData] = useState(existingData?.extraData || '');
  const [partnerId, setPartnerId] = useState<string>(
    existingData?.extraData?.partnerId || ''
  );
  const [partnerName, setPartnerName] = useState<string>('');
  const [imageIndexOpen, setImageIndexOpen] = useState<number>(-1);

  const form = useForm<FormType>({
    resolver: zodResolver<any>(
      formSchema(titleLimits, summaryLimits, descriptionLimits)
    ),
    defaultValues: defaults(),
  });

  const watchedTags = form.watch('tags');

  function handleStadsdeelToggle(
    stadsdeelTag: { id: number; name: string },
    checked: boolean
  ) {
    const currentTags = form.getValues('tags');
    let newTags = checked
      ? [...currentTags, stadsdeelTag.id]
      : currentTags.filter((id) => id !== stadsdeelTag.id);

    const childWijkIds = wijkTags
      .filter((w) => w.extraData?.parentTagId === stadsdeelTag.id)
      .map((w) => w.id);
    if (checked) {
      childWijkIds.forEach((wId) => {
        if (!newTags.includes(wId)) newTags.push(wId);
      });
    } else {
      newTags = newTags.filter((id) => !childWijkIds.includes(id));
    }
    form.setValue('tags', newTags);
  }

  function onSubmit(values: FormType) {
    const extraDataObj =
      typeof values.extraData === 'object' ? { ...values.extraData } : {};
    extraDataObj.tijdlijn = tijdlijnItems;
    extraDataObj.partnerId = partnerId;
    extraDataObj.hideTijdlijn = extraDataObj.hideTijdlijn || false;
    try {
      if (extraData !== values.extraData) {
        const parsed = JSON.parse(
          typeof extraData === 'string' ? extraData : JSON.stringify(extraData)
        );
        const savedHideTijdlijn = extraDataObj.hideTijdlijn;
        const savedDeadline = extraDataObj.reactionDeadline;
        Object.assign(extraDataObj, parsed);
        extraDataObj.hideTijdlijn = savedHideTijdlijn;
        extraDataObj.reactionDeadline = savedDeadline;
        extraDataObj.partnerId = partnerId;
        extraDataObj.tijdlijn = tijdlijnItems;
        extraDataObj.partnerId = partnerId;
        extraDataObj.hideTijdlijn = extraDataObj.hideTijdlijn || false;
      }
    } catch (e) {}
    values.extraData = extraDataObj;
    console.log('SUBMIT values:', {
      summary: values.summary,
      title: values.title,
    });
    onFormSubmit(values)
      .then(() => {
        toast.success(`Project successvol ${id ? 'aangepast' : 'aangemaakt'}`);
        router.push(`/projects/${project}/resources`);
        mutate(`/api/openstad/api/project/${project}/resource/${id}`);
      })
      .catch(() => {
        toast.error(
          `Project kon niet ${id ? 'aangepast' : 'aangemaakt'} worden`
        );
      });
  }

  useEffect(() => {
    if (existingData) {
      form.reset(defaults());
      if (existingData?.extraData?.tijdlijn)
        setTijdlijnItems(existingData.extraData.tijdlijn);
    }
  }, [existingData, form, defaults]);

  useEffect(() => {
    if (!partnerId) {
      setPartnerName('');
      return;
    }
    fetch(`/api/openstad/api/project/${project}/user/${partnerId}`)
      .then((r) => r.json())
      .then((u) => setPartnerName(u.displayName || u.name || 'Onbekend'))
      .catch(() => setPartnerName('Niet gevonden'));
  }, [partnerId, project]);

  const {
    fields: imageFields,
    remove: removeImage,
    swap: swapImage,
  } = useFieldArray({ control: form.control, name: 'images' });
  const { fields: documentFields, remove: removeFile } = useFieldArray({
    control: form.control,
    name: 'documents',
  });
  const moveUpImage = (i: number) => {
    if (i > 0) swapImage(i, i - 1);
  };
  const moveDownImage = (i: number) => {
    if (i < imageFields.length - 1) swapImage(i, i + 1);
  };
  const handleLocationSelect = useCallback(
    (location: string) => {
      if (location !== '') {
        let f = location.split(',');
        form.setValue(
          'location',
          JSON.stringify({ lat: parseFloat(f[0]), lng: parseFloat(f[1]) })
        );
      }
    },
    [form]
  );

  function addOrUpdateTijdlijnItem() {
    if (!tijdlijnTitle.trim()) return;
    const itemData = {
      date: tijdlijnDate,
      title: tijdlijnTitle,
      description: tijdlijnDescription,
      active: tijdlijnActive,
      highlighted: tijdlijnHighlighted,
      links: tijdlijnLinks,
    };
    if (selectedTijdlijnItem) {
      setTijdlijnItems((items) =>
        items.map((item) =>
          item.trigger === selectedTijdlijnItem.trigger
            ? { ...item, ...itemData }
            : item
        )
      );
    } else {
      setTijdlijnItems((items) => [
        ...items,
        {
          trigger: `${items.length > 0 ? parseInt(items[items.length - 1].trigger) + 1 : 0}`,
          ...itemData,
        },
      ]);
    }
    resetTijdlijnForm();
  }
  function resetTijdlijnForm() {
    setTijdlijnTitle('');
    setTijdlijnDate('');
    setTijdlijnDescription('');
    setTijdlijnActive(true);
    setTijdlijnHighlighted(false);
    setTijdlijnLinks([]);
    setSelectedTijdlijnItem(null);
    resetLinkForm();
    setShowLinkForm(false);
  }
  function selectTijdlijnItem(item: TijdlijnItem) {
    setSelectedTijdlijnItem(item);
    setTijdlijnTitle(item.title);
    setTijdlijnDescription(item.description);
    setTijdlijnActive(item.active);
    setTijdlijnDate(item.date || '');
    setTijdlijnHighlighted(item.highlighted || false);
    setTijdlijnLinks(item.links || []);
    resetLinkForm();
    setShowLinkForm(false);
  }
  function deleteTijdlijnItem(trigger: string) {
    setTijdlijnItems((items) => items.filter((i) => i.trigger !== trigger));
    if (selectedTijdlijnItem?.trigger === trigger) resetTijdlijnForm();
  }
  function moveTijdlijnItem(trigger: string, dir: 'up' | 'down') {
    setTijdlijnItems((items) => {
      const idx = items.findIndex((i) => i.trigger === trigger);
      if (
        (dir === 'up' && idx <= 0) ||
        (dir === 'down' && idx >= items.length - 1)
      )
        return items;
      const n = [...items];
      const s = dir === 'up' ? idx - 1 : idx + 1;
      const t = n[s].trigger;
      n[s].trigger = n[idx].trigger;
      n[idx].trigger = t;
      return n;
    });
  }
  function addOrUpdateLink() {
    if (!linkTitle.trim() || !linkUrl.trim()) return;
    const linkData = {
      title: linkTitle,
      url: linkUrl,
      openInNewWindow: linkNewWindow,
    };
    if (editingLinkIndex !== null) {
      setTijdlijnLinks((links) =>
        links.map((l, i) =>
          i === editingLinkIndex ? { ...l, ...linkData } : l
        )
      );
    } else {
      setTijdlijnLinks((links) => [
        ...links,
        { trigger: `${links.length}`, ...linkData },
      ]);
    }
    resetLinkForm();
  }
  function resetLinkForm() {
    setLinkTitle('');
    setLinkUrl('');
    setLinkNewWindow(false);
    setEditingLinkIndex(null);
  }
  function editLink(index: number) {
    const l = tijdlijnLinks[index];
    setLinkTitle(l.title);
    setLinkUrl(l.url);
    setLinkNewWindow(l.openInNewWindow);
    setEditingLinkIndex(index);
    setShowLinkForm(true);
  }
  function deleteLink(index: number) {
    setTijdlijnLinks((links) => links.filter((_, i) => i !== index));
    if (editingLinkIndex === index) resetLinkForm();
  }

  return (
    <div className="p-6 bg-white rounded-md">
      <ImageGalleryStyle />
      <Form {...form}>
        <Heading size="xl">
          {id ? 'Project aanpassen' : 'Project toevoegen'}
        </Heading>
        <Separator className="my-4" />
        <form
          onSubmit={form.handleSubmit(onSubmit, (errors) =>
            console.log('FORM ERRORS:', errors)
          )}
          className="lg:w-3/3 grid grid-cols-2 lg:auto-rows-fit gap-10">
          {/* ═══ 1. TITEL & SAMENVATTING ═══ */}
          <FormField
            control={form.control}
            name="title"
            render={({ field }) => (
              <FormItem className="col-span-full">
                <FormLabel>Titel</FormLabel>
                <FormControl>
                  <Input {...field} />
                </FormControl>
                <FormMessage />
              </FormItem>
            )}
          />
          <FormField
            control={form.control}
            name="summary"
            render={({ field }) => (
              <FormItem className="col-span-full md:col-span-full lg:col-span-full">
                <FormLabel>Samenvatting</FormLabel>
                <FormControl>
                  <textarea
                    className="w-full min-h-[100px] p-3 border border-gray-300 rounded-md text-sm"
                    placeholder="Korte samenvatting van het project..."
                    value={field.value || ''}
                    onChange={(e) => field.onChange(e.target.value)}
                  />
                </FormControl>
                <FormMessage />
              </FormItem>
            )}
          />
          {/* ═══ 2. AFBEELDINGEN ═══ */}
          <ImageUploader
            form={form}
            fieldName="image"
            onImageUploaded={(r: string) => {
              let a = [...(form.getValues('images') || [])];
              a.push(r);
              form.setValue('images', a);
              form.resetField('image');
              form.trigger('images');
            }}
          />

          <div className="space-y-2 col-span-full md:col-span-1 flex flex-col">
            {imageFields.length > 0 && (
              <div className="grid">
                <label className="text-sm font-medium mb-1">Afbeeldingen</label>
                <p className="text-sm text-muted-foreground mb-2">
                  Klik op een afbeelding om het beschrijvingsveld te openen.
                </p>
                <section className="grid col-span-full grid-cols-3 gap-y-8 gap-x-8 mb-4">
                  {imageFields.map(({ id, url }, index) => (
                    <div
                      key={id}
                      className={`relative grid ${index === imageIndexOpen ? 'col-span-full' : 'tile'} gap-x-4 items-center image-gallery`}
                      style={{
                        gridTemplateColumns:
                          index === imageIndexOpen ? '1fr 2fr 40px' : '1fr',
                      }}>
                      <div className="image-container">
                        <img
                          src={url}
                          alt={url}
                          onClick={() =>
                            setImageIndexOpen(
                              index === imageIndexOpen ? -1 : index
                            )
                          }
                        />
                      </div>
                      <Button
                        color="red"
                        onClick={() => removeImage(index)}
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
                            <FormItem className="col-span-full md:col-span-full lg:col-span-full">
                              <FormLabel>Beschrijving</FormLabel>
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
                            onClick={() => moveUpImage(index)}>
                            <ArrowLeft className="cursor-pointer" />
                          </button>
                          <button
                            type="button"
                            onClick={() => moveDownImage(index)}>
                            <ArrowRight className="cursor-pointer" />
                          </button>
                        </span>
                      )}
                    </div>
                  ))}
                </section>
              </div>
            )}
          </div>

          {/* ═══ 3. PROJECT DETAILS (Fase, Initiatiefnemer, Deadline, Wijk) ═══ */}
          <Separator className="lg:col-span-2 my-2" />
          <div className="col-span-full">
            <Heading size="lg" className="mb-4">
              Project details
            </Heading>
            <div className="grid grid-cols-1 lg:grid-cols-2 gap-6">
              {/* Fase */}
              <div className="border rounded-lg p-4 bg-gray-50">
                <h4 className="font-semibold mb-3 text-sm">Fase</h4>
                <div className="flex flex-col gap-2">
                  {faseTags.map((tag) => {
                    const selected = watchedTags?.includes(tag.id);
                    return (
                      <label
                        key={tag.id}
                        className={`flex items-center gap-2 p-2 border rounded cursor-pointer transition-colors ${selected ? 'bg-blue-100 border-blue-400' : 'bg-white border-gray-200 hover:bg-gray-50'}`}>
                        <input
                          type="radio"
                          name="fase"
                          checked={selected}
                          onChange={() => {
                            const v = form
                              .getValues('tags')
                              .filter(
                                (id) => !faseTags.map((f) => f.id).includes(id)
                              );
                            form.setValue('tags', [...v, tag.id]);
                          }}
                        />
                        <span className="text-sm">{tag.name}</span>
                      </label>
                    );
                  })}
                </div>
                {(() => {
                  const selectedFase = faseTags.find((t) =>
                    watchedTags?.includes(t.id)
                  );
                  const dl = form.getValues('extraData.reactionDeadline');
                  if (
                    selectedFase?.name === 'Reageren mogelijk' &&
                    dl &&
                    new Date(dl) < new Date()
                  ) {
                    return (
                      <p className="text-sm text-orange-600 mt-2 p-2 bg-orange-50 border border-orange-200 rounded">
                        ⚠ De reactiedeadline is verstreken. Op de website wordt
                        automatisch &quot;Reageren gesloten&quot; getoond.
                      </p>
                    );
                  }
                  return null;
                })()}
              </div>

              {/* Initiatiefnemer */}
              <div className="border rounded-lg p-4 bg-gray-50">
                <h4 className="font-semibold mb-3 text-sm">Initiatiefnemer</h4>
                <div className="flex flex-col gap-2">
                  {initiatiefnemerTags.map((tag) => {
                    const selected = watchedTags?.includes(tag.id);
                    return (
                      <label
                        key={tag.id}
                        className={`flex items-center gap-2 p-2 border rounded cursor-pointer transition-colors ${selected ? 'bg-blue-100 border-blue-400' : 'bg-white border-gray-200 hover:bg-gray-50'}`}>
                        <input
                          type="radio"
                          name="initiatiefnemer"
                          checked={selected}
                          onChange={() => {
                            const v = form
                              .getValues('tags')
                              .filter(
                                (id) =>
                                  !initiatiefnemerTags
                                    .map((f) => f.id)
                                    .includes(id)
                              );
                            form.setValue('tags', [...v, tag.id]);
                          }}
                        />
                        <span className="text-sm">{tag.name}</span>
                      </label>
                    );
                  })}
                  {(() => {
                    const partnersTag = initiatiefnemerTags.find(
                      (t) => t.name === 'Partners'
                    );
                    const isPartners =
                      partnersTag && watchedTags?.includes(partnersTag.id);
                    if (!isPartners) return null;
                    return (
                      <div className="mt-3 border-t pt-3">
                        <label className="text-sm font-medium">
                          Gebruiker ID van de partner
                        </label>
                        <div className="flex gap-2 mt-1">
                          <Input
                            type="number"
                            placeholder="Bijv. 42"
                            value={partnerId}
                            onChange={(e) => setPartnerId(e.target.value)}
                            className="w-32"
                          />
                          {partnerName && (
                            <span
                              className={`text-sm self-center ${partnerName === 'Niet gevonden' ? 'text-red-500' : 'text-green-700 font-medium'}`}>
                              {partnerName}
                            </span>
                          )}
                        </div>
                      </div>
                    );
                  })()}
                </div>
              </div>

              {/* Reaction Deadline */}
              <div className="border rounded-lg p-4 bg-gray-50">
                <h4 className="font-semibold mb-3 text-sm">Reactie deadline</h4>
                <FormField
                  control={form.control}
                  name="extraData.reactionDeadline"
                  render={({ field }) => (
                    <FormItem>
                      <FormDescription>
                        Tot wanneer kunnen bewoners reageren?
                      </FormDescription>
                      <FormControl>
                        <Input type="date" {...field} />
                      </FormControl>
                      <FormMessage />
                    </FormItem>
                  )}
                />
              </div>

              {/* Stadsdeel & Wijk */}
              <div className="border rounded-lg p-4 bg-gray-50">
                <h4 className="font-semibold mb-3 text-sm">
                  Stadsdeel &amp; Wijk
                </h4>
                <div className="flex flex-col gap-1 max-h-80 overflow-y-auto">
                  {stadsdeelTags.map((sd) => {
                    const sdSelected = watchedTags?.includes(sd.id);

                    const childWijks = wijkTags.filter(
                      (w) => w.extraData?.parentTagId === sd.id
                    );
                    return (
                      <div key={sd.id} className="mb-2">
                        <label
                          className={`flex items-center gap-2 p-2 border rounded cursor-pointer font-semibold transition-colors ${sdSelected ? 'bg-blue-100 border-blue-400' : 'bg-white border-gray-200 hover:bg-gray-50'}`}>
                          <input
                            type="checkbox"
                            checked={sdSelected}
                            onChange={(e) =>
                              handleStadsdeelToggle(sd, e.target.checked)
                            }
                          />
                          <span className="text-sm font-semibold">
                            {sd.name}
                          </span>
                        </label>
                        <div className="ml-6 mt-1 flex flex-col gap-1">
                          {childWijks.map((wijk) => {
                            const wSelected = watchedTags?.includes(wijk.id);
                            return (
                              <label
                                key={wijk.id}
                                className={`flex items-center gap-2 px-2 py-1 border rounded cursor-pointer transition-colors text-xs ${wSelected ? 'bg-blue-50 border-blue-300' : 'bg-white border-gray-100 hover:bg-gray-50'}`}>
                                <input
                                  type="checkbox"
                                  checked={wSelected}
                                  onChange={(e) => {
                                    let v = form.getValues('tags');
                                    if (e.target.checked) {
                                      v = [...v, wijk.id];
                                      if (!v.includes(sd.id)) v = [...v, sd.id];
                                    } else {
                                      v = v.filter((id) => id !== wijk.id);
                                    }
                                    form.setValue('tags', v);
                                  }}
                                />
                                <span>{wijk.name}</span>
                              </label>
                            );
                          })}
                        </div>
                      </div>
                    );
                  })}
                </div>
              </div>
            </div>
          </div>

          {/* ═══ 4. BESCHRIJVING (intro) ═══ */}
          <Separator className="lg:col-span-2 my-2" />
          <FormField
            control={form.control}
            name="description"
            render={({ field }) => (
              <FormItem className="col-span-full md:col-span-full lg:col-span-full">
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

          {/* ═══ 5. TIJDLIJN ═══ */}
          <Separator className="lg:col-span-2 my-2" />
          <div className="col-span-full">
            <Heading size="lg" className="mb-4">
              Tijdlijn
            </Heading>
            <div className="flex items-center gap-3 mb-4">
              <FormField
                control={form.control}
                name="extraData.hideTijdlijn"
                render={({ field }) => (
                  <FormItem>
                    <div className="flex items-center gap-3">
                      <FormLabel className="text-sm">
                        Tijdlijn verbergen op de projectpagina
                      </FormLabel>
                      <Switch.Root
                        className="w-[42px] h-[22px] bg-stone-300 rounded-full relative data-[state=checked]:bg-blue-600 outline-none cursor-default"
                        onCheckedChange={(checked: boolean) =>
                          field.onChange(checked)
                        }
                        checked={!!field.value}>
                        <Switch.Thumb className="block w-[18px] h-[18px] bg-white rounded-full transition-transform duration-100 translate-x-0.5 will-change-transform data-[state=checked]:translate-x-[22px]" />
                      </Switch.Root>
                    </div>
                  </FormItem>
                )}
              />
            </div>
            <div className="grid grid-cols-1 lg:grid-cols-3 gap-6">
              <div className="border rounded-lg p-4 bg-gray-50">
                <h4 className="font-semibold mb-3 text-sm">Huidige items</h4>
                <div className="flex flex-col gap-1">
                  {tijdlijnItems.length > 0 ? (
                    tijdlijnItems
                      .sort((a, b) => parseInt(a.trigger) - parseInt(b.trigger))
                      .map((item) => (
                        <div
                          key={item.trigger}
                          className={`flex items-center justify-between border rounded px-2 py-2 text-sm cursor-pointer transition-colors ${item.trigger === selectedTijdlijnItem?.trigger ? 'bg-blue-100 border-blue-400' : 'bg-white border-gray-200 hover:bg-gray-100'}`}>
                          <span className="flex gap-1 shrink-0">
                            <ArrowUp
                              size={14}
                              className="cursor-pointer text-gray-500 hover:text-black"
                              onClick={() =>
                                moveTijdlijnItem(item.trigger, 'up')
                              }
                            />
                            <ArrowDown
                              size={14}
                              className="cursor-pointer text-gray-500 hover:text-black"
                              onClick={() =>
                                moveTijdlijnItem(item.trigger, 'down')
                              }
                            />
                          </span>
                          <span
                            className="flex-1 px-2 truncate"
                            onClick={() => selectTijdlijnItem(item)}>
                            {item.title || '(geen titel)'}
                            {item.links && item.links.length > 0 && (
                              <Link2
                                size={12}
                                className="inline ml-1 text-blue-500"
                              />
                            )}
                          </span>
                          <X
                            size={14}
                            className="cursor-pointer text-gray-400 hover:text-red-600 shrink-0"
                            onClick={() => deleteTijdlijnItem(item.trigger)}
                          />
                        </div>
                      ))
                  ) : (
                    <p className="text-sm text-gray-400 italic">
                      Nog geen items
                    </p>
                  )}
                </div>
              </div>
              <div className="border rounded-lg p-4 col-span-2 bg-gray-50">
                <h4 className="font-semibold mb-3 text-sm">
                  {selectedTijdlijnItem ? 'Item bewerken' : 'Nieuw item'}
                </h4>
                <div className="flex flex-col gap-3">
                  <div>
                    <label className="text-sm font-medium">Datum</label>
                    <Input
                      type="date"
                      value={tijdlijnDate}
                      onChange={(e) => setTijdlijnDate(e.target.value)}
                    />
                  </div>
                  <div>
                    <label className="text-sm font-medium">Titel</label>
                    <Input
                      value={tijdlijnTitle}
                      onChange={(e) => setTijdlijnTitle(e.target.value)}
                      placeholder="Bijv. Informatiebijeenkomst"
                    />
                  </div>
                  <div>
                    <label className="text-sm font-medium">Beschrijving</label>
                    <Input
                      value={tijdlijnDescription}
                      onChange={(e) => setTijdlijnDescription(e.target.value)}
                      placeholder="Bijv. Lees het verslag"
                    />
                  </div>
                  <div className="flex gap-6">
                    <div className="flex items-center gap-2">
                      <label className="text-sm font-medium">Actief</label>
                      <span className="text-xs text-gray-400">
                        (items met een datum in het verleden worden automatisch
                        actief op de website)
                      </span>
                      <Switch.Root
                        className="w-[42px] h-[22px] bg-stone-300 rounded-full relative data-[state=checked]:bg-blue-600 outline-none cursor-default"
                        onCheckedChange={setTijdlijnActive}
                        checked={tijdlijnActive}>
                        <Switch.Thumb className="block w-[18px] h-[18px] bg-white rounded-full transition-transform duration-100 translate-x-0.5 will-change-transform data-[state=checked]:translate-x-[22px]" />
                      </Switch.Root>
                    </div>
                    <div className="flex items-center gap-2">
                      <label className="text-sm font-medium">Uitlichten</label>
                      <Switch.Root
                        className="w-[42px] h-[22px] bg-stone-300 rounded-full relative data-[state=checked]:bg-blue-600 outline-none cursor-default"
                        onCheckedChange={setTijdlijnHighlighted}
                        checked={tijdlijnHighlighted}>
                        <Switch.Thumb className="block w-[18px] h-[18px] bg-white rounded-full transition-transform duration-100 translate-x-0.5 will-change-transform data-[state=checked]:translate-x-[22px]" />
                      </Switch.Root>
                    </div>
                  </div>
                  <div className="border rounded-md p-3 mt-1 bg-white">
                    <div className="flex items-center justify-between mb-2">
                      <h5 className="text-sm font-medium flex items-center gap-1">
                        <Link2 size={14} /> Links ({tijdlijnLinks.length})
                      </h5>
                      <Button
                        type="button"
                        variant="outline"
                        size="sm"
                        className="h-7 text-xs"
                        onClick={() => {
                          setShowLinkForm(!showLinkForm);
                          resetLinkForm();
                        }}>
                        {showLinkForm ? (
                          'Verberg'
                        ) : (
                          <>
                            <Plus size={12} /> Link toevoegen
                          </>
                        )}
                      </Button>
                    </div>
                    {tijdlijnLinks.length > 0 && (
                      <div className="flex flex-col gap-1 mb-2">
                        {tijdlijnLinks.map((link, idx) => (
                          <div
                            key={idx}
                            className={`flex items-center justify-between border rounded px-2 py-1.5 text-xs ${editingLinkIndex === idx ? 'bg-blue-50 border-blue-300' : 'bg-gray-50 border-gray-200'}`}>
                            <span
                              className="flex-1 truncate cursor-pointer"
                              onClick={() => editLink(idx)}>
                              {link.title}{' '}
                              <span className="text-gray-400">
                                — {link.url}
                              </span>
                            </span>
                            <X
                              size={12}
                              className="cursor-pointer text-gray-400 hover:text-red-600 shrink-0 ml-2"
                              onClick={() => deleteLink(idx)}
                            />
                          </div>
                        ))}
                      </div>
                    )}
                    {showLinkForm && (
                      <div className="flex flex-col gap-2 pt-2 border-t">
                        <div className="grid grid-cols-2 gap-2">
                          <div>
                            <label className="text-xs font-medium">
                              Link titel
                            </label>
                            <Input
                              className="h-8 text-sm"
                              value={linkTitle}
                              onChange={(e) => setLinkTitle(e.target.value)}
                              placeholder="Bijv. Lees het verslag"
                            />
                          </div>
                          <div>
                            <label className="text-xs font-medium">URL</label>
                            <Input
                              className="h-8 text-sm"
                              value={linkUrl}
                              onChange={(e) => setLinkUrl(e.target.value)}
                              placeholder="https://..."
                            />
                          </div>
                        </div>
                        <div className="flex items-center justify-between">
                          <div className="flex items-center gap-2">
                            <label className="text-xs font-medium">
                              Nieuw venster
                            </label>
                            <Switch.Root
                              className="w-[36px] h-[18px] bg-stone-300 rounded-full relative data-[state=checked]:bg-blue-600 outline-none cursor-default"
                              onCheckedChange={setLinkNewWindow}
                              checked={linkNewWindow}>
                              <Switch.Thumb className="block w-[14px] h-[14px] bg-white rounded-full transition-transform duration-100 translate-x-0.5 will-change-transform data-[state=checked]:translate-x-[19px]" />
                            </Switch.Root>
                          </div>
                          <div className="flex gap-2">
                            {editingLinkIndex !== null && (
                              <Button
                                type="button"
                                variant="outline"
                                size="sm"
                                className="h-7 text-xs"
                                onClick={resetLinkForm}>
                                Annuleer
                              </Button>
                            )}
                            <Button
                              type="button"
                              size="sm"
                              className="h-7 text-xs"
                              onClick={addOrUpdateLink}>
                              {editingLinkIndex !== null
                                ? 'Opslaan'
                                : 'Toevoegen'}
                            </Button>
                          </div>
                        </div>
                      </div>
                    )}
                  </div>
                  <div className="flex gap-2 mt-2">
                    {selectedTijdlijnItem && (
                      <Button
                        type="button"
                        variant="outline"
                        onClick={resetTijdlijnForm}>
                        Annuleer
                      </Button>
                    )}
                    <Button type="button" onClick={addOrUpdateTijdlijnItem}>
                      {selectedTijdlijnItem
                        ? 'Wijzigingen opslaan'
                        : 'Item toevoegen'}
                    </Button>
                  </div>
                </div>
              </div>
            </div>
          </div>

          {/* ═══ 6. LOCATIE ═══ */}
          <Separator className="lg:col-span-2 my-2" />
          <FormField
            control={form.control}
            name="location"
            render={({ field }) => (
              <MapInput onSelectLocation={handleLocationSelect} field={field} />
            )}
          />

          {/* ═══ 7. MODBREAK ═══ */}
          <Separator className="lg:col-span-2 my-2" />
          <FormField
            control={form.control}
            name="modBreak"
            render={({ field }) => (
              <FormItem className="col-span-full md:col-span-full lg:col-span-full">
                <FormLabel>Feedback van de gemeente (Modbreak)</FormLabel>
                <FormDescription>
                  Laat dit veld leeg om geen feedback te tonen
                </FormDescription>
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
          <FormField
            control={form.control}
            name="modBreakUserId"
            render={({ field }) => (
              <FormItem className="col-span-1">
                <FormLabel>Modbreak gebruiker ID (optioneel)</FormLabel>
                <FormControl>
                  <Input {...field} />
                </FormControl>
                <FormMessage />
              </FormItem>
            )}
          />
          <div className="mt-auto col-span-full lg:col-span-1">
            <SimpleCalendar
              form={form}
              fieldName="modBreakDate"
              label="Modbreak datum (optioneel)"
              placeholder="Kies een datum"
              withReset
            />
          </div>

          {/* ═══ 8. DOCUMENTEN ═══ */}
          <Separator className="lg:col-span-2 my-2" />
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
            onDocumentUploaded={(r) => {
              let a = [...(form.getValues('documents') || [])];
              a.push(r);
              form.setValue('documents', a);
              form.resetField('document');
              form.trigger('documents');
            }}
          />
          <div className="space-y-2 col-span-full md:col-span-1 flex flex-col">
            {documentFields.length > 0 && (
              <>
                <label className="text-sm font-medium">Documenten</label>
                <section className="grid col-span-full grid-cols-1 gap-x-4 gap-y-8">
                  {documentFields.map(({ id, url, name }, index) => (
                    <div key={id} className="relative flex flex-wrap">
                      <div className="relative flex">
                        <Button
                          color="red"
                          onClick={() => removeFile(index)}
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
                        defaultValue={name}
                        onBlur={(e) => {
                          let a = [...(form.getValues('documents') || [])];
                          if (
                            e.target.value &&
                            a[index] &&
                            e.target.value !== a[index].name
                          ) {
                            a[index].name = e.target.value;
                            form.setValue('documents', a);
                            form.trigger('documents');
                          }
                        }}
                      />
                    </div>
                  ))}
                </section>
              </>
            )}
          </div>

          {/* ═══ 9. DATUMS ═══ */}
          <Separator className="lg:col-span-2 my-2" />
          <div className="mt-auto col-span-full lg:col-span-1">
            <SimpleCalendar
              form={form}
              fieldName="publishDate"
              label="Publiceer datum"
              description="Zonder datum wordt het project opgeslagen als concept."
              withReset
            />
          </div>
          <div className="col-span-full lg:col-span-1">
            <SimpleCalendar
              form={form}
              fieldName="startDate"
              label="Startdatum project"
            />
          </div>

          {/* ═══ 10. OVERIGE TAGS ═══ */}
          {otherTags.length > 0 && (
            <>
              <Separator className="lg:col-span-2 my-2" />
              <div className="col-span-full lg:col-span-1">
                <CheckboxList
                  form={form}
                  fieldName="tags"
                  fieldLabel="Overige tags"
                  label={(t) => t.name}
                  keyForGrouping="type"
                  keyPerItem={(t) => `${t.id}`}
                  items={otherTags}
                  layout="vertical"
                  selectedPredicate={(t) =>
                    form.getValues('tags')?.findIndex((tg) => tg === t.id) > -1
                  }
                  onValueChange={(tag, checked) => {
                    const v = form.getValues('tags');
                    form.setValue(
                      'tags',
                      checked ? [...v, tag.id] : v.filter((id) => id !== tag.id)
                    );
                  }}
                />
              </div>
            </>
          )}

          {/* ═══ 11. GEBRUIKER ═══ */}
          <FormField
            control={form.control}
            name="userId"
            render={({ field }) => (
              <FormItem className="col-span-full lg:col-span-1">
                <FormLabel>Gebruiker ID (optioneel)</FormLabel>
                <FormControl>
                  <Input placeholder="1" {...field} />
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
