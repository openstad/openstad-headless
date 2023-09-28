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
import { PageLayout } from '@/components/ui/page-layout'
import { Select, SelectContent, SelectItem, SelectTrigger, SelectValue } from '@/components/ui/select'
import { Heading } from '@/components/ui/typography'
import { Separator } from '@/components/ui/separator'

const formSchema = z.object({
    isActive: z.boolean(),
})

export default function ProjectSettingsNewsletter() {
    const form = useForm<z.infer<typeof formSchema>>({
        resolver: zodResolver(formSchema),
        defaultValues: {
            isActive: false
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
                    name: 'Nieuwsbrief',
                    url: '/projects/1/settings/newsletter'
                }
            ]}>
            <div className="container mx-auto py-10 w-1/2 float-left">
                <Form {...form}>
                    <Heading size="xl" className="mb-4">
                        Instellingen • Nieuwsbrief
                    </Heading>
                    <Separator className="mb-4" />
                    <form onSubmit={form.handleSubmit(onSubmit)} className='space-y-8'>
                        <FormField
                            control={form.control}
                            name="isActive"
                            render={({ field }) => (
                                <FormItem>
                                    <FormLabel>Worden er nieuwsbriefen verstuurd?</FormLabel>
                                    <Select onValueChange={field.onChange} defaultValue={field.value}>
                                        <FormControl>
                                            <SelectTrigger>
                                                <SelectValue placeholder="Nee" />
                                            </SelectTrigger>
                                        </FormControl>
                                        <SelectContent>
                                            <SelectItem value={true}>Ja</SelectItem>
                                            <SelectItem value={false}>Nee</SelectItem>
                                        </SelectContent>
                                    </Select>
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