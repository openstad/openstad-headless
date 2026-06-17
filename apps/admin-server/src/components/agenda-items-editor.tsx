import { Button } from '@/components/ui/button';
import {
  Form,
  FormDescription,
  FormField,
  FormItem,
  FormLabel,
  FormMessage,
} from '@/components/ui/form';
import { Input } from '@/components/ui/input';
import { Separator } from '@/components/ui/separator';
import { Heading } from '@/components/ui/typography';
import { UploadDocument } from '@/hooks/upload-document';
import { generateId, withId } from '@/lib/widget-item-helpers';
import { zodResolver } from '@hookform/resolvers/zod';
import * as Switch from '@radix-ui/react-switch';
import { ArrowDown, ArrowUp, X } from 'lucide-react';
import { useRouter } from 'next/router';
import { useEffect, useState } from 'react';
import { useForm } from 'react-hook-form';
import * as z from 'zod';

export interface AgendaItem {
  id?: string;
  trigger: string;
  title?: string;
  description: string;
  active?: boolean;
  highlighted?: boolean;
  activeFrom?: string;
  activeTo?: string;
  links?: AgendaLink[];
}

export interface AgendaLink {
  id?: string;
  trigger: string;
  title: string;
  url: string;
  openInNewWindow: boolean;
  kind?: 'link' | 'document';
  soort?: 'link' | 'document';
  documentName?: string;
}

interface AgendaItemsEditorProps {
  items: AgendaItem[];
  onItemsChange: (items: AgendaItem[]) => void;
  showActiveDates?: boolean;
  timelineMode?: boolean;
}

const formSchema = z.object({
  trigger: z.string(),
  title: z.string(),
  description: z.string(),
  active: z.boolean().optional(),
  highlighted: z.boolean().optional(),
  activeFrom: z.string().optional(),
  activeTo: z.string().optional(),
  links: z
    .array(
      z.object({
        trigger: z.string(),
        title: z.string(),
        url: z.string(),
        openInNewWindow: z.boolean(),
        kind: z.enum(['link', 'document']).optional(),
        documentName: z.string().optional(),
      })
    )
    .optional(),
});

type FormData = z.infer<typeof formSchema>;

const DATE_ONLY_REGEX = /^\d{4}-\d{2}-\d{2}$/;

function toDateInputValue(value?: string) {
  if (!value) return '';
  if (DATE_ONLY_REGEX.test(value)) return value;
  const date = new Date(value);
  if (isNaN(date.getTime())) return '';
  return date.toISOString().slice(0, 10);
}

function handleMovementOrDeletion(
  list: Array<AgendaItem | AgendaLink>,
  actionType: 'moveUp' | 'moveDown' | 'delete',
  trigger: string
) {
  if (actionType === 'delete') {
    return list
      .filter((entry) => entry.trigger !== trigger)
      .sort((a, b) => parseInt(a.trigger) - parseInt(b.trigger));
  }

  const sorted = [...list].sort(
    (a, b) => parseInt(a.trigger) - parseInt(b.trigger)
  );
  const index = sorted.findIndex((entry) => entry.trigger === trigger);

  if (
    (actionType === 'moveUp' && index > 0) ||
    (actionType === 'moveDown' && index < sorted.length - 1)
  ) {
    const swapIndex = actionType === 'moveUp' ? index - 1 : index + 1;
    const triggerA = sorted[index].trigger;
    const triggerB = sorted[swapIndex].trigger;
    return sorted
      .map((entry) => {
        if (entry.trigger === triggerA) return { ...entry, trigger: triggerB };
        if (entry.trigger === triggerB) return { ...entry, trigger: triggerA };
        return entry;
      })
      .sort((a, b) => parseInt(a.trigger) - parseInt(b.trigger));
  }

  return sorted;
}

const defaults = (): FormData => ({
  trigger: '0',
  title: '',
  description: '',
  active: true,
  highlighted: false,
  activeFrom: '',
  activeTo: '',
  links: [],
});

