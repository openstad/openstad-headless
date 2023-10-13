import React from 'react'
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
import { Textarea } from "@/components/ui/textarea"
import { PageLayout} from "@/components/ui/page-layout"
import { Heading } from '@/components/ui/typography'
import { Separator } from '@/components/ui/separator'
import { useRouter } from 'next/router'
import useArea from '@/hooks/use-area'

const formSchema = z.object({
    name: z.string(),
    polygon: z.string()
})

export default function ProjectAreaCreate() {
    const router = useRouter();
    const projectId = router.query.project;
    const exampleText = '[{"lat":52.08526843203928,"lng":4.273874759674072},{"lat":52.086283702713075,"lng":4.276385307312012}, ...]'
    const { createArea } = useArea()
    
    const form = useForm<z.infer<typeof formSchema>>({
        resolver: zodResolver<any>(formSchema),
        defaultValues: {
        }
    })

    function onSubmit(values: z.infer<typeof formSchema>) {
        createArea(values.name, values.polygon)
    }

    return (
        <div>
            <PageLayout
                pageHeader="Projecten"
                breadcrumbs={[
                    {
                        name: "Projecten",
                        url: "/projects"
                    },
                    {
                        name: "Gebieden",
                        url: `/projects/${projectId}/areas`
                    },
                    {
                        name: "Gebied aanmaken",
                        url: `/projects/${projectId}/areas/create`
                    }
                ]}
            >
                <div className="container mx-auto py-10 w-1/2 float-left">
                    <Form {...form}>
                        <Heading size="xl" className="mb-4">
                            Gebied • Aanmaken
                        </Heading>
                        <Separator className="mb-4" />
                        <form onSubmit={form.handleSubmit(onSubmit)} className="space-y-4">
                            <p>Je kan hier een polygoon aanmaken om een gebied op te geven waar je kaarten op zullen focussen.</p>
                            <p>Het polygoon veld verwacht een lijst met coördinaten die samen een gesloten polygoon vormen. Als het polygoon niet juist sluit, dan zal er een error terug worden gegeven. Het invullen van de polygoon verwacht voor nu een array met het volgende formaat (deze wordt hieronder meegegeven als voorbeeld):</p>
                            <p><code>{exampleText}</code></p>
                            <FormField
                            control={form.control}
                            name="name"
                            render={({ field }) => (
                                <FormItem>
                                    <FormLabel>Naam</FormLabel>
                                    <FormControl>
                                        <Input placeholder='' {...field} />
                                    </FormControl>
                                    <FormMessage />
                                </FormItem>
                            )}
                            />
                            <FormField
                            control={form.control}
                            name="polygon"
                            render={({ field }) => (
                                <FormItem>
                                    <FormLabel>Polygoon</FormLabel>
                                    <FormControl>
                                        <Textarea placeholder='' {...field} />
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