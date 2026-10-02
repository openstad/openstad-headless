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
import { Label } from '@/components/ui/label';
import { Separator } from '@/components/ui/separator';
import { Heading } from '@/components/ui/typography';
import { UploadDocument } from '@/hooks/upload-document';
import { cleanLinks, getCustomTitle, moveEntry } from '@/lib/timeline-items';
import { generateId, withId } from '@/lib/widget-item-helpers';
import { zodResolver } from '@hookform/resolvers/zod';
import {
  DATE_LABEL_MAX_LENGTH,
  DATE_PRECISIONS,
  DATE_PRECISION_LABELS,
  DatePrecision,
  TimelineDateInput,
  capitalizeFirst,
  formatTimelineDate,
  fromTimelineDateInput,
  toTimelineDateInput,
} from '@openstad-headless/lib/timeline-date-precision';
import {
  DUTCH_MONTHS,
  formatDutchDate,
} from '@openstad-headless/lib/timeline-dates';
import {
  formatFileSize,
  getFileFormat,
} from '@openstad-headless/ui/src/lib/format-file-size';
import * as Switch from '@radix-ui/react-switch';
import { ArrowDown, ArrowUp, Plus, X } from 'lucide-react';
import { useRouter } from 'next/router';
import { useEffect, useState } from 'react';
import { useForm } from 'react-hook-form';
import toast from 'react-hot-toast';
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
  datePrecision?: string;
  dateLabel?: string;
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
  fileFormat?: string;
  fileSize?: string;
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
  list: AgendaItem[],
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

const selectClassName =
  'flex h-10 w-full rounded-md border border-input bg-background px-3 py-2 text-sm ring-offset-background focus:outline-none focus:ring-2 focus:ring-ring focus:ring-offset-2';

