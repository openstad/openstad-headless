import React from 'react'
import { PageLayout } from "../../../../../components/ui/page-layout"
import { Button } from '../../../../../components/ui/button'
import { Form, FormControl, FormField, FormItem, FormLabel } from "../../../../../components/ui/form"
import { Select, SelectContent, SelectItem, SelectTrigger, SelectValue } from "../../../../../components/ui/select";
import { zodResolver } from "@hookform/resolvers/zod";
import { useForm } from "react-hook-form";
import * as z from 'zod'
import { Heading } from '@/components/ui/typography';
import { Separator } from '@/components/ui/separator';

const formSchema = z.object({
    display: z.enum(["claps"])
})

export default function WidgetLikes() {
    const form = useForm<z.infer<typeof formSchema>>({
        resolver: zodResolver(formSchema),
        defaultValues: {
            display: "claps"
        }
    })

    function onSubmit(values: z.infer<typeof formSchema>) {
        console.log(values)
    }

    return(
        <div>
            <PageLayout
            pageHeader='Project naam'
            breadcrumbs={[
                {
                    name: "Projecten",
                    url: "/projects"
                },
                {
                    name: "Widgets",
                    url: "/projects/1/widgets"
                },
                {
                    name: "Likes",
                    url: "/projects/1/widgets/likes"
                }
            ]}
            >
                <div>
                    <div className='p-4 w-1/2'>
                        <Form {...form}>
                            <Heading size="xl" className="mb-4">
                                Likes • Instellingen
                            </Heading>
                            <Separator className="mb-4" />
                            <form
                            onSubmit={form.handleSubmit(onSubmit)}
                            className='space-y-8'
                            >
                                <FormField
                                control={form.control}
                                name="display"
                                render={({ field }) => (
                                    <FormItem>
                                        <FormLabel>
                                            Weergave type:
                                        </FormLabel>
                                        <Select
                                        onValueChange={field.onChange}
                                        defaultValue={field.value}
                                        >
                                            <FormControl>
                                                <SelectTrigger>
                                                    <SelectValue placeholder="Claps"/>
                                                </SelectTrigger>
                                            </FormControl>
                                            <SelectContent>
                                                <SelectItem value="claps">Claps</SelectItem>
                                            </SelectContent>
                                        </Select>
                                    </FormItem>
                                )}
                                />
                            </form>
                        </Form>
                        <div className="sticky bottom-0 py-4 bg-background border-t border-border flex flex-col">
                            <Button className="self-end" type="submit">
                                Opslaan
                            </Button>
                        </div>
                    </div>
                </div>
            </PageLayout>
        </div>
    )
}