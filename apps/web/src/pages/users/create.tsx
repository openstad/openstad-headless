import * as React from 'react'
import { zodResolver } from '@hookform/resolvers/zod'
import * as z from 'zod'
import { useForm } from 'react-hook-form'

import { Button } from "../../components/ui/button"
import {
    Form,
    FormControl,
    FormField,
    FormItem,
    FormLabel,
    FormMessage
} from "../../components/ui/form"
import { Input } from "../../components/ui/input"
import { PageLayout } from '../../components/ui/page-layout'
import { Heading } from '@/components/ui/typography'
import { Separator } from '@/components/ui/separator'
import useUser from '@/hooks/use-user'
import projectListSwr from '@/hooks/use-project-list'
import { Select, SelectContent, SelectItem, SelectTrigger, SelectValue } from '@/components/ui/select'
import { Checkbox } from '@/components/ui/checkbox'

const formSchema = z.object({
    email: z.string().email(),
    // nickName: z.string().optional(),
    name: z.string().optional(),
    phoneNumber: z.string().optional(),
    address: z.string().optional(),
    city: z.string().optional(),
    postcode: z.string().optional(),
    // role: z.enum(["admin", "editor", "moderator", "member", "anonymous"]),
    // extraData: z.number().array()
})

export default function CreateUser() {
    const { data, isLoading } = projectListSwr();
    const { createUser } = useUser()

    const form = useForm<z.infer<typeof formSchema>>({
        resolver: zodResolver<any>(formSchema),
        defaultValues: {
        }
    })

    function onSubmit(values: z.infer<typeof formSchema>) {
        createUser(values.email, values.name, values.phoneNumber, values.address, values.city, values.postcode)
    }

    if (!data) return null;

    return(
        <div>
            <PageLayout
            pageHeader="Gebruikers"
            breadcrumbs={[
                {
                name: 'Gebruikers',
                url: '/users',
                },
                {
                    name: 'Gebruiker toevoegen',
                    url: '/users/create'
                }
            ]}>
            <div className="container mx-auto py-10 w-1/2 float-left">
                <Form {...form}>
                    <Heading size="xl" className="mb-4">
                        Gebruiker • Aanmaken
                    </Heading>
                    <Separator className="mb-4" />
                    <form onSubmit={form.handleSubmit(onSubmit)} className="space-y-4">
                        <FormField
                        control={form.control}
                        name="email"
                        render={({ field }) => (
                            <FormItem>
                                <FormLabel>E-mail (verplicht)</FormLabel>
                                <FormControl>
                                    <Input {...field} />
                                </FormControl>
                                <FormMessage />
                            </FormItem>
                        )}
                        />
                        {/* <FormField
                        control={form.control}
                        name="nickName"
                        render={({ field }) => (
                            <FormItem>
                                <FormLabel>Gebruikersnaam</FormLabel>
                                <FormControl>
                                    <Input {...field} />
                                </FormControl>
                                <FormMessage />
                            </FormItem>
                        )}
                        /> */}
                        <FormField
                        control={form.control}
                        name="name"
                        render={({ field }) => (
                            <FormItem>
                                <FormLabel>Volledige naam</FormLabel>
                                <FormControl>
                                    <Input {...field} />
                                </FormControl>
                                <FormMessage />
                            </FormItem>
                        )}
                        />
                        <FormField
                        control={form.control}
                        name="phoneNumber"
                        render={({ field }) => (
                            <FormItem>
                                <FormLabel>Telefoonnummer</FormLabel>
                                <FormControl>
                                    <Input {...field} />
                                </FormControl>
                                <FormMessage />
                            </FormItem>
                        )}
                        />
                        <FormField
                        control={form.control}
                        name="address"
                        render={({ field }) => (
                            <FormItem>
                                <FormLabel>Adres</FormLabel>
                                <FormControl>
                                    <Input {...field} />
                                </FormControl>
                                <FormMessage />
                            </FormItem>
                        )}
                        />
                        <FormField
                        control={form.control}
                        name="city"
                        render={({ field }) => (
                            <FormItem>
                                <FormLabel>Stad</FormLabel>
                                <FormControl>
                                    <Input {...field} />
                                </FormControl>
                                <FormMessage />
                            </FormItem>
                        )}
                        />
                        <FormField
                        control={form.control}
                        name="postcode"
                        render={({ field }) => (
                            <FormItem>
                                <FormLabel>Postcode</FormLabel>
                                <FormControl>
                                    <Input {...field} />
                                </FormControl>
                                <FormMessage />
                            </FormItem>
                        )}
                        />
                        {/* <FormField
                            control={form.control}
                            name="role"
                            render={({ field }) => (
                                <FormItem>
                                    <FormLabel>Rol van gebruiker</FormLabel>
                                    <Select onValueChange={field.onChange} defaultValue={"member"}>
                                        <FormControl>
                                            <SelectTrigger>
                                                <SelectValue placeholder="Normale gebruiker" />
                                            </SelectTrigger>
                                        </FormControl>
                                        <SelectContent>
                                            <SelectItem value="admin">Administrator</SelectItem>
                                            <SelectItem value="editor">Editor</SelectItem>
                                            <SelectItem value="moderator">Moderator</SelectItem>
                                            <SelectItem value="member">Normale gebruiker</SelectItem>
                                            <SelectItem value="anonymous">Anonieme gebruiker</SelectItem>
                                        </SelectContent>
                                    </Select>
                                    <FormMessage />
                                </FormItem>
                            )}
                        />
                        <FormField
                            control={form.control}
                            name="extraData"
                            render={() => (
                                <FormItem>
                                    <div>
                                        <FormLabel>Selecteer welke projecten deze gebruiker aan toe wordt gevoegd.</FormLabel>
                                    </div>
                                    {data.map((item: any) => (
                                        <FormField
                                        key={item.id}
                                        control={form.control}
                                        name="extraData"
                                        render={({ field }) => {
                                            return (
                                                <FormItem
                                                key={item.id}
                                                className="flex flex-row items-start space-x-3 space-y-0"
                                                >
                                                    <FormControl>
                                                        <Checkbox
                                                        checked={field.value?.includes(item.id)}
                                                        onCheckedChange={(checked: any) => {
                                                            return checked
                                                            ? field.onChange([...(field?.value || []), item.id])
                                                            : field.onChange(
                                                                field.value?.filter(
                                                                    (value) => value !== item.id
                                                                )
                                                            )
                                                        }}
                                                        />
                                                    </FormControl>
                                                    <FormLabel className="font-normal">
                                                        {item.name}
                                                    </FormLabel>
                                                </FormItem>
                                            )
                                        }}
                                        />
                                    ))}
                                </FormItem>
                            )}
                        /> */}
                        <Button type='submit' variant='default'>Aanmaken</Button>
                    </form>
                </Form>
            </div>
            </PageLayout>
        </div>
    )
}