export function AgendaItemsEditor({
  items,
  onItemsChange,
  showActiveDates = false,
  timelineMode = false,
}: AgendaItemsEditorProps) {
  const router = useRouter();
  const { project } = router.query;
  const [links, setLinks] = useState<AgendaLink[]>([]);
  const [selectedItemId, setSelectedItemId] = useState<string | null>(null);
  const selectedItem = selectedItemId
    ? items.find((i) => i.id === selectedItemId) || null
    : null;
  const [selectedLink, setLink] = useState<AgendaLink | null>(null);
  const [settingLinks, setSettingLinks] = useState<boolean>(false);

  const form = useForm<FormData>({
    resolver: zodResolver<any>(formSchema),
    defaultValues: defaults(),
  });

  useEffect(() => {
    if (selectedItem) {
      const normalizedLinks = (selectedItem.links || []).map((link) => ({
        ...link,
        kind: link.kind ?? link.soort,
      }));
      form.reset({
        trigger: selectedItem.trigger,
        title: selectedItem.title || '',
        description: selectedItem.description,
        active: selectedItem.active ?? true,
        highlighted: selectedItem.highlighted || false,
        activeFrom: toDateInputValue(selectedItem.activeFrom),
        activeTo: toDateInputValue(selectedItem.activeTo),
        links: normalizedLinks,
      });
      setLinks(normalizedLinks.map(withId));
    }
  }, [selectedItemId, form]);

  useEffect(() => {
    if (selectedLink) {
      const updatedLinks = [...links];
      const index = links.findIndex((link) => link.id === selectedLink.id);
      updatedLinks[index] = { ...selectedLink };

      form.reset({
        ...form.getValues(),
        links: updatedLinks,
      });
    }
  }, [selectedLink, form, links]);

  function onSubmit(values: FormData) {
    if (selectedItem) {
      const { trigger: _formTrigger, ...valuesWithoutTrigger } = values;

      onItemsChange(
        items.map((item) =>
          item.id === selectedItem.id
            ? { ...item, ...valuesWithoutTrigger }
            : item
        )
      );
      setSelectedItemId(null);
    } else {
      const maxTrigger = items.reduce(
        (max, i) => Math.max(max, parseInt(i.trigger) || 0),
        -1
      );
      onItemsChange([
        ...items,
        {
          id: generateId(),
          trigger: `${maxTrigger + 1}`,
          title: values.title,
          description: values.description,
          active: values.active,
          highlighted: values.highlighted,
          activeFrom: values.activeFrom,
          activeTo: values.activeTo,
          links: values.links || [],
        },
      ]);
    }
    form.reset(defaults());
    setLinks([]);
  }

  function handleAddLink(values: FormData) {
    if (selectedLink) {
      setLinks((currentLinks) =>
        currentLinks.map((link) => {
          if (link.id !== selectedLink.id) return link;
          const v = values.links?.find((l) => l.trigger === link.trigger);
          return {
            ...link,
            title: v?.title || '',
            url: v?.url || '',
            openInNewWindow: v?.openInNewWindow || false,
            kind: v?.kind || link.kind || link.soort || 'link',
            documentName: v?.documentName ?? link.documentName,
          };
        })
      );
      setLink(null);
    } else {
      const maxLinkTrigger = links.reduce(
        (max, l) => Math.max(max, parseInt(l.trigger) || 0),
        -1
      );
      const last = values.links?.[values.links.length - 1];
      const newLink: AgendaLink = {
        id: generateId(),
        trigger: `${maxLinkTrigger + 1}`,
        title: last?.title || '',
        url: last?.url || '',
        openInNewWindow: last?.openInNewWindow || false,
        kind: last?.kind || 'link',
        documentName: last?.documentName,
      };
      setLinks((currentLinks) => [...currentLinks, newLink]);
    }
  }

  function handleAction(
    actionType: 'moveUp' | 'moveDown' | 'delete',
    clickedTrigger: string,
    isItemAction: boolean
  ) {
    if (isItemAction) {
      onItemsChange(
        handleMovementOrDeletion(
          items,
          actionType,
          clickedTrigger
        ) as AgendaItem[]
      );
    } else {
      setLinks(
        (currentLinks) =>
          handleMovementOrDeletion(
            currentLinks,
            actionType,
            clickedTrigger
          ) as AgendaLink[]
      );
    }
  }

  function resetForm() {
    form.reset(defaults());
    setLinks([]);
    setSelectedItemId(null);
  }

  function handleSaveLinks() {
    form.setValue('links', links);
    setSettingLinks(false);
  }

  const selectedLinkIndex = selectedLink
    ? links.findIndex((l) => l.id === selectedLink.id)
    : -1;
  const activeLinkIndex =
    selectedLinkIndex >= 0 ? selectedLinkIndex : links.length - 1;

  return (
    <Form {...form}>
      <div className="w-full grid gap-4">
        <div className="lg:w-full grid grid-cols-1 gap-x-6 lg:grid-cols-3">
          <div className="p-6 bg-white rounded-md flex flex-col justify-between">
            <div>
              <Heading size="xl">Lijst van huidige items</Heading>
              <Separator className="my-4" />
              <div className="flex flex-col gap-1">
                {items.length > 0
                  ? [...items]
                      .sort((a, b) => parseInt(a.trigger) - parseInt(b.trigger))
                      .map((item, index) => (
                        <div
                          key={index}
                          className={`flex cursor-pointer justify-between border border-secondary ${
                            item.id === selectedItem?.id && 'bg-secondary'
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
                            onClick={() => setSelectedItemId(item.id ?? null)}>
                            {item.title || item.description || '(geen titel)'}
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
          </div>

          {settingLinks ? (
            <div className="p-6 bg-white rounded-md col-span-2 grid grid-cols-1 lg:grid-cols-2 gap-x-6">
              <div className="flex flex-col justify-between">
                <div className="flex flex-col gap-y-2">
                  <Heading size="xl">Links</Heading>
                  <Separator className="mt-2" />
                  <FormField
                    control={form.control}
                    name={`links.${activeLinkIndex}.kind`}
                    render={({ field }) => (
                      <FormItem>
                        <FormLabel>Soort</FormLabel>
                        <select
                          className="flex h-10 w-full rounded-md border border-input bg-background px-3 py-2 text-sm ring-offset-background focus:outline-none focus:ring-2 focus:ring-ring focus:ring-offset-2"
                          value={field.value || 'link'}
                          onChange={(e) => {
                            field.onChange(e.target.value);
                            form.setValue(`links.${activeLinkIndex}.url`, '');
                            form.setValue(
                              `links.${activeLinkIndex}.documentName`,
                              undefined
                            );
                          }}>
                          <option value="link">Link</option>
                          <option value="document">Document</option>
                        </select>
                        <FormMessage />
                      </FormItem>
                    )}
                  />
                  <FormField
                    control={form.control}
                    name={`links.${activeLinkIndex}.title`}
                    render={({ field }) => (
                      <FormItem>
                        <FormLabel>Link titel</FormLabel>
                        <Input {...field} />
                        <FormMessage />
                      </FormItem>
                    )}
                  />
                  {form.watch(`links.${activeLinkIndex}.kind`) ===
                  'document' ? (
                    <FormItem>
                      <FormLabel>Document</FormLabel>
                      <Input
                        type="file"
                        accept="application/pdf,application/msword,application/vnd.openxmlformats-officedocument.wordprocessingml.document,image/*"
                        onChange={async (e) => {
                          const file = e.target.files?.[0];
                          if (!file) return;
                          const uploaded = await UploadDocument(
                            file,
                            project as string
                          );
                          if (uploaded?.url) {
                            form.setValue(
                              `links.${activeLinkIndex}.url`,
                              uploaded.url
                            );
                            form.setValue(
                              `links.${activeLinkIndex}.documentName`,
                              uploaded.name || file.name
                            );
                          }
                        }}
                      />
                      {form.watch(`links.${activeLinkIndex}.documentName`) ? (
                        <div className="flex items-center gap-2 mt-1 text-sm">
                          <span className="text-muted-foreground">
                            Huidig bestand:
                          </span>
                          <a
                            href={form.watch(`links.${activeLinkIndex}.url`)}
                            target="_blank"
                            rel="noopener noreferrer"
                            className="text-primary underline">
                            {form.watch(
                              `links.${activeLinkIndex}.documentName`
                            )}
                          </a>
                          <button
                            type="button"
                            className="text-destructive underline"
                            onClick={() => {
                              form.setValue(`links.${activeLinkIndex}.url`, '');
                              form.setValue(
                                `links.${activeLinkIndex}.documentName`,
                                ''
                              );
                            }}>
                            Verwijder
                          </button>
                        </div>
                      ) : null}
                      <FormMessage />
                    </FormItem>
                  ) : (
                    <FormField
                      control={form.control}
                      name={`links.${activeLinkIndex}.url`}
                      render={({ field }) => (
                        <FormItem>
                          <FormLabel>Link URL</FormLabel>
                          <Input {...field} />
                          <FormMessage />
                        </FormItem>
                      )}
                    />
                  )}
                  <FormField
                    control={form.control}
                    name={`links.${activeLinkIndex}.openInNewWindow`}
                    render={({ field }) => (
                      <FormItem>
                        <FormLabel>Open in nieuw venster</FormLabel>
                        <Switch.Root
                          className="block w-[50px] h-[25px] bg-stone-300 rounded-full relative focus:shadow-[0_0_0_2px] focus:shadow-black data-[state=checked]:bg-primary outline-none cursor-default"
                          onCheckedChange={(e: boolean) => {
                            field.onChange(e);
                          }}
                          checked={field.value}>
                          <Switch.Thumb className="block w-[21px] h-[21px] bg-white rounded-full transition-transform duration-100 translate-x-0.5 will-change-transform data-[state=checked]:translate-x-[27px]" />
                        </Switch.Root>
                        <FormMessage />
                      </FormItem>
                    )}
                  />
                  <Button
                    className="w-full bg-secondary text-black hover:text-white mt-4"
                    type="button"
                    onClick={() => handleAddLink(form.getValues())}>
                    {selectedLink
                      ? 'Sla wijzigingen op'
                      : 'Voeg link toe aan lijst'}
                  </Button>
                </div>
                <div className="flex gap-2">
                  <Button
                    className="w-fit mt-4 bg-secondary text-black hover:text-white"
                    type="button"
                    onClick={() => {
                      setSettingLinks(false);
                      setLink(null);
                      setLinks([]);
                    }}>
                    Annuleer
                  </Button>
                  <Button
                    className="w-fit mt-4"
                    type="button"
                    onClick={() => handleSaveLinks()}>
                    Sla links op
                  </Button>
                </div>
              </div>
              <div>
                <Heading size="xl">Lijst van huidige links</Heading>
                <Separator className="my-4" />
                <div className="flex flex-col gap-1">
                  {links.length > 0
                    ? links
                        .sort(
                          (a, b) => parseInt(a.trigger) - parseInt(b.trigger)
                        )
                        .map((link, index) => (
                          <div
                            key={index}
                            className={`flex cursor-pointer justify-between border border-secondary ${
                              link.id === selectedLink?.id && 'bg-secondary'
                            }`}>
                            <span className="flex gap-2 py-3 px-2">
                              <ArrowUp
                                className="cursor-pointer"
                                onClick={() =>
                                  handleAction('moveUp', link.trigger, false)
                                }
                              />
                              <ArrowDown
                                className="cursor-pointer"
                                onClick={() =>
                                  handleAction('moveDown', link.trigger, false)
                                }
                              />
                            </span>
                            <span
                              className="py-3 px-2 w-full"
                              onClick={() => setLink(link)}>
                              {link.title}
                            </span>
                            <span className="py-3 px-2">
                              <X
                                className="cursor-pointer"
                                onClick={() =>
                                  handleAction('delete', link.trigger, false)
                                }
                              />
                            </span>
                          </div>
                        ))
                    : 'Geen links'}
                </div>
              </div>
            </div>
          ) : (
            <div className="p-6 bg-white rounded-md flex flex-col col-span-2">
              <div>
                <Heading size="xl">Items</Heading>
                <Separator className="my-4" />
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
                <div className="w-full lg:w-2/3 flex flex-col gap-y-2">
                  <FormField
                    control={form.control}
                    name="title"
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
                    name="description"
                    render={({ field }) => (
                      <FormItem>
                        <FormLabel>Beschrijving</FormLabel>
                        <Input {...field} />
                        <FormMessage />
                      </FormItem>
                    )}
                  />
                  {!showActiveDates && (
                    <FormField
                      control={form.control}
                      name="active"
                      render={({ field }) => (
                        <FormItem>
                          <FormLabel>Markeer item</FormLabel>
                          <Switch.Root
                            className="block w-[50px] h-[25px] bg-stone-300 rounded-full relative focus:shadow-[0_0_0_2px] focus:shadow-black data-[state=checked]:bg-primary outline-none cursor-default"
                            onCheckedChange={(e: boolean) => {
                              field.onChange(e);
                            }}
                            checked={field.value}>
                            <Switch.Thumb className="block w-[21px] h-[21px] bg-white rounded-full transition-transform duration-100 translate-x-0.5 will-change-transform data-[state=checked]:translate-x-[27px]" />
                          </Switch.Root>
                          <FormMessage />
                        </FormItem>
                      )}
                    />
                  )}
                  {!timelineMode && (
                    <FormField
                      control={form.control}
                      name="highlighted"
                      render={({ field }) => (
                        <FormItem>
                          <FormLabel>Extra uitlichten</FormLabel>
                          <FormDescription>
                            Dit item wordt weergegeven als een gekleurd blok met
                            de primaire kleuren.
                          </FormDescription>
                          <Switch.Root
                            className="block w-[50px] h-[25px] bg-stone-300 rounded-full relative focus:shadow-[0_0_0_2px] focus:shadow-black data-[state=checked]:bg-primary outline-none cursor-default"
                            onCheckedChange={(e: boolean) => {
                              field.onChange(e);
                            }}
                            checked={field.value}>
                            <Switch.Thumb className="block w-[21px] h-[21px] bg-white rounded-full transition-transform duration-100 translate-x-0.5 will-change-transform data-[state=checked]:translate-x-[27px]" />
                          </Switch.Root>
                          <FormMessage />
                        </FormItem>
                      )}
                    />
                  )}
                  {showActiveDates && (
                    <>
                      <FormField
                        control={form.control}
                        name="activeFrom"
                        render={({ field }) => (
                          <FormItem className="items-start md:col-span-full">
                            <FormLabel>
                              Actief vanaf (hele dag) - laat leeg om direct te
                              starten
                            </FormLabel>
                            <Input
                              type="date"
                              {...field}
                              className="inline-block !w-auto"
                            />
                            <FormMessage />
                          </FormItem>
                        )}
                      />
                      <FormField
                        control={form.control}
                        name="activeTo"
                        render={({ field }) => (
                          <FormItem className="items-start md:col-span-full">
                            <FormLabel>
                              {timelineMode
                                ? 'Actief t/m (hele dag)'
                                : 'Actief t/m (hele dag) - laat leeg voor geen einddatum'}
                            </FormLabel>
                            {timelineMode && (
                              <FormDescription>
                                Wordt automatisch berekend uit de startdatum van
                                het volgende item.
                              </FormDescription>
                            )}
                            <Input
                              type="date"
                              {...field}
                              readOnly={timelineMode}
                              disabled={timelineMode}
                              className="inline-block !w-auto"
                            />
                            <FormMessage />
                          </FormItem>
                        )}
                      />
                    </>
                  )}

                  <FormItem>
                    <Button
                      className="w-fit mt-4 bg-secondary text-black hover:text-white"
                      type="button"
                      onClick={() => setSettingLinks(!settingLinks)}>
                      {`Pas website links (${links.length}) aan`}
                    </Button>
                    <FormMessage />
                  </FormItem>
                </div>
              </div>
              <div className="flex gap-2">
                {selectedItem && (
                  <Button
                    className="w-fit mt-4 bg-secondary text-black hover:text-white"
                    type="button"
                    onClick={() => resetForm()}>
                    Annuleer
                  </Button>
                )}
                <Button
                  className="w-fit mt-4"
                  type="button"
                  onClick={form.handleSubmit(onSubmit)}>
                  {selectedItem
                    ? 'Sla wijzigingen op'
                    : 'Voeg item toe aan lijst'}
                </Button>
              </div>
            </div>
          )}
        </div>
      </div>
    </Form>
  );
}
