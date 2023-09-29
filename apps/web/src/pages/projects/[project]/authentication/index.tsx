import { PageLayout } from '@/components/ui/page-layout'
import { Button } from "@/components/ui/button"
import { Checkbox } from "@/components/ui/checkbox"
import {
    Form,
    FormControl,
    FormField,
    FormItem,
    FormLabel,
    FormMessage
} from "@/components/ui/form"
import { Input } from "@/components/ui/input"
import { Select, SelectContent, SelectItem, SelectTrigger, SelectValue } from '@/components/ui/select'
import React from 'react'
import { useForm } from 'react-hook-form'
import { zodResolver } from '@hookform/resolvers/zod'
import * as z from 'zod'

const availableAuthentication = [
    {
        id: "code",
        label: "Unieke code"
    },
    {
        id: "email",
        label: "E-mail een inloglink"
    },
    {
        id: "sms",
        label: "SMS verificatie"
    },
    {
        id: "password",
        label: "Wachtwoord authenticatie"
    }
]

const twoFactorRoles = [
    {
        id: "admin",
        label: "Administrator"
    },
    {
        id: "member",
        label: "Member"
    },
    {
        id: "anon",
        label: "Anonieme gebruiker"
    },
    {
        id: "moderator",
        label: "Moderator"
    },
    {
        id: "editor",
        label: "Editor"
    }
]

const requiredFields = [
    {
        id: "firstName",
        label: "Voornaam"
    },
    {
        id: "lastName",
        label: "Achternaam"
    },
    {
        id: "email",
        label: "E-mailadres"
    },
    {
        id: "phoneNumber",
        label: "Telefoonnummer"
    },
    {
        id: "street",
        label: "Straatnaam"
    },
    {
        id: "suffix",
        label: "Tussenvoegsel"
    },
    {
        id: "houseNumber",
        label: "Huisnummer"
    },
    {
        id: "city",
        label: "Stad"
    },
    {
        id: "zipcode",
        label: "Postcode"
    },
]

const formSchema = z.object({
    name: z.string(),
    availableAuthentication: z.string().array().optional(),
    twoFactorRoles: z.string().array().optional(),
    requiredFields: z.string().array().optional(),
    emailAddressOutgoing: z.string().email(),
    emailAddressOutgoingUser: z.string(),
    contactEmail: z.string().email(),
    defaultRole: z.enum(["member", "anon"]),
    emailHeader: z.string()
})

