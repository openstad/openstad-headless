import { ImageUploader } from '@/components/image-uploader';
import { Button } from '@/components/ui/button';
import {
    Form,
    FormControl,
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
import {ArrowDown, ArrowUp, X} from 'lucide-react';
import { useEffect, useState } from 'react';
import { useForm } from 'react-hook-form';
import * as z from 'zod';
import {Item, Option, ResourceFormWidgetProps} from "@openstad/resource-form/src/props";

const formSchema = z.object({
    trigger: z.string(),
    title: z.string().optional(),
    description: z.string().optional(),
    type: z.string().optional(),
    fieldKey: z.string(),
    fieldRequired: z.boolean().optional(),
    minCharacters: z.string().optional(),
    maxCharacters: z.string().optional(),
    variant: z.string().optional(),
    multiple: z.boolean().optional(),
    images: z
        .array(z.object({ image: z.any().optional(), src: z.string() }))
        .optional(),
    options: z
        .array(
            z.object({
                trigger: z.string(),
                titles: z.array(z.object({ text: z.string(), key: z.string() })),
                images: z
                    .array(z.object({ image: z.any().optional(), src: z.string() }))
                    .optional(),
            })
        )
        .optional(),
});

export default function WidgetResourceFormItems(
    props: ResourceFormWidgetProps & EditFieldProps<ResourceFormWidgetProps>
) {
    type FormData = z.infer<typeof formSchema>;
    const [items, setItems] = useState<Item[]>([]);
    const [options, setOptions] = useState<Option[]>([]);
    const [selectedItem, setItem] = useState<Item | null>(null);
    const [selectedOption, setOption] = useState<Option | null>(null);
    const [settingOptions, setSettingOptions] = useState<boolean>(false);
    const [file, setFile] = useState<File>();

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
                            : 1
                    }`,
                    title: values.title,
                    description: values.description,
                    type: values.type,
                    fieldKey: values.fieldKey,
                    fieldRequired: values.fieldRequired || false,
                    minCharacters: values.minCharacters,
                    maxCharacters: values.maxCharacters,
                    variant: values.variant,
                    multiple: values.multiple || false,
                    options: values.options || [],
                },
            ]);
        }
        form.reset(defaults);
        setOptions([]);
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
                            images:
                                values.options?.find((o) => o.trigger === option.trigger)
                                    ?.images || [],
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
                images: values.options?.[values.options.length - 1].images || [],
            };
            setOptions((currentOptions) => [...currentOptions, newOption]);
        }
    }

    const defaults = () => ({
        trigger: '0',
        title: '',
        description: '',
        type: '',
        fieldKey: '',
        fieldRequired: true,
        minCharacters: '',
        maxCharacters: '',
        variant: 'text input',
        multiple: true,
        options: [],
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

    useEffect(() => {
        props.onFieldChanged('items', items);
    }, [items]);

    // Sets form to selected item values when item is selected
    useEffect(() => {
        if (selectedItem) {
            form.reset({
                trigger: selectedItem.trigger,
                title: selectedItem.title || '',
                description: selectedItem.description || '',
                type: selectedItem.type || '',
                options: selectedItem.options || [],
                fieldKey: selectedItem.fieldKey || '',
                fieldRequired: selectedItem.fieldRequired || false,
                minCharacters: selectedItem.minCharacters || '',
                maxCharacters: selectedItem.maxCharacters || '',
                variant: selectedItem.variant || '',
                multiple: selectedItem.multiple || false,
            });
            setOptions(selectedItem.options || []);
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
        console.log( items, props );
        props.updateConfig({ ...props, items });
    }

    const hasOptions = () => {
        switch (form.watch('type')) {
            case 'images':
                return true;
            case 'checkbox':
                return true;
            case 'radiobox':
                return true;
            default:
                return false;
        }
    };

    const hasList = () => {
        switch (form.watch('type')) {
            case 'checkbox':
                return true;
            case 'radiobox':
                return true;
            default:
                return false;
        }
    };

    function resetForm() {
        form.reset(defaults());
        setOptions([]);
        setItem(null);
    }

    function handleSaveOptions() {
        form.setValue('options', options);
        setSettingOptions(false);
    }

    return (
        <div>
            {/* <ImageUploader /> */}
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

                        {settingOptions ? (
                            <div className="p-6 bg-white rounded-md col-span-2 grid grid-cols-1 lg:grid-cols-2 gap-x-6">
                                <div className="flex flex-col justify-between">
                                    <div className="flex flex-col gap-y-2">
                                        <Heading size="xl">Antwoordopties</Heading>
                                        <Separator className="mt-2" />
                                        {form.watch('type') === 'images' && (
                                            <>
                                                <FormField
                                                    control={form.control}
                                                    name={`options.${options.length - 1}.images.0.image`}
                                                    render={({ field }) => (
                                                        <FormItem>
                                                            <FormLabel>Afbeelding 1</FormLabel>
                                                            <FormControl>
                                                                <Input
                                                                    type="file"
                                                                    {...field}
                                                                    onChange={(e) => setFile(e.target.files?.[0])}
                                                                />
                                                            </FormControl>
                                                            <FormMessage />
                                                        </FormItem>
                                                    )}
                                                />
                                                <FormField
                                                    control={form.control}
                                                    name={`options.${options.length - 1}.titles.0.key`}
                                                    render={({ field }) => (
                                                        <FormItem>
                                                            <FormLabel>Key afbeelding 1</FormLabel>
                                                            <Input {...field} />
                                                            <FormMessage />
                                                        </FormItem>
                                                    )}
                                                />
                                                <FormField
                                                    control={form.control}
                                                    name={`options.${options.length - 1}.titles.0.text`}
                                                    render={({ field }) => (
                                                        <FormItem>
                                                            <FormLabel>Titel afbeelding 1</FormLabel>
                                                            <Input {...field} />
                                                            <FormMessage />
                                                        </FormItem>
                                                    )}
                                                />
                                                <FormField
                                                    control={form.control}
                                                    name={`options.${options.length - 1}.images.1.image`}
                                                    render={({ field }) => (
                                                        <FormItem>
                                                            <FormLabel>Afbeelding 2</FormLabel>
                                                            <FormControl>
                                                                <Input
                                                                    type="file"
                                                                    {...field}
                                                                    onChange={(e) => setFile(e.target.files?.[0])} // Dit moet nog aangepast worden naar een array van files
                                                                />
                                                            </FormControl>
                                                            <FormMessage />
                                                        </FormItem>
                                                    )}
                                                />
                                                <FormField
                                                    control={form.control}
                                                    name={`options.${options.length - 1}.titles.1.key`}
                                                    render={({ field }) => (
                                                        <FormItem>
                                                            <FormLabel>Key afbeelding 2</FormLabel>
                                                            <Input {...field} />
                                                            <FormMessage />
                                                        </FormItem>
                                                    )}
                                                />
                                                <FormField
                                                    control={form.control}
                                                    name={`options.${options.length - 1}.titles.1.text`}
                                                    render={({ field }) => (
                                                        <FormItem>
                                                            <FormLabel>Titel afbeelding 2</FormLabel>
                                                            <Input {...field} />
                                                            <FormMessage />
                                                        </FormItem>
                                                    )}
                                                />
                                            </>
                                        )}
                                        {hasList() && (
                                            <>
                                                <FormField
                                                    control={form.control}
                                                    name={`options.${options.length - 1}.titles.0.key`}
                                                    render={({ field }) => (
                                                        <FormItem>
                                                            <FormLabel>Optie key</FormLabel>
                                                            <Input {...field} />
                                                            <FormMessage />
                                                        </FormItem>
                                                    )}
                                                />
                                                <FormField
                                                    control={form.control}
                                                    name={`options.${options.length - 1}.titles.0.text`}
                                                    render={({ field }) => (
                                                        <FormItem>
                                                            <FormLabel>Optie tekst</FormLabel>
                                                            <Input {...field} />
                                                            <FormMessage />
                                                        </FormItem>
                                                    )}
                                                />
                                            </>
                                        )}

                                        {/* <FormField
                          control={form.control}
                          name={`options.${options.length - 1}.key`}
                          render={({ field }) => (
                            <FormItem>
                              <FormLabel>Key</FormLabel>
                              <Input {...field} />
                              <FormMessage />
                            </FormItem>
                          )}
                        /> */}

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
                                                    setOption(null),
                                                    setOptions([]);
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
                                  {option?.titles?.[0].text}
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
                                    <Heading size="xl">Resource Formulier items</Heading>
                                    <Separator className="my-4" />
                                    <div className="w-full lg:w-2/3 flex flex-col gap-y-2">
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
                                                            <SelectItem value="none">Geen antwoordopties</SelectItem>
                                                            {/*<SelectItem value="images">Twee antwoordopties met afbeeldingen</SelectItem>*/}
                                                            <SelectItem value="radiobox">Radio buttons</SelectItem>
                                                            <SelectItem value="text">Tekstveld</SelectItem>
                                                            <SelectItem value="checkbox">Checkboxes</SelectItem>
                                                            {/*<SelectItem value="scale">Schaal</SelectItem>*/}
                                                            <SelectItem value="map">Locatie</SelectItem>
                                                            <SelectItem value="upload">Afbeelding upload</SelectItem>
                                                        </SelectContent>
                                                    </Select>
                                                    <FormMessage />
                                                </FormItem>
                                            )}
                                        />
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
                                            name="fieldKey"
                                            render={({ field }) => (
                                                <FormItem>
                                                    <FormLabel>Key voor het opslaan, deze moet uniek zijn bijvoorbeeld: ‘samenvatting’
                                                    </FormLabel>
                                                    <Input {...field} />
                                                    <FormMessage />
                                                </FormItem>
                                            )}
                                        />
                                        <FormField
                                            control={form.control}
                                            name="fieldRequired"
                                            render={({ field }) => (
                                                <FormItem>
                                                    <FormLabel>Is dit veld verplicht?</FormLabel>
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
                                        {form.watch('type') === 'text' && (
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

                                        {form.watch('type') === 'upload' && (
                                            <FormField
                                                control={form.control}
                                                name="multiple"
                                                render={({ field }) => (
                                                    <FormItem>
                                                        <FormLabel>Mogen er meerdere afbeeldingen tegelijkertijd geüpload worden?</FormLabel>
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

                                        {hasOptions() && (
                                            <FormItem>
                                                <Button
                                                    className="w-fit mt-4 bg-secondary text-black hover:text-white"
                                                    type="button"
                                                    onClick={() => setSettingOptions(!settingOptions)}>
                                                    {`Antwoordopties (${options.length}) aanpassen`}
                                                </Button>
                                                <FormMessage />
                                            </FormItem>
                                        )}
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
