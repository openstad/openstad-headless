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
})

export default function CreateProject() {
    const form = useForm<z.infer<typeof formSchema>>({
        resolver: zodResolver<any>(formSchema),
        defaultValues: {
            projectName: "",
            email: "",
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
                    "ignoreBruteForce": []},
                emailConfig: {
                    "anonymize": {
                        "inactiveWarningEmail": {
                            "subject": "We gaan je account verwijderen",
                            "template": "Beste {{DISPLAYNAME}},<br/><br/>Je bent al een tijd niet actief geweest op de website <a href=\"{{URL}}\">{{URL}}</a>. We willen niet onnodig je gegevens blijven bewaren, en gaan die daarom verwijderen.<br/><br/>Dat betekent dat een eventuele bijdrage die je hebt geleverd op de website, bijvoorbeeld inzendingen en/of reacties, geanonimiseerd worden.<br/><br/>Wil je dit liever niet? Dan hoef je alleen een keer in te loggen op de website om je account actief te houden. Doe dit wel voor {{ANONYMIZEDATE}}, want anders gaan we op die dag je gegevens verwijderen.<br/><br/><br/><em>Dit is een geautomatiseerde email.</em>",
                            "attachments": []
                        }
                    },
                    "notifications": {
                        "fromAddress": schema.email,
                        "projectmanagerAddress": "EMAIL@NOT.DEFINED",
                        "sendEndDateNotifications": {
                            "XDaysBefore": 7,
                            "subject": "Sluitingsdatum project nadert",
                            "template": "De website <a href=\"{{URL}}\">{{URL}}</a> nadert de ingestelde sluitingsdatum. De sluitingsdatum is ingesteld op <strong>{{ENDDATE}}</strong>.<br/><br/><strong>Klopt dit nog? Het is belangrijk dat de sluitingsdatum goed is ingesteld.</strong> Daarmee wordt gezorgd dat gebruikers vanaf dat moment hun account kunnen verwijderen, zonder dat stemmen of likes ongeldig gemaakt worden. De sluitingsdatum wordt ook als referentie gebruikt om op een later moment alle gebruikersgegevens te anonimiseren.<br/><br/>De webmaster zorgt ervoor dat de website gesloten wordt, handmatig of automatisch. Neem contact op om af te spreken wanneer dit precies moet gebeuren, als je dat nog niet gedaan hebt: <a href=\"mailto:{{WEBMASTER_EMAIL}}\">{{WEBMASTER_EMAIL}}</a>.<br/><br/>Als de webmaster de website gesloten heeft is deze in principe nog wel te bezoeken, maar afhankelijk van het project kunnen er geen nieuwe plannen ingediend worden, geen reacties meer worden geplaatst, geen nieuwe stemmen of likes uitgebracht worden, en kunnen er geen nieuwe gebruikers zich aanmelden.<br/><br/><br/><br/><em>Dit is een geautomatiseerde email.</em><br/>"
                        }
                    },
                    "ideas": {},
                    "newslettersignup": {
                        "confirmationEmail": {
                            "from": "EMAIL@NOT.DEFINED",
                            "url": "/PATH/TO/CONFIRMATION/[[token]]",
                            "template": "NO TEMPLATE DEFINED",
                            "attachments": []
                        }
                    },
                    "styling": {
                        "logo": ""
                    }
                }
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
                        <Button variant="default" type="submit" className='float-right'>Aanmaken</Button>
                        <Button variant="ghost" className='float-right'>Annuleren</Button>
                    </form>
                </Form>
            </div>
            </PageLayout>
            </div>
    )
}