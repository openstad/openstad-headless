import React from 'react'
import { PageLayout } from "../../../../../components/ui/page-layout"
import { Button } from '../../../../../components/ui/button'
import { Input } from '../../../../../components/ui/input'
import { Form, FormControl, FormField, FormItem, FormLabel, FormMessage } from "../../../../../components/ui/form"
import { Select, SelectContent, SelectItem, SelectTrigger, SelectValue } from "../../../../../components/ui/select";
import { zodResolver } from "@hookform/resolvers/zod";
import { useForm } from "react-hook-form";
import * as z from 'zod'
import { Heading } from '@/components/ui/typography'
import { Separator } from '@/components/ui/separator'

const formSchema = z.object({
    keuzewijzer: z.string(),
    questionsOnPage: z.number(),
    startHalfway: z.boolean(),
    preferences: z.enum(["standard", "minToPlus", "field", "none"]),
    display: z.enum(["16:9", "1:1"]),
    titlePreference: z.string(),
    titleNoPreference: z.string(),
    urlStartPage: z.string().url(),
    urlResultPage: z.string().url()
})

export default function WidgetKeuzewijzer() {
    const form = useForm<z.infer<typeof formSchema>>({
        resolver: zodResolver(formSchema),
        defaultValues: {
            questionsOnPage: 100,
            preferences: "standard",
            display: "16:9",
            titlePreference: "Jouw voorkeur is {preferredChoice}.",
            titleNoPreference: "Je hebt nog geen keuze gemaakt."
        }
    })

    function onSubmit(values: z.infer<typeof formSchema>) {
        console.log(values)
    }

    return(
        <div>
            <PageLayout
            pageHeader='Project naam'
            breadcrumbs={[
                {
                    name: "Projecten",
                    url: "/projects"
                },
                {
                    name: "Widgets",
                    url: "/projects/1/widgets"
                },
                {
                    name: "Keuzewijzer",
                    url: "/projects/1/widgets/keuzewijzer"
                }
            ]}
            >
                <div>
                    <div className='p-4 w-1/2'>
                        <Form {...form}>
                            <Heading size="xl" className="mb-4">
                                Keuzewijzer • Instellingen
                            </Heading>
                            <Separator className="mb-4" />
                            <form
                            onSubmit={form.handleSubmit(onSubmit)}
                            className='space-y-8'
                            >
                                <FormField
                                control={form.control}
                                name="keuzewijzer"
                                render={({ field }) => (
                                    <FormItem>
                                        <FormLabel>
                                            Kies de keuzewijzer:
                                        </FormLabel>
                                        <Select
                                        onValueChange={field.onChange}
                                        defaultValue={field.value}
                                        >
                                            <FormControl>
                                                <SelectTrigger>
                                                    <SelectValue />
                                                </SelectTrigger>
                                            </FormControl>
                                            <SelectContent>
                                            </SelectContent>
                                        </Select>
                                    </FormItem>
                                )}
                                />
                                <FormField
                                control={form.control}
                                name="questionsOnPage"
                                render={({ field }) => (
                                    <FormItem>
                                        <FormLabel>
                                            Aantal vragen per pagina:
                                        </FormLabel>
                                        <FormControl>
                                            <Input {...field}/>
                                        </FormControl>
                                    </FormItem>
                                )}
                                />
                                <FormField
                                control={form.control}
                                name="startHalfway"
                                render={({ field }) => (
                                    <FormItem>
                                        <FormLabel>
                                            Begin met alle vragen beantwoord op 50%?
                                        </FormLabel>
                                        <Select
                                        onValueChange={field.onChange}
                                        defaultValue={field.value}
                                        >
                                            <FormControl>
                                                <SelectTrigger>
                                                    <SelectValue placeholder="Nee"/>
                                                </SelectTrigger>
                                            </FormControl>
                                            <SelectContent>
                                                <SelectItem value="Yes">Ja</SelectItem>
                                                <SelectItem value="No">Nee</SelectItem>
                                            </SelectContent>
                                        </Select>
                                    </FormItem>
                                )}
                                />
                                <FormField
                                control={form.control}
                                name="preferences"
                                render={({ field }) => (
                                    <FormItem>
                                        <FormLabel>
                                            Weergave van de voorkeuren:
                                        </FormLabel>
                                        <Select
                                        onValueChange={field.onChange}
                                        defaultValue={field.value}
                                        >
                                            <FormControl>
                                                <SelectTrigger>
                                                    <SelectValue placeholder="Standaard"/>
                                                </SelectTrigger>
                                            </FormControl>
                                            <SelectContent>
                                                <SelectItem value="standard">Standaard</SelectItem>
                                                <SelectItem value="minToPlus">Van min naar plus 100</SelectItem>
                                                <SelectItem value="field">In een vlak</SelectItem>
                                                <SelectItem value="none">Geen (Voorkeuren worden verborgen)</SelectItem>
                                            </SelectContent>
                                        </Select>
                                    </FormItem>
                                )}
                                />
                                <FormField
                                control={form.control}
                                name="display"
                                render={({ field }) => (
                                    <FormItem>
                                        <FormLabel>
                                            Aspect ratio van afbeeldingen:
                                        </FormLabel>
                                        <Select
                                        onValueChange={field.onChange}
                                        defaultValue={field.value}
                                        >
                                            <FormControl>
                                                <SelectTrigger>
                                                    <SelectValue placeholder="16:9"/>
                                                </SelectTrigger>
                                            </FormControl>
                                            <SelectContent>
                                                <SelectItem value="16:9">16:9</SelectItem>
                                                <SelectItem value="1:1">1:1</SelectItem>
                                            </SelectContent>
                                        </Select>
                                    </FormItem>
                                )}
                                />
                                <FormField
                                control={form.control}
                                name="titlePreference"
                                render={({ field }) => (
                                    <FormItem>
                                        <FormLabel>
                                            Titel boven de keuzes, met voorkeur:
                                        </FormLabel>
                                        <FormControl>
                                            <Input {...field}/>
                                        </FormControl>
                                    </FormItem>
                                )}
                                />
                                <FormField
                                control={form.control}
                                name="titleNoPreference"
                                render={({ field }) => (
                                    <FormItem>
                                        <FormLabel>
                                            Titel boven de keuzes, zonder voorkeur:
                                        </FormLabel>
                                        <FormControl>
                                            <Input {...field}/>
                                        </FormControl>
                                    </FormItem>
                                )}
                                />
                                <FormField
                                control={form.control}
                                name="urlStartPage"
                                render={({ field }) => (
                                    <FormItem>
                                        <FormLabel>
                                            URL van de inleidende pagina:
                                        </FormLabel>
                                        <FormControl>
                                            <Input {...field}/>
                                        </FormControl>
                                    </FormItem>
                                )}
                                />
                                <FormField
                                control={form.control}
                                name="urlResultPage"
                                render={({ field }) => (
                                    <FormItem>
                                        <FormLabel>
                                            URL van de resultaatspagina:
                                        </FormLabel>
                                        <FormControl>
                                            <Input {...field}/>
                                        </FormControl>
                                    </FormItem>
                                )}
                                />
                            </form>
                        </Form>
                    </div>
                    <div className="sticky bottom-0 py-4 bg-background border-t border-border flex flex-col">
                        <Button className="self-end" type="submit">
                            Opslaan
                        </Button>
                    </div>
                </div>
            </PageLayout>
        </div>
    )
}