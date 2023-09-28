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
import { Heading } from '@/components/ui/typography'
import { Separator } from '@/components/ui/separator'

const formSchema = z.object({
    projectName: z.string().min(6, {
        message: "Het project moet minimaal uit zes karakters bestaan!"
    }),
    endDate: z.date({
        invalid_type_error: "Dit is niet een juiste datum-waarde!"
    }),
    email: z.string().email({
        message: "Dit is geen correct email-adres!"
    }),
    emailName: z.string().min(1, {
        message: "Vergeet niet de eigenaar van het email-adres toe te voegen!"
    }),
})

export default function CreateProject() {
    const form = useForm<z.infer<typeof formSchema>>({
        resolver: zodResolver(formSchema),
        defaultValues: {
            projectName: "",
            email: "",
            emailName: ""
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
            ]}>
            <div className="container mx-auto py-10 w-1/2 float-left">
                <Form {...form}>
                <Heading size="xl" className="mb-4">
                    Project toevoegen
                </Heading>
                <Separator className="mb-4" />
                    <form onSubmit={form.handleSubmit(onSubmit)} className='space-y-8'>
                        <FormField
                        control={form.control}
                        name="projectName"
                        render={({ field }) => (
                            <FormItem>
                                <FormLabel>Project naam</FormLabel>
                                <FormControl>
                                    <Input placeholder='Naam' {...field} />
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
                        name="email"
                        render={({ field }) => (
                            <FormItem>
                                <FormLabel>E-mail</FormLabel>
                                <FormControl>
                                    <Input placeholder='E-mail' {...field} />
                                </FormControl>
                                <FormMessage />
                            </FormItem>
                        )}
                        />
                        <FormField
                        control={form.control}
                        name="emailName"
                        render={({ field }) => (
                            <FormItem>
                                <FormLabel>E-mail naam</FormLabel>
                                <FormControl>
                                    <Input placeholder='Naam' {...field} />
                                </FormControl>
                                <FormMessage />
                            </FormItem>
                        )}
                        />
                        <Button variant="default" type="submit" className='float-right'>Aanmaken</Button>
                        <Button variant="ghost" className='float-right'>Annuleren</Button>
                    </form>
                </Form>
            </div>
            </PageLayout>
            </div>
    )
}