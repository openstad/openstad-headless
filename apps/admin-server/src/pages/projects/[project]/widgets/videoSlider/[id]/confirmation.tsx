import { Button } from '@/components/ui/button';
import {
    Form,
    FormField,
    FormItem,
    FormLabel,
    FormMessage,
    FormDescription, FormControl,
} from '@/components/ui/form';
import { Separator } from '@/components/ui/separator';
import { Heading } from '@/components/ui/typography';
import { useWidgetConfig } from '@/hooks/use-widget-config';
import { zodResolver } from '@hookform/resolvers/zod';
import React, { useCallback, useEffect } from 'react';
import { useForm } from 'react-hook-form';
import * as z from 'zod';
import * as Switch from '@radix-ui/react-switch';
import {Input} from "@/components/ui/input";
import {Select, SelectContent, SelectItem, SelectTrigger, SelectValue} from "@/components/ui/select";

const formSchema = z.object({
    confirmationUser: z.boolean().optional(),
    confirmationAdmin: z.boolean().optional(),
    overwriteEmailAddress: z.string().optional(),
    userEmailAddress: z.string().optional(),
});

export default function WidgetEnqueteConfirmation() {
    type FormData = z.infer<typeof formSchema>;
    const category = 'confirmation';

    // TODO should use the passed props widget, this is the old way and is not advised
    const {
        data: widget,
        isLoading: isLoadingWidget,
        updateConfig,
    } = useWidgetConfig<any>();

    const defaults = useCallback(
        () => {
            const confirmationUser = widget?.config?.[category]?.confirmationUser !== null ? widget?.config?.[category]?.confirmationUser : true;
            const confirmationAdmin = widget?.config?.[category]?.confirmationAdmin !== null ? widget?.config?.[category]?.confirmationAdmin : true;
            const overwriteEmailAddress = widget?.config?.[category]?.overwriteEmailAddress !== null ? widget?.config?.[category]?.overwriteEmailAddress : '';
            const userEmailAddress = widget?.config?.[category]?.userEmailAddress !== null ? widget?.config?.[category]?.userEmailAddress : '';
            return { confirmationUser, confirmationAdmin, overwriteEmailAddress, userEmailAddress };
        },
        [widget?.config]
    );

    async function onSubmit(values: FormData) {
        try {
            await updateConfig({ [category]: values });
        } catch (error) {
            console.error('could not update', error);
        }
    }

    const form = useForm<FormData>({
        resolver: zodResolver<any>(formSchema),
        defaultValues: defaults(),
    });

    useEffect(() => {
        form.reset(defaults());
    }, [form, defaults]);

    const visibility = widget?.config?.formVisibility || 'always';
    const items = widget?.config?.items || [];

    const confirmationUserError = visibility === 'always' && (
        items.length === 0
            ? 'Je moet eerst velden aanmaken om dit te kunnen doen.'
            : !items.some((item: {questionType: string}) => item.questionType === 'open')
                ? 'Je moet eerst een tekstveld aanmaken om dit te kunnen doen.'
                : null
    );

    return (
        <div className="p-6 bg-white rounded-md">
            <Form {...form}>
                <Heading size="xl">Bevestiging</Heading>
                <Separator className="my-4" />
                <form
                    onSubmit={form.handleSubmit(onSubmit)}
                    className="lg:w-2/3 grid grid-cols-1 gap-4">
                    <FormField
                        control={form.control}
                        name="confirmationUser"
                        render={({ field }) => (
                            <FormItem>
                                <FormLabel>
                                    Krijgt de gebruiker een bevestiging per mail van zijn inzending?
                                </FormLabel>
                                <Switch.Root
                                    className="block w-[50px] h-[25px] bg-stone-300 rounded-full relative focus:shadow-[0_0_0_2px] focus:shadow-black data-[state=checked]:bg-primary outline-none cursor-default"
                                    onCheckedChange={(e: boolean) => {
                                        console.log('confirmationUserError', confirmationUserError);

                                        if (!confirmationUserError) {
                                            field.onChange(e);
                                        }
                                    }}
                                    disabled={!!confirmationUserError}
                                    checked={field.value && !confirmationUserError}>
                                    <Switch.Thumb className="block w-[21px] h-[21px] bg-white rounded-full transition-transform duration-100 translate-x-0.5 will-change-transform data-[state=checked]:translate-x-[27px]" />
                                </Switch.Root>
                                {confirmationUserError && (
                                    <FormMessage>{confirmationUserError}</FormMessage>
                                )}
                            </FormItem>
                        )}
                    />

                    {form.watch('confirmationUser') && visibility === 'always' && (
                        <FormField
                            control={form.control}
                            name="userEmailAddress"
                            render={({ field }) => (
                                <FormItem>
                                    <FormLabel>Welk veld moet er worden gebruikt voor de bevestiging naar de gebruiker</FormLabel>
                                    <FormDescription>
                                        In de &apos;Weergave&apos; opties is ingesteld dat je niet hoeft in te loggen om dit formulier te zien. Hierdoor kan iedereen het formulier invullen en is er geen e-mailadres van de gebruiker beschikbaar om de notificatie naartoe te sturen. Kies hier een veld uit het formulier dat gebruikt wordt om de bevestiging naar de gebruiker te sturen.
                                    </FormDescription>
                                    <Select
                                        value={field.value || ''}
                                        onValueChange={field.onChange}>
                                        <FormControl>
                                            <SelectTrigger>
                                                <SelectValue placeholder="Kies een veld" />
                                            </SelectTrigger>
                                        </FormControl>
                                        <SelectContent>
                                            {items
                                                .filter((item: {questionType: string}) => item.questionType === 'open')
                                                .map((item: {fieldKey: string, title: string}) => (
                                                    <SelectItem key={item.fieldKey} value={item.fieldKey}>
                                                        {item.title}
                                                    </SelectItem>
                                                ))}
                                        </SelectContent>
                                    </Select>
                                    <FormMessage />
                                </FormItem>
                            )}
                        />
                    )}

                    <FormField
                        control={form.control}
                        name="confirmationAdmin"
                        render={({ field }) => (
                            <FormItem>
                                <FormLabel>
                                    Krijgt de beheerder een bevestiging per mail bij een nieuwe inzending?
                                </FormLabel>
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

                    { form.watch('confirmationAdmin') && (
                        <FormField
                            control={form.control}
                            name="overwriteEmailAddress"
                            render={({ field }) => (
                                <FormItem>
                                    <FormLabel>Overschrijf het e-mailadres waar de bevesting naartoe wordt gestuurd</FormLabel>
                                    <FormDescription>
                                        De bevestiging gaat standaard naar de beheerder. Vul hier een ander e-mailadres in om dit te overschrijven. Meerdere e-mailadressen zijn mogelijk, mits ze gescheiden zijn met een komma.
                                    </FormDescription>
                                    <Input
                                        {...field}
                                    />
                                    <FormMessage />
                                </FormItem>
                            )}
                        />
                    )}
                    <Button className="w-fit col-span-full" type="submit">
                        Opslaan
                    </Button>
                </form>
            </Form>
        </div>
    );
}
