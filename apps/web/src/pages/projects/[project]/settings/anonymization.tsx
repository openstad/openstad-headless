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
import { Card, CardContent, CardHeader, CardTitle } from '@/components/ui/card'
import { Heading } from '@/components/ui/typography'
import { useEffect } from 'react'
import { useRouter } from 'next/router'
import { useProject } from '../../../../hooks/use-project'
import { Textarea } from '@/components/ui/textarea'

const formSchema = z.object({
    anonymizeUsersXDaysAfterEndDate: z.coerce.number(),
    warnUsersAfterXDaysOfInactivity: z.coerce.number(),
    anonymizeUsersAfterXDaysOfInactivity: z.coerce.number()
})

const emailFormSchema = z.object({
    subject: z.string(),
    template: z.string()
})

export default function ProjectSettingsAnonymization() {
    const category = 'anonymize';

    const router = useRouter();
    const { project } = router.query;
    const { data, isLoading, updateProject, updateProjectEmails, anonymizeUsersOfProject } = useProject();
    const defaults = () => ({
        anonymizeUsersXDaysAfterEndDate: data?.config?.[category]?.anonymizeUsersXDaysAfterEndDate || null,
        warnUsersAfterXDaysOfInactivity: data?.config?.[category]?.warnUsersAfterXDaysOfInactivity || null,
        anonymizeUsersAfterXDaysOfInactivity: data?.config?.[category]?.anonymizeUsersAfterXDaysOfInactivity || null,
    })

    const emailDefaults = () => ({
        subject: data?.emailConfig?.[category]?.inactiveWarningEmail?.subject || null,
        template: data?.emailConfig?.[category]?.inactiveWarningEmail?.template || null,
    })

    const form = useForm<z.infer<typeof formSchema>>({
        resolver: zodResolver<any>(formSchema),
        defaultValues: defaults()
    })

    const emailForm = useForm<z.infer<typeof emailFormSchema>>({
        resolver: zodResolver<any>(emailFormSchema),
        defaultValues: emailDefaults()
    })

    useEffect(() => {
        form.reset(defaults()),
        emailForm.reset(emailDefaults())
    }, [data])

    async function onSubmit(values: z.infer<typeof formSchema>) {
        try {
            await updateProject({ 
                [category]: values})
        } catch (error) {
         console.error('Could not update', error)   
        }
    }

    async function onSubmitEmail(values: z.infer<typeof emailFormSchema>) {
        try {
            await updateProjectEmails({ 
                [category]: {
                    inactiveWarningEmail: {
                        subject: values.subject,
                        template: values.template
                    }
                }});
        } catch (error) {
         console.error('Could not update', error)   
        }
    }

    async function anonymizeAllUsers() {
        try {
            await anonymizeUsersOfProject();
        } catch (error) {
            console.error('Could not anonymize the users', error)
        }
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
                    url: `/projects/${project}/settings`
                },
                {
                    name: 'Anonimizatie',
                    url: `/projects/${project}/settings/anonymization`
                }
            ]}>
            <div className="container mx-auto py-10 w-1/2 float-left divide-y">
                <div>
                    <p>Anonimiseer gebruikers direct</p>
                    <p>Let op! Deze actie is definitief en kan niet ongedaan gemaakt worden.</p>
                    <p>{`Het project moet eerst aangemerkt staan als 'beëindigd' voordat deze actie uitgevoerd kan worden.`}</p>
                    <Button variant={"destructive"} className='mt-4' onClick={() => {anonymizeAllUsers()}}>Gebruikersgegevens anonimiseren</Button>
                </div>
                  <br/>  
                  <Form {...form}>
                    <Heading size="xl" className="mb-4 mt-4">
                        Instellingen • Anonimisatie
                    </Heading>
                    <form onSubmit={form.handleSubmit(onSubmit)} className="space-y-4">
                        <FormField
                        control={form.control}
                        name="anonymizeUsersXDaysAfterEndDate"
                        render={({ field }) => (
                            <FormItem>
                                <FormLabel>Anonimiseer gebruikers x dagen na het einde van het project</FormLabel>
                                <FormControl>
                                    <Input placeholder='60' {...field} />
                                </FormControl>
                                <FormMessage />
                            </FormItem>
                        )}
                        />
                        <FormField
                        control={form.control}
                        name="warnUsersAfterXDaysOfInactivity"
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
                        name="anonymizeUsersAfterXDaysOfInactivity"
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
                    <Form {...emailForm}>
                        <form onSubmit={emailForm.handleSubmit(onSubmitEmail)} className="space-y-4">
                            <FormField
                            control={emailForm.control}
                            name="subject"
                            render={({ field }) => (
                                <FormItem>
                                    <FormLabel>Email onderwerp</FormLabel>
                                    <FormControl>
                                        <Input {...field} />
                                    </FormControl>
                                    <FormMessage />
                                </FormItem>
                            )}
                            />
                            <FormField
                            control={emailForm.control}
                            name="template"
                            render={({ field }) => (
                                <FormItem>
                                    <FormLabel>Email template</FormLabel>
                                    <FormControl>
                                        <Textarea {...field} />
                                    </FormControl>
                                    <FormMessage />
                                </FormItem>
                            )}
                            />
                            <Button type="submit" variant={"default"}>Opslaan</Button>
                        </form>
                        <br/>
                    </Form>
                    </CardContent>
                </Card>
            </div>
            </PageLayout>
        </div>
    )
}