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
import { Heading } from '@/components/ui/typography'
import { Separator } from '@/components/ui/separator'
import { useEffect } from 'react'
import { useRouter } from 'next/router'
import { useProject } from '../../../../hooks/use-project'

const formSchema = z.object({
    fromAddress: z.string().email(),
    projectmanagerAddress: z.string().email(),
})

export default function ProjectSettingsNotifications() {
    const category = 'notifications';

    const router = useRouter();
    const { project } = router.query;
    const { data, isLoading, updateProjectEmails } = useProject();
    const defaults = () => ({
        fromAddress: data?.emailConfig?.[category]?.fromAddress || null,
        projectmanagerAddress: data?.emailConfig?.[category]?.projectmanagerAddress || null,
    })

    const form = useForm<z.infer<typeof formSchema>>({
        resolver: zodResolver<any>(formSchema),
        defaultValues: defaults()
    })

    useEffect(() => {
        form.reset(defaults())
    }, [data])

    async function onSubmit(values: z.infer<typeof formSchema>) {
        try {
            await updateProjectEmails({ 
                [category]: {
                    fromAddress: values.fromAddress,
                    projectmanagerAddress: values.projectmanagerAddress
                }});
        } catch (error) {
         console.error('could not update', error)   
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
                    name: 'Administrator notificaties',
                    url: `'/projects/${project}/settings/notifications'`
                }
            ]}>
            <div className="container mx-auto py-10 w-1/2 float-left">
                <Form {...form}>
                    <Heading size="xl" className="mb-4">
                        Instellingen • Administrator notificaties
                    </Heading>
                    <Separator className="mb-4" />
                    <form onSubmit={form.handleSubmit(onSubmit)} className="space-y-4">
                        <FormField
                        control={form.control}
                        name="fromAddress"
                        render={({ field }) => (
                            <FormItem>
                                <FormLabel>Emailadres verstuurder</FormLabel>
                                <FormControl>
                                    <Input placeholder='' {...field} />
                                </FormControl>
                                <FormMessage />
                            </FormItem>
                        )}
                        />
                        <FormField
                        control={form.control}
                        name="projectmanagerAddress"
                        render={({ field }) => (
                            <FormItem>
                                <FormLabel>Emailadres project manager</FormLabel>
                                <FormControl>
                                    <Input placeholder='' {...field} />
                                </FormControl>
                                <FormMessage />
                            </FormItem>
                        )}
                        />
                        <Button type="submit" variant={"default"}>Opslaan</Button>
                    </form>
                    <br/>
                </Form>
                </div>
            </PageLayout>
        </div>
    )
}