import { Button } from '@/components/ui/button';
import {
  Form,
  FormControl, FormDescription,
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
import {Select, SelectContent, SelectItem, SelectTrigger, SelectValue} from "@/components/ui/select";

const formSchema = z.object({
    addCommentText: z.string().optional(),
    addMarkerText: z.string().optional(),
    submitCommentText: z.string().optional(),
    displayResourceInfo: z.string().optional(),
    displayResourceDescription: z.string().optional(),
    displayMapSide: z.string().optional(),
    infoPopupContent: z.string().optional(),
    emptyListText: z.string().optional(),
    loginText: z.string().optional(),
    closedText: z.string().optional(),
    largeDoc: z.boolean().optional(),
    infoPopupButtonText: z.string().optional(),
    openInfoPopupOnInit: z.string().optional(),
    relativePathPrepend: z.string().optional(),
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
            submitCommentText: props?.submitCommentText || 'Versturen',
            displayResourceInfo: props?.displayResourceInfo || 'left',
            displayMapSide: props?.displayMapSide || 'left',
            displayResourceDescription: props?.displayResourceDescription || 'no',
            openInfoPopupOnInit: props?.openInfoPopupOnInit || 'no',
            infoPopupContent: props?.infoPopupContent || 'Op deze afbeelding kun je opmerkingen plaatsen. Klik op de afbeelding om een opmerking toe te voegen. Klik op een marker om de bijbehorende opmerkingen te bekijken.',
            emptyListText: props?.emptyListText || 'Nog geen reacties geplaatst',
            loginText: props?.loginText || 'Inloggen om deel te nemen aan de discussie',
            closedText: props?.closedText || 'Het insturen van reacties is gesloten, u kunt niet meer reageren',
            largeDoc: props?.largeDoc || false,
            infoPopupButtonText: props?.infoPopupButtonText || '',
            relativePathPrepend: props?.relativePathPrepend || '',
        },
    });

    return (
        <div className="p-6 bg-white rounded-md">
            <Form {...form}>
                <Heading size="xl">Extra Velden</Heading>
                <Separator className="my-4" />
                <form
                    onSubmit={form.handleSubmit(onSubmit)}
                    className="lg:w-full grid grid-cols-1 gap-4"
                >
                    <Heading size="lg" className="mt-4 mb-2">Reactie Gerelateerd</Heading>

                    <FormField
                        control={form.control}
                        name="addCommentText"
                        render={({ field }) => (
                            <FormItem>
                                <FormLabel>
                                    Als de gebruiker een reactie kan toevoegen, wat is de tekst die boven het veld staat?
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
                        name="submitCommentText"
                        render={({ field }) => (
                            <FormItem>
                                <FormLabel>
                                    Wat is de tekst in de knop voor het insturen van een reactie?
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
                        name="closedText"
                        render={({ field }) => (
                            <FormItem>
                                <FormLabel>
                                    Welke tekst wil je tonen wanneer het niet meer mogelijk is om te reageren?
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
                                    Wat is de tekst in de knop voor het insturen van een reactie?
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
                        name="emptyListText"
                        render={({ field }) => (
                            <FormItem>
                                <FormLabel>
                                    Wat is de tekst bij het reactie overzicht wanneer er nog geen reacties zijn?
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
                        name="loginText"
                        render={({ field }) => (
                            <FormItem>
                                <FormLabel>
                                    Wat is de tekst bij het reactie overzicht wanneer je niet bent ingelogd?
                                </FormLabel>
                                <FormControl>
                                    <Input {...field} />
                                </FormControl>
                                <FormMessage />
                            </FormItem>
                        )}
                    />

                    <Heading size="lg" className="mt-8 mb-2">Marker Gerelateerd</Heading>

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

                    <Heading size="lg" className="mt-8 mb-2">Resource Informatie</Heading>

                    <FormField
                        control={form.control}
                        name="displayResourceInfo"
                        render={({ field }) => (
                            <FormItem>
                                <FormLabel>
                                    Aan welke kant wil je de info van de resource tonen?
                                </FormLabel>
                                <Select
                                    onValueChange={field.onChange}
                                    value={field.value || 'left'}
                                >
                                    <FormControl>
                                        <SelectTrigger>
                                            <SelectValue placeholder="Links" />
                                        </SelectTrigger>
                                    </FormControl>
                                    <SelectContent>
                                        <SelectItem value="left">
                                            <strong>Links</strong>: Aan de linkerkant zal de info boven de kaart getoond worden
                                        </SelectItem>
                                        <SelectItem value="right">
                                            <strong>Rechts</strong>: Aan de rechterkant zal de info boven de reacties getoond worden
                                        </SelectItem>
                                    </SelectContent>
                                </Select>
                                <FormMessage />
                            </FormItem>
                        )}
                    />

                    <FormField
                        control={form.control}
                        name="displayResourceDescription"
                        render={({ field }) => (
                            <FormItem>
                                <FormLabel>
                                    Wil je de beschrijving van de resource tonen?
                                </FormLabel>
                                <Select
                                    onValueChange={field.onChange}
                                    value={field.value || 'no'}
                                >
                                    <FormControl>
                                        <SelectTrigger>
                                            <SelectValue placeholder="no" />
                                        </SelectTrigger>
                                    </FormControl>
                                    <SelectContent>
                                        <SelectItem value="no">Nee</SelectItem>
                                        <SelectItem value="yes">Ja</SelectItem>
                                    </SelectContent>
                                </Select>
                                <FormMessage />
                            </FormItem>
                        )}
                    />

                    <Heading size="lg" className="mt-8 mb-2">Map Instellingen</Heading>

                    <FormField
                        control={form.control}
                        name="displayMapSide"
                        render={({ field }) => (
                            <FormItem>
                                <FormLabel>
                                    Aan welke kant wil je de map tonen?
                                </FormLabel>
                                <Select
                                    onValueChange={field.onChange}
                                    value={field.value || 'left'}
                                >
                                    <FormControl>
                                        <SelectTrigger>
                                            <SelectValue placeholder="Links" />
                                        </SelectTrigger>
                                    </FormControl>
                                    <SelectContent>
                                        <SelectItem value="left">Links</SelectItem>
                                        <SelectItem value="right">Rechts</SelectItem>
                                    </SelectContent>
                                </Select>
                                <FormMessage />
                            </FormItem>
                        )}
                    />

                    <Heading size="lg" className="mt-8 mb-2">Pop-up Info</Heading>

                    <FormField
                        control={form.control}
                        name="openInfoPopupOnInit"
                        render={({ field }) => (
                            <FormItem>
                                <FormLabel>
                                    Wil je dat de info pop-up standaard open staat wanneer de widget wordt ingeladen?
                                </FormLabel>
                                <Select
                                    onValueChange={field.onChange}
                                    value={field.value || 'no'}
                                >
                                    <FormControl>
                                        <SelectTrigger>
                                            <SelectValue placeholder="Nee" />
                                        </SelectTrigger>
                                    </FormControl>
                                    <SelectContent>
                                        <SelectItem value="no">Nee</SelectItem>
                                        <SelectItem value="yes">Ja</SelectItem>
                                    </SelectContent>
                                </Select>
                                <FormMessage />
                            </FormItem>
                        )}
                    />

                    <FormField
                        control={form.control}
                        name="infoPopupContent"
                        render={({ field }) => (
                            <FormItem>
                                <FormLabel>
                                    Wat is de helptekst die in de info pop-up staat?
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
                        name="infoPopupButtonText"
                        render={({ field }) => (
                            <FormItem>
                                <FormLabel>
                                    Wat is de tekst voor de knop die de info pop-up opent?
                                </FormLabel>
                                <FormControl>
                                    <Input {...field} />
                                </FormControl>
                                <FormMessage />
                            </FormItem>
                        )}
                    />

                    <Heading size="lg" className="mt-8 mb-2">Doorverwijzing</Heading>

                    <FormField
                        control={form.control}
                        name="relativePathPrepend"
                        render={({ field }) => (
                            <FormItem>
                                <FormLabel>
                                    Relatief pad naar document
                                </FormLabel>
                              <FormDescription>
                                Mist er een gedeelte van de URL? Voeg het hier toe (Bijvoorbeeld: /projecten).
                                Dit wordt gebruikt bij het doorverwijzen naar de inzending.
                                Dit is vooral belangrijk als de homepagina een &quot;/&quot; bevat, zoals bijvoorbeeld https://openstad.nl/projecten
                              </FormDescription>
                                <FormControl>
                                    <Input {...field} />
                                </FormControl>
                                <FormMessage />
                            </FormItem>
                        )}
                    />

                    <Button className="w-fit col-span-full mt-8" type="submit">
                        Opslaan
                    </Button>
                </form>
            </Form>
        </div>
    );
}