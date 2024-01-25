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
import { AgendaWidgetProps } from '@openstad/agenda/src/agenda';
import { ArrowDown, ArrowUp, X } from 'lucide-react';
import { useCallback, useEffect, useState } from 'react';
import { useForm } from 'react-hook-form';
import * as z from 'zod';

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
    form.reset();
    setLinks([]);
  }

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

  const form = useForm<FormData>({
    resolver: zodResolver<any>(formSchema),
    defaultValues: {
      trigger: '0',
      title: '',
      description: '',
      active: true,
      links: [],
    },
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

  useEffect(() => {
    props.onFieldChanged('items', items);
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
  }, [selectedItem]);

  useEffect(() => {
    if (selectedLink) {
      // Update the last link in the array with values from selectedLink
      const updatedLinks = [...links];
      const index = links.findIndex(
        (link) => link.trigger === selectedLink.trigger
      );
      updatedLinks[index] = {
        trigger: selectedLink.trigger,
        title: selectedLink.title || '',
        url: selectedLink.url,
        openInNewWindow: selectedLink.openInNewWindow,
      };

      // Use form.reset to update the entire form state
      form.reset({
        ...form.getValues(), // Retains the current values of other fields
        links: updatedLinks,
      });
      console.log(updatedLinks);
    }
  }, [selectedLink]);

  const handleItemAction = useCallback(
    (
      actionType: 'moveUp' | 'moveDown' | 'delete',
      clickedItemTrigger: string
    ) => {
      setItems((currentItems) => {
        const index = currentItems.findIndex(
          (item) => item.trigger === clickedItemTrigger
        );

        if (actionType === 'delete') {
          return currentItems.filter(
            (item) => item.trigger !== clickedItemTrigger
          );
        }

        if (
          (actionType === 'moveUp' && index > 0) ||
          (actionType === 'moveDown' && index < currentItems.length - 1)
        ) {
          const newItemList = [...currentItems];
          const swapIndex = actionType === 'moveUp' ? index - 1 : index + 1;
          let tempTrigger = newItemList[swapIndex].trigger;
          newItemList[swapIndex].trigger = newItemList[index].trigger;
          newItemList[index].trigger = tempTrigger;
          return newItemList;
        }

        return currentItems;
      });
    },
    [items]
  );

  const handleLinkAction = useCallback(
    (
      actionType: 'moveUp' | 'moveDown' | 'delete',
      clickedLinkTrigger: string
    ) => {
      setLinks((currentLinks) => {
        const index = currentLinks.findIndex(
          (link) => link.trigger === clickedLinkTrigger
        );

        if (actionType === 'delete') {
          return currentLinks.filter(
            (link) => link.trigger !== clickedLinkTrigger
          );
        }

        if (
          (actionType === 'moveUp' && index > 0) ||
          (actionType === 'moveDown' && index < currentLinks.length - 1)
        ) {
          const newLinkList = [...currentLinks];
          const swapIndex = actionType === 'moveUp' ? index - 1 : index + 1;
          let tempTrigger = newLinkList[swapIndex].trigger;
          newLinkList[swapIndex].trigger = newLinkList[index].trigger;
          newLinkList[index].trigger = tempTrigger;
          return newLinkList;
        }

        return [...currentLinks];
      });
    },
    [links]
  );

  function handleSaveItems() {
    props.updateConfig({ ...props, items });
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
          <div
            className={`lg:w-full grid grid-cols-1 gap-x-6 ${
              settingLinks ? 'lg:grid-cols-3' : 'lg:grid-cols-2'
            }`}>
            <div className="p-6 bg-white rounded-md flex flex-col justify-between">
              <div>
                <Heading size="xl">Agenda items</Heading>
                <Separator className="my-4" />
                <FormField
                  control={form.control}
                  name="trigger"
                  render={({ field }) => (
                    <FormItem>
                      <Input {...field} />
                      <FormMessage />
                    </FormItem>
                  )}
                />
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
                      {YesNoSelect(field, props)}
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
              <div className="flex gap-2">
                <Button
                  className="w-fit mt-4 bg-secondary text-black hover:text-white"
                  type="button"
                  onClick={() => {
                    form.reset(), setItem(null);
                  }}>
                  Annuleer aanpassingen
                </Button>
                <Button className="w-fit mt-4" type="submit">
                  Sla item op in lijst
                </Button>
              </div>
            </div>

            {settingLinks && (
              <div className="p-6 bg-white rounded-md flex flex-col justify-between">
                <div>
                  <Heading size="xl">Links</Heading>
                  <Separator className="my-4" />
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
                </div>
                <div className="flex gap-2">
                  <Button
                    className="w-fit mt-4 bg-secondary text-black hover:text-white"
                    type="button"
                    onClick={() => setSettingLinks(() => !settingLinks)}>
                    Annuleer
                  </Button>
                  <Button
                    className="w-fit mt-4"
                    type="button"
                    onClick={() => handleAddLink(form.getValues())}>
                    Sla link op in lijst
                  </Button>
                </div>
              </div>
            )}
            {settingLinks ? (
              <div className="p-6 bg-white rounded-md flex flex-col justify-between">
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
                                    handleLinkAction('moveUp', link.trigger)
                                  }
                                />
                                <ArrowDown
                                  className="cursor-pointer"
                                  onClick={() =>
                                    handleLinkAction('moveDown', link.trigger)
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
                                    handleLinkAction('delete', link.trigger)
                                  }
                                />
                              </span>
                            </div>
                          ))
                      : 'Geen links'}
                  </div>
                </div>
                <Button
                  className="w-fit mt-4"
                  type="button"
                  onClick={() => handleSaveLinks()}>
                  Sla links op
                </Button>
              </div>
            ) : (
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
                                    handleItemAction('moveUp', item.trigger)
                                  }
                                />
                                <ArrowDown
                                  className="cursor-pointer"
                                  onClick={() =>
                                    handleItemAction('moveDown', item.trigger)
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
                                    handleItemAction('delete', item.trigger)
                                  }
                                />
                              </span>
                            </div>
                          ))
                      : 'Geen items'}
                  </div>
                </div>
                <Button
                  className="w-fit mt-4"
                  type="button"
                  onClick={() => handleSaveItems()}>
                  Opslaan
                </Button>
              </div>
            )}
          </div>
        </form>
      </Form>
    </div>
  );
}
