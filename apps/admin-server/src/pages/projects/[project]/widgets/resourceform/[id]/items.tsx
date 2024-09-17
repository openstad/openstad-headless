import { Button } from '@/components/ui/button';
import {
    Form,
    FormControl, FormDescription,
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
import { ArrowDown, ArrowUp, X } from 'lucide-react';
import React, { useEffect, useState } from 'react';
import { useForm } from 'react-hook-form';
import * as z from 'zod';
import { Item, Option, ResourceFormWidgetProps } from "@openstad-headless/resource-form/src/props";
import { defaultFormValues } from "@openstad-headless/resource-form/src/parts/default-values";
import useTags from "@/hooks/use-tags";
import { useRouter } from "next/router";
import InfoDialog from '@/components/ui/info-hover';
import { Checkbox } from "@/components/ui/checkbox";

const formSchema = z.object({
    trigger: z.string(),
    fieldType: z.string(),
    title: z.string().optional(),
    description: z.string().optional(),
    type: z.string().optional(),
    tags: z.string().optional(),
    fieldKey: z.string(),
    fieldRequired: z.boolean().optional(),
    onlyForModerator: z.boolean().optional(),
    minCharacters: z.string().optional(),
    maxCharacters: z.string().optional(),
    variant: z.string().optional(),
    multiple: z.boolean().optional(),
    placeholder: z.string().optional(),
    images: z
        .array(z.object({ image: z.any().optional(), src: z.string() }))
        .optional(),
    options: z
        .array(
            z.object({
                trigger: z.string(),
                titles: z.array(z.object({ text: z.string(), key: z.string(), isOtherOption: z.boolean().optional() })),
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
    const [isFieldKeyUnique, setIsFieldKeyUnique] = useState(true);

    const router = useRouter();
    const { project } = router.query;

    const { data: allTags } = useTags(project as string);
    const firstTagType = allTags?.[0]?.type ?? '';

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
                    description: values.description,
                    placeholder: values.placeholder,
                    type: values.type,
                    tags: values.tags || firstTagType,
                    fieldType: values.fieldType,
                    fieldKey: values.fieldKey || '',
                    fieldRequired: values.fieldRequired || false,
                    onlyForModerator: values.onlyForModerator || false,
                    minCharacters: values.minCharacters,
                    maxCharacters: values.maxCharacters,
                    variant: values.variant || 'text input',
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
                trigger: `${options.length > 0
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
        placeholder: '',
        type: '',
        tags: firstTagType,
        fieldType: '',
        fieldKey: '',
        fieldRequired: false,
        onlyForModerator: false,
        minCharacters: '',
        maxCharacters: '',
        variant: 'text input',
        multiple: false,
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
                type: selectedItem.type || '',
                tags: selectedItem.tags || firstTagType,
                fieldType: selectedItem.fieldType || '',
                options: selectedItem.options || [],
                fieldKey: selectedItem.fieldKey || '',
                fieldRequired: selectedItem.fieldRequired || false,
                onlyForModerator: selectedItem.onlyForModerator || false,
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
        console.log(items, props);
        props.updateConfig({ ...props, items });
    }

    const hasOptions = () => {
        switch (form.watch('type')) {
            case 'checkbox':
            case 'select':
            case 'radiobox':
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

    useEffect(() => {
        const defaultFormItem = defaultFormValues.find((item) => item.type === form.watch('type'));

        if (defaultFormItem) {
            if (form.watch('fieldKey') === '') {
                form.setValue('fieldKey', defaultFormItem.fieldKey || '');
            }
            if (form.watch('title') === '') {
                form.setValue('title', defaultFormItem.title || '');
            }
            if (form.watch('description') === '') {
                form.setValue('description', defaultFormItem.description || '');
            }
            if (form.watch('fieldType') === '') {
                form.setValue('fieldType', defaultFormItem.fieldType || '');
            }

            if (defaultFormItem.fieldType === 'text') {
                const variant = (defaultFormItem.type === 'summary' || defaultFormItem.type === 'description') ? 'textarea' : 'text input';
                form.setValue('variant', variant);
            }
        } else if (form.watch("type") === 'documentUpload' || form.watch("type") === 'imageUpload') {
            const recommendedFieldKey =
                form.watch("type") === 'documentUpload'
                    ? 'documents'
                    : (
                        form.watch("type") === 'imageUpload'
                            ? 'images'
                            : ''
                    );

            form.setValue('fieldKey', recommendedFieldKey);
        }
        // eslint-disable-next-line react-hooks/exhaustive-deps
    }, [form.watch("type")]);

    useEffect(() => {
        const key = form.watch("fieldKey");

        if (key) {
            const isUnique = items.every((item) =>
                (selectedItem && item.trigger === selectedItem.trigger) || item.fieldKey !== key
            );

            setIsFieldKeyUnique(isUnique);
        }
    }, [form.watch("fieldKey"), selectedItem]);

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

                        {settingOptions ? (
                            <div className="p-6 bg-white rounded-md col-span-2 grid grid-cols-1 lg:grid-cols-2 gap-x-6">
                                <div className="flex flex-col justify-between">
                                    <div className="flex flex-col gap-y-2">
                                        <Heading size="xl">Antwoordopties</Heading>
                                        <Separator className="mt-2" />
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

                                                <FormField
                                                    control={form.control}
                                                    // @ts-ignore
                                                    name={`options.${options.length - 1}.isOtherOption`}
                                                    render={({ field }) => (
                                                        <>
                                                            <FormItem
                                                                style={{ display: 'flex', alignItems: 'center', justifyContent: 'flex-start', flexDirection: 'row', marginTop: '10px' }}>
                                                                <Checkbox
                                                                    onCheckedChange={(checked: boolean) => {
                                                                        form.setValue(`options.${options.length - 1}.titles.0.isOtherOption`, checked);
                                                                    }}
                                                                />
                                                                <FormLabel
                                                                    style={{ marginTop: 0, marginLeft: '6px' }}>Is &apos;Anders, namelijk...&apos;</FormLabel>
                                                                <FormMessage />
                                                            </FormItem>
                                                            <FormDescription>
                                                                Als je deze optie selecteert, wordt er automatisch een tekstveld toegevoegd aan het formulier.
                                                                Het tekstveld wordt zichtbaar wanneer deze optie wordt geselecteerd.
                                                            </FormDescription>
                                                        </>
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
                                                            className={`flex cursor-pointer justify-between border border-secondary ${option.trigger == selectedOption?.trigger &&
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
                                                            <SelectItem value="none">Informatie blok</SelectItem>
                                                            <SelectItem value="radiobox">Radio buttons</SelectItem>
                                                            <SelectItem value="text">Tekstveld</SelectItem>
                                                            <SelectItem value="checkbox">Checkboxes</SelectItem>
                                                            <SelectItem value="map">Locatie</SelectItem>
                                                            <SelectItem value="imageUpload">Afbeelding upload</SelectItem>
                                                            <SelectItem value="documentUpload">Document upload</SelectItem>
                                                            <SelectItem value="select">Dropdown</SelectItem>

                                                            <SelectItem value="title">Resource: Titel</SelectItem>
                                                            <SelectItem value="summary">Resource: Samenvatting</SelectItem>
                                                            <SelectItem value="description">Resource: Beschrijving</SelectItem>
                                                            <SelectItem value="images">Resource: Uploaden afbeeldingen</SelectItem>
                                                            <SelectItem value="tags">Resource: Tags</SelectItem>
                                                            <SelectItem value="location">Resource: Locatie</SelectItem>
                                                            <SelectItem value="estimate">Resource: Geschatte kosten</SelectItem>
                                                            <SelectItem value="role">Resource: Rol</SelectItem>
                                                            <SelectItem value="phone">Resource: Telefoonnummer</SelectItem>
                                                            <SelectItem value="advice">Resource: Tips</SelectItem>
                                                            <SelectItem value="budget">Resource: Budget</SelectItem>

                                                        </SelectContent>
                                                    </Select>
                                                    <FormMessage />
                                                </FormItem>
                                            )}></FormField>
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
                                            name="fieldType"
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

                                        {form.watch('type') === 'title' && (
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
                                        )}
                                        {form.watch('type') !== 'none' && (
                                            <FormField
                                                control={form.control}
                                                name="fieldKey"
                                                render={({ field }) => {
                                                    const nonStaticType = ['none', 'radiobox', 'text', 'checkbox', 'map', 'imageUpload', 'documentUpload', 'select'];
                                                    const type = form.watch('type');
                                                    const fieldKey = !nonStaticType.includes(type || '') ? type : '';

                                                    return (
                                                        <FormItem>
                                                            <FormLabel>Key voor het opslaan</FormLabel>
                                                            <em className='text-xs'>Deze moet uniek zijn bijvoorbeeld: ‘samenvatting’</em>

                                                            <Input {...field} disabled={!!fieldKey} />
                                                            {(!field.value || !isFieldKeyUnique) && (
                                                                <FormMessage>
                                                                    {!field.value ? 'Key is verplicht' : 'Key moet uniek zijn'}
                                                                </FormMessage>
                                                            )}
                                                        </FormItem>
                                                    )
                                                }}
                                            />
                                        )}
                                        {form.watch('type') === 'tags' && (
                                            <>
                                                <FormField
                                                    control={form.control}
                                                    name="tags"
                                                    render={({ field }) => {
                                                        if (form.watch('fieldKey') !== `tags[${field.value || firstTagType}]`) {
                                                            form.setValue('fieldKey', `tags[${field.value || firstTagType}]`)
                                                        }

                                                        if (!allTags || allTags.length === 0) {
                                                            return <p style={{ fontSize: '14px', margin: '20px 0', color: 'red' }}><strong>Geen tags gevonden om te selecteren. Maak dit aan onder het kopje &apos;Tags&apos;</strong></p>;
                                                        }

                                                        return (
                                                            <FormItem>
                                                                <FormLabel>Welk type tag moet als keuze in het formulier komen?</FormLabel>
                                                                <Select
                                                                    value={field.value || firstTagType}
                                                                    onValueChange={(value) => {
                                                                        field.onChange(value);
                                                                        form.setValue('fieldKey', `tags[${value || firstTagType}]`)
                                                                    }}>
                                                                    <SelectTrigger>
                                                                        <SelectValue />
                                                                    </SelectTrigger>
                                                                    <SelectContent>
                                                                        {allTags.reduce((uniqueTags: any[], tag: any) => {
                                                                            if (!uniqueTags.some((t) => t.type === tag.type)) {
                                                                                uniqueTags.push(tag);
                                                                            }
                                                                            return uniqueTags;
                                                                        }, []).map((tag: any) => (
                                                                            <SelectItem
                                                                                key={tag.id}
                                                                                value={tag.type}
                                                                            >
                                                                                {tag.type}
                                                                            </SelectItem>
                                                                        ))}
                                                                    </SelectContent>
                                                                </Select>
                                                                <FormMessage />
                                                            </FormItem>
                                                        )
                                                    }}
                                                />

                                                <FormField
                                                    control={form.control}
                                                    name="fieldType"
                                                    render={({ field }) => (
                                                        <FormItem>
                                                            <FormLabel>Hoe wil je de tags weergeven in het formulier?</FormLabel>
                                                            <FormDescription>De weergave heeft niet alleen invloed op het uiterlijk, maar ook op de werking. Met de keuze voor checkboxes sta je ook toe dat er meerdere tags gekozen kunnen worden.</FormDescription>
                                                            <Select
                                                                value={field.value}
                                                                onValueChange={field.onChange}
                                                            >
                                                                <FormControl>
                                                                    <SelectTrigger>
                                                                        <SelectValue placeholder="Kies type" />
                                                                    </SelectTrigger>
                                                                </FormControl>
                                                                <SelectContent>
                                                                    <SelectItem value="select">Dropdown</SelectItem>
                                                                    <SelectItem value="checkbox">Checkbox</SelectItem>
                                                                </SelectContent>
                                                            </Select>
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
                                                render={({ field }) => {
                                                    const staticType = ['title', 'summary', 'description'];
                                                    const type = form.watch('type');
                                                    const required = staticType.includes(type || '');

                                                    return (
                                                        <FormItem>
                                                            <FormLabel>
                                                                Is dit veld verplicht?
                                                                <InfoDialog content={'Voor de volgende types zijn deze velden altijd veplicht: Titel, Samenvatting en Beschrijving'} />
                                                            </FormLabel>
                                                            <Select
                                                                onValueChange={(e: string) => field.onChange(e === 'true')}
                                                                value={
                                                                    required
                                                                        ? 'true'
                                                                        : (field.value ? 'true' : 'false')
                                                                }
                                                                disabled={required}
                                                            >
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
                                                    )
                                                }}
                                            />
                                        )}
                                        {form.watch('fieldType') === 'text' || form.watch('type') === 'text' && (
                                            <>
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
                                                {form.watch('type') !== 'title' && form.watch('type') !== 'summary' && form.watch('type') !== 'description' && (
                                                    <>
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
                                            </>
                                        )}
                                        {(form.watch('type') === 'imageUpload' || form.watch('type') === 'documentUpload' || form.watch('type') === 'images') && (
                                            <FormField
                                                control={form.control}
                                                name="multiple"
                                                render={({ field }) => (
                                                    <FormItem>
                                                        <FormLabel>Mogen er meerdere {form.watch('type') === 'documentUpload' ? 'documenten' : 'afbeeldingen'} tegelijkertijd geüpload worden?</FormLabel>
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

                                        <FormField
                                            control={form.control}
                                            name="onlyForModerator"
                                            render={({ field }) => {
                                                const type = form.watch('type');

                                                return (
                                                    <FormItem>
                                                        <FormLabel>Is dit veld zichtbaar voor iedereen of alleen admin gebruikers?</FormLabel>
                                                        <Select
                                                            onValueChange={(e: string) => field.onChange(e === 'true')}
                                                            value={
                                                                type === 'budget'
                                                                    ? 'true'
                                                                    : (field.value ? 'true' : 'false')
                                                            }
                                                            disabled={type === 'budget'}
                                                        >
                                                            <FormControl>
                                                                <SelectTrigger>
                                                                    <SelectValue placeholder="Kies een optie" />
                                                                </SelectTrigger>
                                                            </FormControl>
                                                            <SelectContent>
                                                                <SelectItem value="false">Iedereen</SelectItem>
                                                                <SelectItem value="true">Alleen admin gebruikers</SelectItem>
                                                            </SelectContent>
                                                        </Select>
                                                        <FormMessage />
                                                    </FormItem>
                                                )
                                            }}
                                        />

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
                                            disabled={(form.watch('type') === 'tags' && allTags.length === 0) || ((!form.watch('fieldKey') || !isFieldKeyUnique) && form.watch('type') !== 'none')}
                                        >
                                            {selectedItem
                                                ? 'Sla wijzigingen op'
                                                : 'Voeg item toe aan lijst'}
                                        </Button>
                                    </div>
                                    {(!form.watch('fieldKey') || !isFieldKeyUnique) && (
                                        <FormMessage>
                                            {!form.watch('fieldKey') ? 'Key is verplicht' : 'Key moet uniek zijn'}
                                        </FormMessage>
                                    )}
                                </div>
                            </div>
                        )}
                    </div>
                </form>
            </Form>
        </div>
    );
}
