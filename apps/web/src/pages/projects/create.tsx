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
        resolver: zodResolver<any>(formSchema),
        defaultValues: {
            projectName: "",
            email: "",
            emailName: ""
        }
    })

    function onSubmit(values: z.infer<typeof formSchema>) {
        createProject(
            `/api/openstad/api/project`,
            values
        )
    }

    async function createProject(url, schema) {
        await fetch(url, {
            method: 'POST',
            headers:{
                "Content-Type": "application/json"
            },
            body: JSON.stringify({name: schema.projectName,
                config: {
                    "auth": {"adapter": {}, "default": "openstad", "provider": {"openstad": {"adapter": "openstad", "clientId": "uniquecode", "clientSecret": "uniquecode123"}, 
                    "anonymous": {"adapter": "openstad", "clientId": "anonymous", "clientSecret": "anonymous123"}}}, 
                    "ideas": {"types": [], "canAddNewIdeas": true, "titleMaxLength": 50, "titleMinLength": 10, "minimumYesVotes": 100, "showVoteButtons": true, "summaryMaxLength": 140, "summaryMinLength": 20, "descriptionMaxLength": 5000, "descriptionMinLength": 140, "extraDataMustBeDefined": false, "canEditAfterFirstLikeOrComment": false}, 
                    "polls": {"canAddPolls": false, "requiredUserRole": "anonymous"},
                    "users": {"canCreateNewUsers": true, "allowUseOfNicknames": false, "extraDataMustBeDefined": false}, 
                    "votes": {"isActive": null, "maxIdeas": 100, "minIdeas": 1, "voteType": "likes", "isViewable": true, "voteValues": [{"label": "voor", "value": "yes"}, {"label": "tegen", "value": "no"}], "mustConfirm": false, "withExisting": "error", "requiredUserRole": "member"}, 
                    "project": {"endDate": schema.endDate, "projectHasEnded": false, "endDateNotificationSent": false}, 
                    "widgets": {"beta": false, "deprecated": false, "visibleWidgets": []}, 
                    "comments": {"new": {"anonymous": {"redirect": null, "notAllowedMessage": null}, "showFields": ["zipCode", "displayName"]}, "isClosed": false, "closedText": "De reactiemogelijkheid is gesloten, u kunt niet meer reageren"}, 
                    "anonymize": {"anonymizeUsersXDaysAfterEndDate": 60, "warnUsersAfterXDaysOfInactivity": 770, "anonymizeUsersAfterXDaysOfInactivity": 860}, 
                    "allowedDomains": [""], 
                    "ignoreBruteForce": []}
            })
        })
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
                    <form onSubmit={form.handleSubmit(onSubmit)} className="space-y-4">
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