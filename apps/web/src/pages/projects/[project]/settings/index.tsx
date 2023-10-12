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
import { Popover, PopoverContent, PopoverTrigger } from '@/components/ui/popover'
import { cn } from '@/lib/utils'
import { format } from 'date-fns'
import { CalendarIcon } from 'lucide-react'
import { Calendar } from '@/components/ui/calendar'
import { Select, SelectContent, SelectItem, SelectTrigger, SelectValue } from '@/components/ui/select'
import { Heading } from '@/components/ui/typography'
import { Separator } from '@/components/ui/separator'

const formSchema = z.object({
    projectName: z.string().min(1, {
        message: "De naam mag niet leeg zijn!"
    }),
    url: z.string().url({
        message: "Dit is geen juiste URL!"
    }),
    endDate: z.date().min(new Date(), {
        message: "De datum moet nog niet geweest zijn!"
    }),
    betaWidgets: z.boolean(),
    deprecatedWidgets: z.boolean(),
})

export default function ProjectSettings() {
    const form = useForm<z.infer<typeof formSchema>>({
        resolver: zodResolver<any>(formSchema),
        defaultValues: {
            projectName: "",
            betaWidgets: false,
            deprecatedWidgets: false
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
            ]}>
            <div className="container mx-auto py-10 w-1/2 float-left">
                <Form {...form}>
                    <Heading size="xl" className="mb-4">
                        Instellingen • Algemeen
                    </Heading>
                    <Separator className="mb-4" />
                    <form onSubmit={form.handleSubmit(onSubmit)} className="space-y-4">
                        <FormField
                        control={form.control}
                        name="projectName"
                        render={({ field }) => (
                            <FormItem>
                                <FormLabel>Title</FormLabel>
                                <FormControl>
                                    <Input placeholder='Naam' {...field} />
                                </FormControl>
                                <FormMessage />
                            </FormItem>
                        )}
                        />
                        <FormField
                        control={form.control}
                        name="url"
                        render={({ field }) => (
                            <FormItem>
                                <FormLabel>URL</FormLabel>
                                <FormControl>
                                    <Input placeholder='URL' {...field} />
                                </FormControl>
                                <FormMessage />
                            </FormItem>
                        )}
                        />
                        <FormField
                        control={form.control}
                        name="endDate"
                        render={({ field }) => (
                          <FormItem className='flex flex-col'>
                            <FormLabel>Einddatum</FormLabel>
                            <Popover>
                              <PopoverTrigger asChild>
                                <FormControl>
                                  <Button
                                  variant={"outline"}
                                  className={cn(
                                    "w-[240px] pl-3 text-left font-normal",
                                    !field.value && "text-muted-foreground"
                                  )}
                                  >
                                    {field.value ? (
                                        format(field.value, "PPP")
                                    ) : (
                                        <span>Kies een datum</span>
                                    )}
                                    <CalendarIcon className="ml-auto h-4 w-4 opacity-50" />
                                  </Button>
                                </FormControl>
                              </PopoverTrigger>
                              <PopoverContent className="w-auto p-0" align="start">
                                <Calendar
                                mode="single"
                                selected={field.value}
                                onSelect={field.onChange}
                                disabled={(date) => 
                                  date < new Date()
                                }
                                initialFocus
                                />
                              </PopoverContent>
                            </Popover>
                            <FormMessage />
                          </FormItem>
                        )}>
                        </FormField>
                        <FormField
                            control={form.control}
                            name="betaWidgets"
                            render={({ field }) => (
                                <FormItem>
                                    <FormLabel>Display beta widgets?</FormLabel>
                                    <Select onValueChange={field.onChange} defaultValue={field.value}>
                                        <FormControl>
                                            <SelectTrigger>
                                                <SelectValue placeholder="No" />
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
                        <FormField
                            control={form.control}
                            name="deprecatedWidgets"
                            render={({ field }) => (
                                <FormItem>
                                    <FormLabel>Display deprecated widgets?</FormLabel>
                                    <Select onValueChange={field.onChange} defaultValue={field.value}>
                                        <FormControl>
                                            <SelectTrigger>
                                                <SelectValue placeholder="False" />
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
                <div>
                    <br/>
                    <p>Let op! Deze actie is definitief en kan niet ongedaan gemaakt worden.</p>
                    <p>Het project moet eerst aangemerkt staan als 'beëindigd' voordat deze actie uitgevoerd kan worden.</p>
                    <br/>
                    <Button variant={"destructive"}>Project archiveren</Button>
                </div>
            </div>
            </PageLayout>
            </div>
    )
}