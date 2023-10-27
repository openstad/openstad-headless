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
import { Heading, ListHeading, Paragraph } from '@/components/ui/typography'
import { Separator } from '@/components/ui/separator'
import useUser from '@/hooks/use-user'
import projectListSwr from '@/hooks/use-project-list'
import DropdownList from '@/components/dropdown-list'

const projectRole = z.object({
    projectId: z.string(),
    roleId: z.string()
})

const formSchema = z.object({
    email: z.string().email(),
    nickName: z.string().optional(),
    name: z.string().optional(),
    phoneNumber: z.string().optional(),
    address: z.string().optional(),
    city: z.string().optional(),
    postcode: z.string().optional(),
})

type ProjectRole = {
    projectId: string, roleId: string
}
export default function CreateUser() {
    let projectRoles: Array<ProjectRole> = []
    const { data, isLoading } = projectListSwr()
    const { createUser } = useUser()

    const form = useForm<z.infer<typeof formSchema>>({
        resolver: zodResolver<any>(formSchema),
        defaultValues: {
        }
    })

    const addProject = (projectId: string, roleId: string) => {
        if(projectRoles.find(e => e.projectId === projectId)) {
            if(roleId === "0") {
                projectRoles = projectRoles.filter(function(project) {
                    return project.projectId !== projectId;
                })
            } else {
                let role = projectRoles.findIndex((obj => obj.projectId == projectId))
                projectRoles[role].roleId = roleId
            }
        } else {
            if (roleId !== "0") {
                projectRoles.push({projectId: projectId, roleId: roleId})
            }
        }
    }

    function onSubmit(values: z.infer<typeof formSchema>) {
        createUser(values.email, projectRoles, values.nickName, values.name, values.phoneNumber, values.address, values.city, values.postcode)
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
                        <FormField
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
                        />
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
                        <div className="container mx-auto">
                            <div className="mt-4 grid grid-cols-2 md:grid-cols-12 items-center py-2 border-b border-border">
                                <ListHeading className="hidden md:flex md:col-span-2">
                                Projectnaam
                                </ListHeading>
                                <ListHeading className="hidden md:flex md:col-span-2">
                                Rol
                                </ListHeading>
                            </div>
                            <ul>
                                {data.map((project: any) => {
                                    return (
                                        <li className='grid grid-cols-2 md:grid-cols-12 items-center py-3 h-16 hover:bg-secondary-background hover:cursor-pointer border-b border-border gap-2'>
                                            <Paragraph className='hidden md:flex'>
                                                {project.name}
                                            </Paragraph>
                                            <Paragraph className='hidden md:flex'>
                                                <DropdownList roleId='0' addProject={(roleId) => {
                                                    addProject(project.id, roleId )
                                                }}
                                                    />
                                            </Paragraph>
                                        </li>
                                    )
                                })}
                            </ul>
                        </div>   
                        <Button type='submit' variant='default'>Aanmaken</Button>
                    </form>
                </Form>
            </div>
            </PageLayout>
        </div>
    )
}