const defaults = (): FormData => ({
  trigger: '0',
  title: '',
  description: '',
  active: true,
  highlighted: false,
  activeFrom: '',
  activeTo: '',
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
  // Timeline items pick a date notation (day, week, month, ...); the controls
  // for it live outside react-hook-form, like the links.
  const [dateInput, setDateInput] = useState<TimelineDateInput>(() =>
    toTimelineDateInput()
  );
  const [dateError, setDateError] = useState<string | null>(null);
  const [selectedItemId, setSelectedItemId] = useState<string | null>(null);
  const selectedItem = selectedItemId
    ? items.find((i) => i.id === selectedItemId) || null
    : null;
  // The last item (by start date) keeps a manually-editable end date;
  // all earlier items have their end date auto-computed in timeline mode.
  const lastItemId = [...items].sort((a, b) =>
    (a.activeFrom ?? '').localeCompare(b.activeFrom ?? '')
  )[items.length - 1]?.id;
  const isLastItemSelected = !!selectedItem && selectedItem.id === lastItemId;

  const form = useForm<FormData>({
    resolver: zodResolver<any>(formSchema),
    defaultValues: defaults(),
  });

  useEffect(() => {
    if (selectedItem) {
      const itemLinks = [...(selectedItem.links || [])]
        .sort((a, b) => parseInt(a.trigger) - parseInt(b.trigger))
        .map((link) => ({
          ...link,
          kind: link.kind ?? link.soort ?? 'link',
        }));
      form.reset({
        trigger: selectedItem.trigger,
        // In timeline mode a date stored as title counts as an empty title.
        title: timelineMode
          ? getCustomTitle(selectedItem.title)
          : selectedItem.title || '',
        description: selectedItem.description || '',
        active: selectedItem.active ?? true,
        highlighted: selectedItem.highlighted || false,
        activeFrom: toDateInputValue(selectedItem.activeFrom),
        activeTo: toDateInputValue(selectedItem.activeTo),
      });
      setLinks(itemLinks.map(withId));
      setDateInput(toTimelineDateInput(selectedItem));
      setDateError(null);
    }
  }, [selectedItemId, form]);

  function onSubmit(values: FormData) {
    // In timeline mode the date fields come from the notation controls.
    let dateFields: Pick<
      AgendaItem,
      'activeFrom' | 'datePrecision' | 'dateLabel'
    > = { activeFrom: values.activeFrom };
    if (timelineMode) {
      const date = fromTimelineDateInput(dateInput);
      if (!date.ok) {
        setDateError(date.error);
        return;
      }
      dateFields = {
        activeFrom: date.fields.activeFrom,
        datePrecision: date.fields.datePrecision,
        dateLabel: date.fields.dateLabel,
      };
    }
    setDateError(null);

    const itemLinks = cleanLinks(links).map(({ id, ...link }) => link);

    if (selectedItem) {
      const { trigger: _formTrigger, ...valuesWithoutTrigger } = values;

      onItemsChange(
        items.map((item) =>
          item.id === selectedItem.id
            ? {
                ...item,
                ...valuesWithoutTrigger,
                ...dateFields,
                links: itemLinks,
              }
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
          activeTo: values.activeTo,
          ...dateFields,
          links: itemLinks,
        },
      ]);
    }
    form.reset(defaults());
    setLinks([]);
    setDateInput(toTimelineDateInput());
    setDateError(null);
  }

  function updateDateInput(patch: Partial<TimelineDateInput>) {
    setDateInput((current) => ({ ...current, ...patch }));
  }

  const datePreviewResult = fromTimelineDateInput(dateInput);
  const datePreview = datePreviewResult.ok
    ? formatTimelineDate(datePreviewResult.fields)
    : '';

  function addLink() {
    setLinks((current) => [
      ...current,
      {
        id: generateId(),
        trigger: `${current.length}`,
        title: '',
        url: '',
        openInNewWindow: false,
        kind: 'link',
      },
    ]);
  }

  function updateLink(id: string | undefined, patch: Partial<AgendaLink>) {
    setLinks((current) =>
      current.map((link) => (link.id === id ? { ...link, ...patch } : link))
    );
  }

  function removeLink(id: string | undefined) {
    setLinks((current) => current.filter((link) => link.id !== id));
  }

  function moveLink(index: number, direction: 'up' | 'down') {
    setLinks((current) => moveEntry(current, index, direction));
  }

  async function uploadLinkDocument(id: string | undefined, file: File) {
    try {
      const uploaded = await UploadDocument(file, project as string);
      if (uploaded?.url) {
        updateLink(id, {
          url: uploaded.url,
          documentName: uploaded.name || file.name,
          fileFormat: getFileFormat(file.name),
          fileSize: file.size > 0 ? formatFileSize(file.size) : undefined,
        });
      }
    } catch {
      toast.error('Document uploaden mislukt. Probeer het opnieuw.');
    }
  }

  function handleAction(
    actionType: 'moveUp' | 'moveDown' | 'delete',
    clickedTrigger: string
  ) {
    onItemsChange(handleMovementOrDeletion(items, actionType, clickedTrigger));
  }

  function resetForm() {
    form.reset(defaults());
    setLinks([]);
    setDateInput(toTimelineDateInput());
    setDateError(null);
    setSelectedItemId(null);
  }

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
                      .map((item, index) => {
                        const itemLabel =
                          (timelineMode
                            ? getCustomTitle(item.title)
                            : item.title) ||
                          item.description ||
                          '(geen titel)';
                        const itemDate = timelineMode
                          ? formatTimelineDate(item)
                          : item.activeFrom
                            ? formatDutchDate(toDateInputValue(item.activeFrom))
                            : '';
                        return (
                          <div
                            key={item.id ?? index}
                            className={`flex justify-between border border-secondary ${
                              item.id === selectedItem?.id && 'bg-secondary'
                            }`}>
                            {/* Timeline items are ordered by date automatically. */}
                            {!timelineMode && (
                              <span className="flex gap-2 py-3 px-2">
                                <button
                                  type="button"
                                  aria-label={`Verplaats omhoog: ${itemLabel}`}
                                  onClick={() =>
                                    handleAction('moveUp', item.trigger)
                                  }>
                                  <ArrowUp aria-hidden="true" />
                                </button>
                                <button
                                  type="button"
                                  aria-label={`Verplaats omlaag: ${itemLabel}`}
                                  onClick={() =>
                                    handleAction('moveDown', item.trigger)
                                  }>
                                  <ArrowDown aria-hidden="true" />
                                </button>
                              </span>
                            )}
                            <button
                              type="button"
                              className="py-3 px-2 w-full min-w-0 text-left break-words"
                              aria-current={
                                item.id === selectedItem?.id
                                  ? 'true'
                                  : undefined
                              }
                              onClick={() =>
                                setSelectedItemId(item.id ?? null)
                              }>
                              {itemLabel}
                              {itemDate && (
                                <span className="block text-sm text-muted-foreground">
                                  {itemDate}
                                </span>
                              )}
                            </button>
                            <span className="py-3 px-2">
                              <button
                                type="button"
                                aria-label={`Verwijder item: ${itemLabel}`}
                                onClick={() =>
                                  handleAction('delete', item.trigger)
                                }>
                                <X aria-hidden="true" />
                              </button>
                            </span>
                          </div>
                        );
                      })
                  : 'Geen items'}
              </div>
            </div>
          </div>

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
                    {timelineMode ? (
                      <fieldset className="flex flex-col gap-y-2">
                        <legend className="mb-2 text-sm font-medium">
                          Datum
                        </legend>
                        <div className="flex flex-wrap items-end gap-3">
                          <div className="flex flex-col gap-2">
                            <Label htmlFor="timeline-date-precision">
                              Notatie
                            </Label>
                            <select
                              id="timeline-date-precision"
                              className={selectClassName}
                              value={dateInput.precision}
                              onChange={(e) =>
                                updateDateInput({
                                  precision: e.target.value as DatePrecision,
                                })
                              }>
                              {DATE_PRECISIONS.map((option) => (
                                <option key={option} value={option}>
                                  {DATE_PRECISION_LABELS[option]}
                                </option>
                              ))}
                            </select>
                          </div>

                          {dateInput.precision === 'day' && (
                            <div className="flex flex-col gap-2">
                              <Label htmlFor="timeline-date-day">Datum</Label>
                              <Input
                                id="timeline-date-day"
                                type="date"
                                value={dateInput.date}
                                onChange={(e) =>
                                  updateDateInput({ date: e.target.value })
                                }
                              />
                            </div>
                          )}

                          {dateInput.precision === 'week' && (
                            <div className="flex flex-col gap-2">
                              <Label htmlFor="timeline-date-week">
                                Weeknummer
                              </Label>
                              <Input
                                id="timeline-date-week"
                                type="number"
                                min={1}
                                max={53}
                                className="w-28"
                                value={dateInput.week}
                                onChange={(e) =>
                                  updateDateInput({ week: e.target.value })
                                }
                              />
                            </div>
                          )}

                          {dateInput.precision === 'month' && (
                            <div className="flex flex-col gap-2">
                              <Label htmlFor="timeline-date-month">Maand</Label>
                              <select
                                id="timeline-date-month"
                                className={selectClassName}
                                value={dateInput.month}
                                onChange={(e) =>
                                  updateDateInput({ month: e.target.value })
                                }>
                                {DUTCH_MONTHS.map((month, monthIndex) => (
                                  <option
                                    key={month}
                                    value={String(monthIndex + 1)}>
                                    {capitalizeFirst(month)}
                                  </option>
                                ))}
                              </select>
                            </div>
                          )}

                          {dateInput.precision === 'quarter' && (
                            <div className="flex flex-col gap-2">
                              <Label htmlFor="timeline-date-quarter">
                                Kwartaal
                              </Label>
                              <select
                                id="timeline-date-quarter"
                                className={selectClassName}
                                value={dateInput.quarter}
                                onChange={(e) =>
                                  updateDateInput({ quarter: e.target.value })
                                }>
                                {['1', '2', '3', '4'].map((quarter) => (
                                  <option key={quarter} value={quarter}>
                                    Q{quarter}
                                  </option>
                                ))}
                              </select>
                            </div>
                          )}

                          {dateInput.precision === 'text' && (
                            <>
                              <div className="flex flex-col gap-2">
                                <Label htmlFor="timeline-date-label">
                                  Tekst
                                </Label>
                                <Input
                                  id="timeline-date-label"
                                  maxLength={DATE_LABEL_MAX_LENGTH}
                                  value={dateInput.label}
                                  onChange={(e) =>
                                    updateDateInput({ label: e.target.value })
                                  }
                                />
                              </div>
                              <div className="flex flex-col gap-2">
                                <Label htmlFor="timeline-date-expected">
                                  Verwachte datum
                                </Label>
                                <Input
                                  id="timeline-date-expected"
                                  type="date"
                                  aria-describedby="timeline-date-help"
                                  value={dateInput.date}
                                  onChange={(e) =>
                                    updateDateInput({ date: e.target.value })
                                  }
                                />
                              </div>
                            </>
                          )}

                          {dateInput.precision !== 'day' &&
                            dateInput.precision !== 'text' && (
                              <div className="flex flex-col gap-2">
                                <Label htmlFor="timeline-date-year">Jaar</Label>
                                <Input
                                  id="timeline-date-year"
                                  type="number"
                                  min={1900}
                                  max={2200}
                                  className="w-28"
                                  value={dateInput.year}
                                  onChange={(e) =>
                                    updateDateInput({ year: e.target.value })
                                  }
                                />
                              </div>
                            )}
                        </div>
                        {dateInput.precision === 'text' && (
                          <p
                            id="timeline-date-help"
                            className="text-sm text-muted-foreground">
                            Vul bij Verwachte datum een geschatte datum in.
                            Bezoekers zien alleen de tekst.
                          </p>
                        )}
                        {datePreview && (
                          <p className="text-sm text-muted-foreground">
                            Wordt getoond als:{' '}
                            <strong className="text-foreground">
                              {datePreview}
                            </strong>
                          </p>
                        )}
                        {dateError && (
                          <p
                            className="text-sm font-medium text-destructive"
                            role="alert">
                            {dateError}
                          </p>
                        )}
                      </fieldset>
                    ) : (
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
                    )}
                    <FormField
                      control={form.control}
                      name="activeTo"
                      render={({ field }) => (
                        <FormItem className="items-start md:col-span-full">
                          <FormLabel>
                            {timelineMode && !isLastItemSelected
                              ? 'Actief t/m (hele dag)'
                              : 'Actief t/m (hele dag) - laat leeg voor geen einddatum'}
                          </FormLabel>
                          {timelineMode && !isLastItemSelected && (
                            <FormDescription>
                              Wordt automatisch berekend uit de startdatum van
                              het volgende item.
                            </FormDescription>
                          )}
                          <Input
                            type="date"
                            {...field}
                            readOnly={timelineMode && !isLastItemSelected}
                            disabled={timelineMode && !isLastItemSelected}
                            className="inline-block !w-auto"
                          />
                          <FormMessage />
                        </FormItem>
                      )}
                    />
                  </>
                )}
              </div>

              <fieldset className="mt-6 flex flex-col gap-y-3">
                <legend className="mb-3 text-sm font-medium">
                  {`Links en documenten (${links.length})`}
                </legend>
                {links.map((link, index) => {
                  const kind = link.kind ?? 'link';
                  const fieldId = `agenda-link-${link.id}`;
                  const linkLabel = link.title || `link ${index + 1}`;
                  return (
                    <div
                      key={link.id}
                      className="flex flex-col gap-3 rounded-md border border-secondary p-3">
                      <div className="grid grid-cols-1 gap-3 lg:grid-cols-[140px_minmax(0,1fr)_minmax(0,1fr)]">
                        <div className="flex flex-col gap-2">
                          <Label htmlFor={`${fieldId}-kind`}>Soort</Label>
                          <select
                            id={`${fieldId}-kind`}
                            className="flex h-10 w-full rounded-md border border-input bg-background px-3 py-2 text-sm ring-offset-background focus:outline-none focus:ring-2 focus:ring-ring focus:ring-offset-2"
                            value={kind}
                            onChange={(e) =>
                              updateLink(link.id, {
                                kind: e.target.value as 'link' | 'document',
                                url: '',
                                documentName: undefined,
                                fileFormat: undefined,
                                fileSize: undefined,
                              })
                            }>
                            <option value="link">Link</option>
                            <option value="document">Document</option>
                          </select>
                        </div>
                        {kind === 'document' ? (
                          <div className="flex flex-col gap-2">
                            <Label htmlFor={`${fieldId}-file`}>Document</Label>
                            <Input
                              id={`${fieldId}-file`}
                              type="file"
                              accept="application/pdf,application/msword,application/vnd.openxmlformats-officedocument.wordprocessingml.document,image/*"
                              onChange={(e) => {
                                const file = e.target.files?.[0];
                                if (file) uploadLinkDocument(link.id, file);
                              }}
                            />
                            {link.documentName ? (
                              <span className="text-sm">
                                <span className="text-muted-foreground">
                                  Huidig bestand:{' '}
                                </span>
                                <a
                                  href={link.url}
                                  target="_blank"
                                  rel="noopener noreferrer"
                                  className="text-primary underline break-all">
                                  {link.documentName}
                                </a>
                              </span>
                            ) : null}
                          </div>
                        ) : (
                          <div className="flex flex-col gap-2">
                            <Label htmlFor={`${fieldId}-url`}>Link URL</Label>
                            <Input
                              id={`${fieldId}-url`}
                              value={link.url}
                              onChange={(e) =>
                                updateLink(link.id, { url: e.target.value })
                              }
                            />
                          </div>
                        )}
                        <div className="flex flex-col gap-2">
                          <Label htmlFor={`${fieldId}-title`}>Link titel</Label>
                          <Input
                            id={`${fieldId}-title`}
                            value={link.title}
                            onChange={(e) =>
                              updateLink(link.id, { title: e.target.value })
                            }
                          />
                        </div>
                      </div>
                      <div className="flex flex-wrap items-center justify-between gap-3">
                        <div className="flex items-center gap-2">
                          <Switch.Root
                            id={`${fieldId}-new-window`}
                            className="block w-[50px] h-[25px] bg-stone-300 rounded-full relative focus:shadow-[0_0_0_2px] focus:shadow-black data-[state=checked]:bg-primary outline-none cursor-default"
                            onCheckedChange={(checked: boolean) =>
                              updateLink(link.id, { openInNewWindow: checked })
                            }
                            checked={!!link.openInNewWindow}>
                            <Switch.Thumb className="block w-[21px] h-[21px] bg-white rounded-full transition-transform duration-100 translate-x-0.5 will-change-transform data-[state=checked]:translate-x-[27px]" />
                          </Switch.Root>
                          <Label htmlFor={`${fieldId}-new-window`}>
                            Open in nieuw venster
                          </Label>
                        </div>
                        <div className="flex items-center gap-2">
                          <button
                            type="button"
                            className="disabled:opacity-30"
                            aria-label={`Verplaats omhoog: ${linkLabel}`}
                            disabled={index === 0}
                            onClick={() => moveLink(index, 'up')}>
                            <ArrowUp aria-hidden="true" />
                          </button>
                          <button
                            type="button"
                            className="disabled:opacity-30"
                            aria-label={`Verplaats omlaag: ${linkLabel}`}
                            disabled={index === links.length - 1}
                            onClick={() => moveLink(index, 'down')}>
                            <ArrowDown aria-hidden="true" />
                          </button>
                          <button
                            type="button"
                            aria-label={`Verwijder link: ${linkLabel}`}
                            onClick={() => removeLink(link.id)}>
                            <X aria-hidden="true" />
                          </button>
                        </div>
                      </div>
                    </div>
                  );
                })}
                <Button
                  className="w-fit bg-secondary text-black hover:text-white"
                  type="button"
                  onClick={() => addLink()}>
                  <Plus className="mr-1 h-4 w-4" aria-hidden="true" />
                  Voeg link of document toe
                </Button>
              </fieldset>
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
        </div>
      </div>
    </Form>
  );
}
