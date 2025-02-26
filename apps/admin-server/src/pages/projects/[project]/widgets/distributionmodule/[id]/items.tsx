import { Button } from '@/components/ui/button';
import {
  Form,
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
import { DistributionModuleProps } from '@openstad-headless/distribution-module/src/distribution-module';
import { Item, Option } from '@openstad-headless/enquete/src/types/enquete-props';
import { ArrowDown, ArrowUp, X } from 'lucide-react';
import React, { useEffect, useState } from 'react';
import { useForm } from 'react-hook-form';
import * as z from 'zod';

const formSchema = z.object({
  trigger: z.string(),
  title: z.string().optional(),
  key: z.string(),
  description: z.string().optional(),
  placeholder: z.string().optional(),
});

export default function WidgetDistributionModuleItems(
  props: DistributionModuleProps & EditFieldProps<DistributionModuleProps>
) {
  type FormData = z.infer<typeof formSchema>;
  const [items, setItems] = useState<Item[]>([]);
  const [selectedItem, setItem] = useState<Item | null>(null);

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
          placeholder: values.placeholder || '',
        },
      ]);
    }

    form.reset(defaults);
  }

  const defaults = () => ({
    trigger: '0',
    title: '',
    key: '',
    description: '',
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
        description: selectedItem.description || '',
        placeholder: selectedItem.placeholder || '',
      });
    }
  }, [selectedItem, form]);

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

  function resetForm() {
    form.reset(defaults());
    setItem(null);
  }

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

            <div className="p-6 bg-white rounded-md flex flex-col justify-between col-span-2">
              <div>
                <Heading size="xl">Items</Heading>
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
                  >
                    {selectedItem
                      ? 'Sla wijzigingen op'
                      : 'Voeg item toe aan lijst'}
                  </Button>
                </div>
              </div>
            </div>

          </div>
        </form>
      </Form>
    </div>
  );
}
