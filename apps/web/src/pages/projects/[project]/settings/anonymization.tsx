import * as React from 'react'
import { zodResolver } from '@hookform/resolvers/zod'
import * as z from 'zod'
import { useForm } from 'react-hook-form'

import { Button } from "@/components/ui/button"
import {
    Form,
    FormControl,
    FormField,
    FormItem,
    FormLabel,
    FormMessage
} from "@/components/ui/form"
import { Input } from "@/components/ui/input"
import { PageLayout } from '@/components/ui/page-layout'
import { Card, CardContent, CardFooter, CardHeader, CardTitle } from '@/components/ui/card'
import { Label } from '@/components/ui/label'
import { Textarea } from '@/components/ui/textarea'

const formSchema = z.object({
    daysAfterProjectEnd: z.number(),
    daysUntilWarning: z.number(),
    daysUntilAnonymization: z.number()
})

export default function ProjectSettingsAnonymization() {
    const form = useForm<z.infer<typeof formSchema>>({
        resolver: zodResolver(formSchema),
        defaultValues: {
            daysAfterProjectEnd: 60,
            daysUntilWarning: 180,
            daysUntilAnonymization: 200
        }
    })

    function onSubmit(values: z.infer<typeof formSchema>) {
        console.log(values)
    }

    return(
        <div>
            <PageLayout
            pageHeader="Projecten"
            breadcrumbs={[
                {
                    name: 'Projecten',
                    url: '/projects',
                },
                {
                    name: 'Instellingen',
                    url: '/projects/1/settings'
                },
                {
                    name: 'Anonimizatie',
                    url: '/projects/1/settings/anonymization'
                }
            ]}>
            <div className="container mx-auto py-10 w-1/2 float-left divide-y">
                <div>
                    <br/>
                    <p>Anonimiseer gebruikers direct</p>
                    <p>Let op! Deze actie is definitief en kan niet ongedaan gemaakt worden.</p>
                    <p>Het project moet eerst aangemerkt staan als 'beëindigd' voordat deze actie uitgevoerd kan worden.</p>
                    <br/>
                    <Button variant={"destructive"}>Gebruikersgegevens anonimiseren</Button>
                </div>
                <Form {...form}>
                    <form onSubmit={form.handleSubmit(onSubmit)} className='space-y-8'>
                        <FormField
                        control={form.control}
                        name="daysAfterProjectEnd"
                        render={({ field }) => (
                            <FormItem>
                                <FormLabel>Anonimizeer gebruikers x dagen na het einde van het project</FormLabel>
                                <FormControl>
                                    <Input placeholder='60' {...field} />
                                </FormControl>
                                <FormMessage />
                            </FormItem>
                        )}
                        />
                        <FormField
                        control={form.control}
                        name="daysUntilWarning"
                        render={({ field }) => (
                            <FormItem>
                                <FormLabel>Waarschuw gebruikers na x dagen aan inactiviteit</FormLabel>
                                <FormControl>
                                    <Input placeholder='180' {...field} />
                                </FormControl>
                                <FormMessage />
                            </FormItem>
                        )}
                        />
                        <FormField
                        control={form.control}
                        name="daysUntilAnonymization"
                        render={({ field }) => (
                            <FormItem>
                                <FormLabel>Anonimiseer gebruikers na x dagen aan inactiviteit</FormLabel>
                                <FormControl>
                                    <Input placeholder='200' {...field} />
                                </FormControl>
                                <FormMessage />
                            </FormItem>
                        )}
                        />
                        <Button type="submit" variant={"default"}>Opslaan</Button>
                    </form>
                    <br/>
                </Form>
                <Card>
                    <CardHeader>
                        <CardTitle>
                            Stel hier een email in voor gebruikers wiens account binnenkort verlopen.
                        </CardTitle>
                    </CardHeader>
                    <CardContent>
                        <form>
                            <div>
                                <div>
                                    <Label>Onderwerp:</Label>
                                    <Input id="subject" placeholder='Onderwerp van de mail' />
                                </div>
                                <div>
                                    <Label>Mail-template:</Label>
                                    <Textarea id="template" placeholder='Inhoud van de mail' />
                                </div>
                            </div>
                        </form>
                    </CardContent>
                    <CardFooter className="flex justify-between">
                        <Button variant={"default"}>Opslaan</Button>
                    </CardFooter>
                </Card>
            </div>
            </PageLayout>
        </div>
    )
}