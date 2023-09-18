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
import { Select, SelectContent, SelectItem, SelectTrigger, SelectValue } from '@/components/ui/select'

const formSchema = z.object({
    ideasAllowed: z.boolean(),
    minimumVotes: z.number().gt(0),
    minimumTitleLength: z.number().gt(0),
    maximumTitleLength: z.number().lt(201),
    minimumSummaryLength: z.number().gt(0),
    maximumSummaryLength: z.number().lt(1001),
    minimumDescriptionLength: z.number().gt(0),
    maximumDescriptionLength: z.number().lt(5001),
})

export default function ProjectSettingsIdeas() {
    const form = useForm<z.infer<typeof formSchema>>({
        resolver: zodResolver(formSchema),
        defaultValues: {
            ideasAllowed: true,
            minimumVotes: 50,
            minimumTitleLength: 1,
            maximumTitleLength: 150,
            minimumSummaryLength: 1,
            maximumSummaryLength: 1000,
            minimumDescriptionLength: 1,
            maximumDescriptionLength: 5000
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
                    name: 'Ideeën',
                    url: '/projects/1/settings/ideas'
                }
            ]}>
            <div className="container mx-auto py-10 w-1/2 float-left divide-y">
                <Form {...form}>
                    <form onSubmit={form.handleSubmit(onSubmit)} className='space-y-8'>
                        <FormField
                            control={form.control}
                            name="ideasAllowed"
                            render={({ field }) => (
                                <FormItem>
                                    <FormLabel>Is het mogelijk om een idee in te sturen?</FormLabel>
                                    <Select onValueChange={field.onChange} defaultValue={field.value}>
                                        <FormControl>
                                            <SelectTrigger>
                                                <SelectValue placeholder="Yes" />
                                            </SelectTrigger>
                                        </FormControl>
                                        <SelectContent>
                                            <SelectItem value={true}>Yes</SelectItem>
                                            <SelectItem value={false}>No</SelectItem>
                                        </SelectContent>
                                    </Select>
                                    <FormMessage />
                                </FormItem>
                            )}
                        />
                        <FormField
                        control={form.control}
                        name="minimumVotes"
                        render={({ field }) => (
                            <FormItem>
                                <FormLabel>Minimum benodigde stemmen voor een idee?</FormLabel>
                                <FormControl>
                                    <Input placeholder='50' {...field} />
                                </FormControl>
                                <FormMessage />
                            </FormItem>
                        )}
                        />
                        <FormField
                        control={form.control}
                        name="minimumTitleLength"
                        render={({ field }) => (
                            <FormItem>
                                <FormLabel>Minimum lengte van titel</FormLabel>
                                <FormControl>
                                    <Input placeholder='1' {...field} />
                                </FormControl>
                                <FormMessage />
                            </FormItem>
                        )}
                        />
                        <FormField
                        control={form.control}
                        name="maximumTitleLength"
                        render={({ field }) => (
                            <FormItem>
                                <FormLabel>Maximum lengte van titel</FormLabel>
                                <FormControl>
                                    <Input placeholder='150' {...field} />
                                </FormControl>
                                <FormMessage />
                            </FormItem>
                        )}
                        />
                        <FormField
                        control={form.control}
                        name="minimumSummaryLength"
                        render={({ field }) => (
                            <FormItem>
                                <FormLabel>Minimum lengte van samenvatting</FormLabel>
                                <FormControl>
                                    <Input placeholder='1' {...field} />
                                </FormControl>
                                <FormMessage />
                            </FormItem>
                        )}
                        />
                        <FormField
                        control={form.control}
                        name="maximumSummaryLength"
                        render={({ field }) => (
                            <FormItem>
                                <FormLabel>Minimum lengte van titel</FormLabel>
                                <FormControl>
                                    <Input placeholder='1000' {...field} />
                                </FormControl>
                                <FormMessage />
                            </FormItem>
                        )}
                        />
                        <FormField
                        control={form.control}
                        name="minimumDescriptionLength"
                        render={({ field }) => (
                            <FormItem>
                                <FormLabel>Minimum lengte van titel</FormLabel>
                                <FormControl>
                                    <Input placeholder='1' {...field} />
                                </FormControl>
                                <FormMessage />
                            </FormItem>
                        )}
                        />
                        <FormField
                        control={form.control}
                        name="maximumDescriptionLength"
                        render={({ field }) => (
                            <FormItem>
                                <FormLabel>Minimum lengte van titel</FormLabel>
                                <FormControl>
                                    <Input placeholder='5000' {...field} />
                                </FormControl>
                                <FormMessage />
                            </FormItem>
                        )}
                        />
                        <Button type="submit" variant={"save"}>Opslaan</Button>
                    </form>
                    <br/>
                </Form>
            </div>
            </PageLayout>
            </div>
    )
}