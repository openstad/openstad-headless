import { Button } from '@/components/ui/button';
import {
    Form,
    FormControl,
    FormField,
    FormItem,
    FormLabel, FormMessage,
} from '@/components/ui/form';
import { Input } from '@/components/ui/input';

import { Separator } from '@/components/ui/separator';
import { Heading } from '@/components/ui/typography';
import { EditFieldProps } from '@/lib/form-widget-helpers/EditFieldProps';
import { zodResolver } from '@hookform/resolvers/zod';
import { useForm } from 'react-hook-form';
import * as z from 'zod';
import { DocumentMapProps } from '@openstad-headless/document-map/src/document-map';
import * as React from "react";

const formSchema = z.object({
    addCommentText: z.string().optional(),
    addMarkerText: z.string().optional(),
});

export default function DocumentContent(
    props: DocumentMapProps &
        EditFieldProps<DocumentMapProps>,
) {
    type FormData = z.infer<typeof formSchema>;

    async function onSubmit(values: FormData) {
        props.updateConfig({ ...props, ...values });
    }

    const form = useForm<FormData>({
        resolver: zodResolver<any>(formSchema),
        defaultValues: {
            addCommentText: props?.addCommentText || 'Voeg een opmerking toe',
            addMarkerText: props?.addMarkerText || 'Toon markers',
        },
    });

    return (
        <div className="p-6 bg-white rounded-md">
            <Form {...form}>
                <Heading size="xl">Extra Velden</Heading>
                <Separator className="my-4" />
                <form
                    onSubmit={form.handleSubmit(onSubmit)}
                    className="lg:w-full grid grid-cols-1 gap-4">

                    <FormField
                        control={form.control}
                        name="addCommentText"
                        render={({ field }) => (
                            <FormItem>
                                <FormLabel>
                                    Als de gebruiker een reactie kan toevoegen, wat is de tekst die boven het veld staan?
                                </FormLabel>
                                <FormControl>
                                    <Input {...field} />
                                </FormControl>
                                <FormMessage />
                            </FormItem>
                        )}
                    />

                    <FormField
                        control={form.control}
                        name="addMarkerText"
                        render={({ field }) => (
                            <FormItem>
                                <FormLabel>
                                    De gebruiker kan de markers aan- of uitzetten. Wat is de tekst van de knop?
                                </FormLabel>
                                <FormControl>
                                    <Input {...field} />
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