import { Button } from '@/components/ui/button';
import {
  Form,
  FormField,
  FormItem,
  FormLabel,
  FormMessage,
} from '@/components/ui/form';
import { Input } from '@/components/ui/input';
import { Separator } from '@/components/ui/separator';
import { Heading } from '@/components/ui/typography';
import { YesNoSelect } from '@/lib/form-widget-helpers';
import { EditFieldProps } from '@/lib/form-widget-helpers/EditFieldProps';
import { zodResolver } from '@hookform/resolvers/zod';
import { AgendaWidgetProps } from '@openstad-headless/agenda/src/agenda';
import { ArrowDown, ArrowUp, X } from 'lucide-react';
import { useEffect, useState } from 'react';
import { useForm } from 'react-hook-form';
import * as z from 'zod';
import * as Switch from '@radix-ui/react-switch';

const formSchema = z.object({
  trigger: z.string(),
  title: z.string(),
  description: z.string(),
  active: z.boolean(),
  links: z
    .array(
      z.object({
        trigger: z.string(),
        title: z.string(),
        url: z.string(),
        openInNewWindow: z.boolean(),
      })
    )
    .optional(),
});

export default function WidgetAgendaItems(
  props: AgendaWidgetProps & EditFieldProps<AgendaWidgetProps>
) {
  type FormData = z.infer<typeof formSchema>;
  const [items, setItems] = useState<Item[]>([]);
  const [links, setLinks] = useState<Link[]>([]);
  const [selectedItem, setItem] = useState<Item | null>(null);
  const [selectedLink, setLink] = useState<Link | null>(null);
  const [settingLinks, setSettingLinks] = useState<boolean>(false);

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
          trigger: `${
            currentItems.length > 0
              ? parseInt(currentItems[currentItems.length - 1].trigger) + 1
              : 0
          }`,
          title: values.title,
          description: values.description,
          active: values.active,
          links: values.links || [],
        },
      ]);
    }
    form.reset(defaults);
    setLinks([]);
  }

  // adds link to links array if no link is selected, otherwise updates the selected link
  function handleAddLink(values: FormData) {
    if (selectedLink) {
      setLinks((currentLinks) =>
        currentLinks.map((link) =>
          link.trigger === selectedLink.trigger
            ? {
                ...link,
                title:
                  values.links?.find((l) => l.trigger === link.trigger)
                    ?.title || '',
                url:
                  values.links?.find((l) => l.trigger === link.trigger)?.url ||
                  '',
                openInNewWindow:
                  values.links?.find((l) => l.trigger === link.trigger)
                    ?.openInNewWindow || false,
              }
            : link
        )
      );
      setLink(null);
    } else {
      const newLink = {
        trigger: `${
          links.length > 0 ? parseInt(links[links.length - 1].trigger) + 1 : 0
        }`,
        title: values.links?.[values.links.length - 1].title || '',
        url: values.links?.[values.links.length - 1].url || '',
        openInNewWindow:
          values.links?.[values.links.length - 1].openInNewWindow || false,
      };
      setLinks((currentLinks) => [...currentLinks, newLink]);
    }
  }

  const defaults = () => ({
    trigger: '0',
    title: '',
    description: '',
    active: true,
    links: [],
  });

  const form = useForm<FormData>({
    resolver: zodResolver<any>(formSchema),
    defaultValues: defaults(),
  });

  type Item = {
    trigger: string;
    title?: string;
    description: string;
    active: boolean;
    links?: Array<Link>;
  };

  type Link = {
    trigger: string;
    title: string;
    url: string;
    openInNewWindow: boolean;
  };

  useEffect(() => {
    if (props?.items && props?.items?.length > 0) {
      setItems(props?.items);
    }
  }, [props?.items]);

  const { onFieldChanged } = props;
  useEffect(() => {
      onFieldChanged('items', items);
  }, [items]);

  useEffect(() => {
    if (selectedItem) {
      form.reset({
        trigger: selectedItem.trigger,
        title: selectedItem.title || '',
        description: selectedItem.description,
        active: selectedItem.active,
        links: selectedItem.links || [],
      });
      setLinks(selectedItem.links || []);
    }
  }, [selectedItem, form]);

  useEffect(() => {
    if (selectedLink) {
      const updatedLinks = [...links];
      const index = links.findIndex(
        (link) => link.trigger === selectedLink.trigger
      );
      updatedLinks[index] = { ...selectedLink };

      form.reset({
        ...form.getValues(),
        links: updatedLinks,
      });
    }
  }, [selectedLink, form, links]);

  const handleAction = (
    actionType: 'moveUp' | 'moveDown' | 'delete',
    clickedTrigger: string,
    isItemAction: boolean // Determines if the action is for items or links
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
      setLinks((currentLinks) => {
        return handleMovementOrDeletion(
          currentLinks,
          actionType,
          clickedTrigger
        ) as Link[];
      });
    }
  };

  // This is a helper function to handle moving up, moving down, or deleting an entry
  function handleMovementOrDeletion(
    list: Array<Item | Link>,
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

  function resetForm() {
    form.reset(defaults());
    setLinks([]);
    setItem(null);
  }

  function handleSaveLinks() {
    form.setValue('links', links);
    setSettingLinks(false);
  }

  return (
    <div>
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
                              onClick={() => setItem(item)}>
                              {item.title}
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

            {settingLinks ? (
              <div className="p-6 bg-white rounded-md col-span-2 grid grid-cols-1 lg:grid-cols-2 gap-x-6">
                <div className="flex flex-col justify-between">
                  <div className="flex flex-col gap-y-2">
                    <Heading size="xl">Links</Heading>
                    <Separator className="mt-2" />
                    <FormField
                      control={form.control}
                      name={`links.${links.length - 1}.title`}
                      render={({ field }) => (
                        <FormItem>
                          <FormLabel>Link titel</FormLabel>
                          <Input {...field} />
                          <FormMessage />
                        </FormItem>
                      )}
                    />
                    <FormField
                      control={form.control}
                      name={`links.${links.length - 1}.url`}
                      render={({ field }) => (
                        <FormItem>
                          <FormLabel>Link URL</FormLabel>
                          <Input {...field} />
                          <FormMessage />
                        </FormItem>
                      )}
                    />
                    <FormField
                      control={form.control}
                      name={`links.${links.length - 1}.openInNewWindow`}
                      render={({ field }) => (
                        <FormItem>
                          <FormLabel>Open in nieuw venster</FormLabel>
                          {YesNoSelect(field, props)}
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
                        setSettingLinks(() => !settingLinks),
                          setLink(null),
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
                                link.trigger == selectedLink?.trigger &&
                                'bg-secondary'
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
                                    handleAction(
                                      'moveDown',
                                      link.trigger,
                                      false
                                    )
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
              <div className="p-6 bg-white rounded-md flex flex-col justify-between col-span-2">
                <div>
                  <Heading size="xl">Agenda items</Heading>
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
                    <FormField
                      control={form.control}
                      name="active"
                      render={({ field }) => (
                        <FormItem>
                          <FormLabel>Actief</FormLabel>
                          <Switch.Root
                            className="block w-[50px] h-[25px] bg-stone-300 rounded-full relative focus:shadow-[0_0_0_2px] focus:shadow-black data-[state=checked]:bg-primary outline-none cursor-default"
                            onCheckedChange={(e: boolean) => {
                              field.onChange(e);
                              if (props.onFieldChanged) {
                                props.onFieldChanged(field.name, e);
                              }
                            }}
                            checked={field.value}>
                            <Switch.Thumb className="block w-[21px] h-[21px] bg-white rounded-full transition-transform duration-100 translate-x-0.5 will-change-transform data-[state=checked]:translate-x-[27px]" />
                          </Switch.Root>
                          <FormMessage />
                        </FormItem>
                      )}
                    />

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
                      onClick={() => {
                        resetForm();
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
            )}
          </div>
        </form>
      </Form>
    </div>
  );
}