export default function ProjectAuthentication() {
    const form = useForm<z.infer<typeof formSchema>>({
        resolver: zodResolver(formSchema),
        defaultValues: {
            availableAuthentication: ["code"],
            twoFactorRoles: ["admin", "member"],
            requiredFields: []
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
                    url: '/projects'
                },
                {
                    name: 'Authenticatie',
                    url: '/projects/1/authentication'
                }
            ]}>
                <div className="container mx-auto py-10 w-1/2 float-left divide-y">
                    <Form {...form}>
                        <form onSubmit={form.handleSubmit(onSubmit)} className='space-y-8'>
                            <FormField
                            control={form.control}
                            name="name"
                            render={({ field }) => (
                                <FormItem>
                                    <FormLabel>Projectnaam</FormLabel>
                                    <FormControl>
                                        <Input placeholder='' {...field} />
                                    </FormControl>
                                    <FormMessage />
                                </FormItem>
                            )}
                            />
                            <FormField
                            control={form.control}
                            name="availableAuthentication"
                            render={() => (
                                <FormItem>
                                    <div>
                                        <FormLabel>Available authentication</FormLabel>
                                    </div>
                                    {availableAuthentication.map((item) => (
                                        <FormField
                                        key={item.id}
                                        control={form.control}
                                        name="availableAuthentication"
                                        render={({ field }) => {
                                            return (
                                                <FormItem
                                                key={item.id}
                                                className="flex flex-row items-start space-x-3 space-y-0"
                                                >
                                                    <FormControl>
                                                        <Checkbox
                                                        checked={field.value?.includes(item.id)}
                                                        onCheckedChange={(checked) => {
                                                            return checked
                                                            ? field.onChange([...field.value, item.id])
                                                            : field.onChange(
                                                                field.value?.filter(
                                                                    (value) => value !== item.id
                                                                )
                                                            )
                                                        }}
                                                        />
                                                    </FormControl>
                                                    <FormLabel className="font-normal">
                                                        {item.label}
                                                    </FormLabel>
                                                </FormItem>
                                            )
                                        }}
                                        />
                                    ))}
                                </FormItem>
                            )}
                            />
                            <FormField
                            control={form.control}
                            name="twoFactorRoles"
                            render={() => (
                                <FormItem>
                                    <div>
                                        <FormLabel>Two Factor authenticatie voor rollen</FormLabel>
                                    </div>
                                    {twoFactorRoles.map((item) => (
                                        <FormField
                                        key={item.id}
                                        control={form.control}
                                        name="twoFactorRoles"
                                        render={({ field }) => {
                                            return (
                                                <FormItem
                                                key={item.id}
                                                className="flex flex-row items-start space-x-3 space-y-0"
                                                >
                                                    <FormControl>
                                                        <Checkbox
                                                        checked={field.value?.includes(item.id)}
                                                        onCheckedChange={(checked) => {
                                                            return checked
                                                            ? field.onChange([...field.value, item.id])
                                                            : field.onChange(
                                                                field.value?.filter(
                                                                    (value) => value !== item.id
                                                                )
                                                            )
                                                        }}
                                                        />
                                                    </FormControl>
                                                    <FormLabel className="font-normal">
                                                        {item.label}
                                                    </FormLabel>
                                                </FormItem>
                                            )
                                        }}
                                        />
                                    ))}
                                </FormItem>
                            )}
                            />
                            <FormField
                            control={form.control}
                            name="requiredFields"
                            render={() => (
                                <FormItem>
                                    <div>
                                        <FormLabel>Verplichte velden</FormLabel>
                                    </div>
                                    {requiredFields.map((item) => (
                                        <FormField
                                        key={item.id}
                                        control={form.control}
                                        name="requiredFields"
                                        render={({ field }) => {
                                            return (
                                                <FormItem
                                                key={item.id}
                                                className="flex flex-row items-start space-x-3 space-y-0"
                                                >
                                                    <FormControl>
                                                        <Checkbox
                                                        checked={field.value?.includes(item.id)}
                                                        onCheckedChange={(checked) => {
                                                            return checked
                                                            ? field.onChange([...field.value, item.id])
                                                            : field.onChange(
                                                                field.value?.filter(
                                                                    (value) => value !== item.id
                                                                )
                                                            )
                                                        }}
                                                        />
                                                    </FormControl>
                                                    <FormLabel className="font-normal">
                                                        {item.label}
                                                    </FormLabel>
                                                </FormItem>
                                            )
                                        }}
                                        />
                                    ))}
                                </FormItem>
                            )}
                            />
                            <FormField
                            control={form.control}
                            name="emailAddressOutgoing"
                            render={({ field }) => (
                                <FormItem>
                                    <FormLabel>Mailadres verstuurde emails</FormLabel>
                                    <FormControl>
                                        <Input placeholder='' {...field} />
                                    </FormControl>
                                    <FormMessage />
                                </FormItem>
                            )}
                            />
                            <FormField
                            control={form.control}
                            name="emailAddressOutgoingUser"
                            render={({ field }) => (
                                <FormItem>
                                    <FormLabel>Eigenaar van mailadres verstuurde emails</FormLabel>
                                    <FormControl>
                                        <Input placeholder='' {...field} />
                                    </FormControl>
                                    <FormMessage />
                                </FormItem>
                            )}
                            />
                            <FormField
                            control={form.control}
                            name="contactEmail"
                            render={({ field }) => (
                                <FormItem>
                                    <FormLabel>Emailadres voor contacten</FormLabel>
                                    <FormControl>
                                        <Input placeholder='' {...field} />
                                    </FormControl>
                                    <FormMessage />
                                </FormItem>
                            )}
                            />
                            <FormField
                            control={form.control}
                            name="defaultRole"
                            render={({ field }) => (
                                <FormItem>
                                    <FormLabel>Welke rol krijgt een nieuwe gebruiker toegewezen?</FormLabel>
                                    <Select onValueChange={field.onChange} defaultValue={field.value}>
                                        <FormControl>
                                            <SelectTrigger>
                                                <SelectValue placeholder="Standaard gebruiker" />
                                            </SelectTrigger>
                                        </FormControl>
                                        <SelectContent>
                                            <SelectItem value="anon">Anoniem</SelectItem>
                                            <SelectItem value="member">Standaard gebruiker</SelectItem>
                                        </SelectContent>
                                    </Select>
                                    <FormMessage />
                                </FormItem>
                            )}
                            />
                            <FormField
                            control={form.control}
                            name="contactEmail"
                            render={({ field }) => (
                                <FormItem>
                                    <FormLabel>Header afbeelding voor emails</FormLabel>
                                    <FormControl>
                                        <Input type="file" {...field} />
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