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
import { useEffect, useState } from 'react';
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
  const [items, setItems] = useState(props?.items || []);
  const [links, setLinks] = useState<Link[]>([]);
  const [settingLinks, setSettingLinks] = useState<boolean>(false);

  async function onSubmit(values: FormData) {
    const newItem = {
      trigger: `${
        items.length > 0 ? parseInt(items[items.length - 1].trigger) + 1 : 0
      }`,
      title: values.title,
      description: values.description,
      active: values.active,
      links: values.links || [],
    };

    const updatedItems = [...(props.items || []), newItem];
    setItems(updatedItems);
    form.reset();
    setLinks([]);
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

  // type Item = {
  //   trigger: string;
  //   title?: string;
  //   description: string;
  //   active: boolean;
  //   links?: Array<{
  //     title: string;
  //     url: string;
  //     openInNewWindow: boolean;
  //   }>;
  // };

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

  function handleItemAction(
    actionType: 'moveUp' | 'moveDown' | 'delete',
    clickedItemTrigger: string
  ) {
    setItems((currentItems) => {
      const index = currentItems.findIndex(
        (item) => item.trigger === clickedItemTrigger
      );

      switch (actionType) {
        case 'moveUp':
          if (index > 0) {
            let prevTrigger = currentItems[index - 1].trigger;
            currentItems[index - 1].trigger = currentItems[index].trigger;
            currentItems[index].trigger = prevTrigger;
          }
          break;
        case 'moveDown':
          if (index < currentItems.length - 1) {
            let nextTrigger = currentItems[index + 1].trigger;
            currentItems[index + 1].trigger = currentItems[index].trigger;
            currentItems[index].trigger = nextTrigger;
          }
          break;
        case 'delete':
          return currentItems.filter(
            (item) => item.trigger !== clickedItemTrigger
          );
      }

      return [...currentItems];
    });
  }

  function handleLinkAction(
    actionType: 'moveUp' | 'moveDown' | 'delete',
    clickedLinkTrigger: string
  ) {
    setLinks((currentLinks) => {
      const index = currentLinks.findIndex(
        (link) => link.trigger === clickedLinkTrigger
      );

      switch (actionType) {
        case 'moveUp':
          if (index > 0) {
            let prevTrigger = currentLinks[index - 1].trigger;
            currentLinks[index - 1].trigger = currentLinks[index].trigger;
            currentLinks[index].trigger = prevTrigger;
          }
          break;
        case 'moveDown':
          if (index < currentLinks.length - 1) {
            let nextTrigger = currentLinks[index + 1].trigger;
            currentLinks[index + 1].trigger = currentLinks[index].trigger;
            currentLinks[index].trigger = nextTrigger;
          }
          break;
        case 'delete':
          return currentLinks.filter(
            (item) => item.trigger !== clickedLinkTrigger
          );
      }

      return [...currentLinks];
    });
  }

  function handleAddLink(values: FormData) {
    const newLink = {
      trigger: `${
        links.length > 0 ? parseInt(links[links.length - 1].trigger) + 1 : 0
      }`,
      title: values.links?.[values.links.length - 1].title || '',
      url: values.links?.[values.links.length - 1].url || '',
      openInNewWindow:
        values.links?.[values.links.length - 1].openInNewWindow || false,
    };
    console.log(newLink);
    setLinks([...(links || []), newLink]);
  }

  function handleSaveItems() {
    props.updateConfig({ ...props, items });
  }

  function handleSaveLinks() {
    form.setValue('links', links);
    console.log(form.getValues());
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
                  name="title"
                  render={({ field }) => (
                    <FormItem>
                      <FormLabel>Titel (Bijvoorbeeld "19 April")</FormLabel>
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
                    className="w-fit mt-4 bg-secondary text-black"
                    type="button"
                    onClick={() => setSettingLinks(!settingLinks)}>
                    {`Voeg link toe (${links.length})`}
                  </Button>
                  <FormMessage />
                </FormItem>
              </div>
              <Button className="w-fit mt-4" type="submit">
                Voeg item toe
              </Button>
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
                    className="w-fit mt-4 bg-secondary text-black"
                    type="button"
                    onClick={() => setSettingLinks(() => !settingLinks)}>
                    Annuleer
                  </Button>
                  <Button
                    className="w-fit mt-4"
                    type="button"
                    onClick={() => handleAddLink(form.getValues())}>
                    Voeg link toe
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
                              className="flex py-3 px-2 bg-secondary">
                              <span className="flex gap-2 mr-2">
                                <X
                                  className="cursor-pointer"
                                  onClick={() =>
                                    handleLinkAction('delete', link.trigger)
                                  }
                                />
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
                              <span>{link.title}</span>
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
                              className="flex py-3 px-2 bg-secondary">
                              <span className="flex gap-2 mr-2">
                                <X
                                  className="cursor-pointer"
                                  onClick={() =>
                                    handleItemAction('delete', item.trigger)
                                  }
                                />
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
                              <span>{item.title}</span>
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
