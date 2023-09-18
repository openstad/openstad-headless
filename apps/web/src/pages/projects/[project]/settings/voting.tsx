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
    votingPubliclyAvailable: z.boolean(),
    votingActive: z.boolean(),
    votingReplace: z.enum(["error", "replace"]),
    votingAllowed: z.enum(["anon", "member"]),
    votingType: z.enum(["likes", "count", "budgeting", "countPerTheme", "budgetingPerTheme"]),
    minIdeas: z.number().gt(0),
    maxIdeas: z.number(),
    minBudget: z.number().gt(0),
    maxBudget: z.number()
})

export default function ProjectSettingsVoting() {
    const form = useForm<z.infer<typeof formSchema>>({
        resolver: zodResolver(formSchema),
        defaultValues: {
            votingPubliclyAvailable: false,
            votingActive: false,
            votingReplace: "error",
            votingAllowed: "member",
            votingType: "budgeting",
            minIdeas: 1,
            maxIdeas: 10000,
            minBudget: 1,
            maxBudget: 10000
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
                    name: 'Stemmen',
                    url: '/projects/1/settings/voting'
                }
            ]}>
            <div className="container mx-auto py-10 w-1/2 float-left divide-y">
                <Form {...form}>
                    <form onSubmit={form.handleSubmit(onSubmit)} className='space-y-8'>
                        <FormField
                            control={form.control}
                            name="votingPubliclyAvailable"
                            render={({ field }) => (
                                <FormItem>
                                    <FormLabel>Is de hoeveelheid stemmen publiek zichtbaar?</FormLabel>
                                    <Select onValueChange={field.onChange} defaultValue={field.value}>
                                        <FormControl>
                                            <SelectTrigger>
                                                <SelectValue placeholder="No" />
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
                            name="votingActive"
                            render={({ field }) => (
                                <FormItem>
                                    <FormLabel>Is het mogelijk om te stemmen?</FormLabel>
                                    <Select onValueChange={field.onChange} defaultValue={field.value}>
                                        <FormControl>
                                            <SelectTrigger>
                                                <SelectValue placeholder="No" />
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
                            name="votingReplace"
                            render={({ field }) => (
                                <FormItem>
                                    <FormLabel>Moet het systeem een error geven wanneer iemand twee keer stemt, of moet de vorige stem vervangen worden?</FormLabel>
                                    <Select onValueChange={field.onChange} defaultValue={field.value}>
                                        <FormControl>
                                            <SelectTrigger>
                                                <SelectValue placeholder="error" />
                                            </SelectTrigger>
                                        </FormControl>
                                        <SelectContent>
                                            <SelectItem value="error">Error</SelectItem>
                                            <SelectItem value="replace">Vervang de vorige stem</SelectItem>
                                        </SelectContent>
                                    </Select>
                                    <FormMessage />
                                </FormItem>
                            )}
                        />
                        <FormField
                            control={form.control}
                            name="votingAllowed"
                            render={({ field }) => (
                                <FormItem>
                                    <FormLabel>Wat voor gebruikers hebben het recht om te stemmen?</FormLabel>
                                    <Select onValueChange={field.onChange} defaultValue={field.value}>
                                        <FormControl>
                                            <SelectTrigger>
                                                <SelectValue placeholder="member" />
                                            </SelectTrigger>
                                        </FormControl>
                                        <SelectContent>
                                            <SelectItem value="anon">Anonieme gebruikers</SelectItem>
                                            <SelectItem value="member">Geregistreerde gebruikers</SelectItem>
                                        </SelectContent>
                                    </Select>
                                    <FormMessage />
                                </FormItem>
                            )}
                        />
                        <FormField
                            control={form.control}
                            name="votingType"
                            render={({ field }) => (
                                <FormItem>
                                    <FormLabel>Wat voor type stemmen wordt er gebruikt?</FormLabel>
                                    <Select onValueChange={field.onChange} defaultValue={field.value}>
                                        <FormControl>
                                            <SelectTrigger>
                                                <SelectValue placeholder="count" />
                                            </SelectTrigger>
                                        </FormControl>
                                        <SelectContent>
                                            <SelectItem value="likes">Likes</SelectItem>
                                            <SelectItem value="count">Count</SelectItem>
                                            <SelectItem value="budgeting">Budgeting</SelectItem>
                                            <SelectItem value="countPerTheme">Count per theme</SelectItem>
                                            <SelectItem value="countPerBudgeting">Count per budgeting</SelectItem>
                                        </SelectContent>
                                    </Select>
                                    <FormMessage />
                                </FormItem>
                            )}
                        />
                        <FormField
                        control={form.control}
                        name="minIdeas"
                        render={({ field }) => (
                            <FormItem>
                                <FormLabel>Wat is de minimum hoeveelheid ideeën waar iemand op kan stemmen?</FormLabel>
                                <FormControl>
                                    <Input placeholder='1' {...field} />
                                </FormControl>
                                <FormMessage />
                            </FormItem>
                        )}
                        />
                        <FormField
                        control={form.control}
                        name="maxIdeas"
                        render={({ field }) => (
                            <FormItem>
                                <FormLabel>Wat is de maximum hoeveelheid ideeën waar iemand op kan stemmen?</FormLabel>
                                <FormControl>
                                    <Input placeholder='10000' {...field} />
                                </FormControl>
                                <FormMessage />
                            </FormItem>
                        )}
                        />
                        <FormField
                        control={form.control}
                        name="minBudget"
                        render={({ field }) => (
                            <FormItem>
                                <FormLabel>Wat is de minimum hoeveelheid budget waar iemand op kan stemmen?</FormLabel>
                                <FormControl>
                                    <Input placeholder='1' {...field} />
                                </FormControl>
                                <FormMessage />
                            </FormItem>
                        )}
                        />
                        <FormField
                        control={form.control}
                        name="maxBudget"
                        render={({ field }) => (
                            <FormItem>
                                <FormLabel>Wat is de maximum hoeveelheid budget waar iemand op kan stemmen?</FormLabel>
                                <FormControl>
                                    <Input placeholder='1' {...field} />
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