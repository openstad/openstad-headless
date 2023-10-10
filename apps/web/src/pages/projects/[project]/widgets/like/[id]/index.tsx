import React from 'react'
import { PageLayout } from "../../../../../../components/ui/page-layout"
import { Button } from '../../../../../../components/ui/button'
import { Form, FormControl, FormField, FormItem, FormLabel } from "../../../../../../components/ui/form"
import { Select, SelectContent, SelectItem, SelectTrigger, SelectValue } from "../../../../../../components/ui/select";
import { zodResolver } from "@hookform/resolvers/zod";
import { useForm } from "react-hook-form";
import * as z from 'zod'
import { Heading } from '@/components/ui/typography';
import { Separator } from '@/components/ui/separator';
import { useRouter } from 'next/router';
import useSWR from 'swr';
import useSWRMutation from 'swr/mutation';
import { useConfig } from '@/hooks/useConfigHook';

const formSchema = z.object({
    display: z.enum(["claps"])
})
type FormData = z.infer<typeof formSchema>

export default function WidgetLikes() {
    const router = useRouter();
    const id = router.query.id;
    const projectId = router.query.project;

    const { data: widget, isLoading: isLoadingWidget, updateConfig } = useConfig();

    async function onSubmit(values: FormData) {
        try {
            await updateConfig({ like: values});
        } catch (error) {
         console.error('could not update', error)   
        }
    }

    const form = useForm<FormData>({
        resolver: zodResolver(formSchema),
        defaultValues: {
            display: widget?.config?.like?.display || "claps"
        }
    });

    if(isLoadingWidget || !widget?.config) {
        return null;
    } else {

    return(
            <div>
                <PageLayout
                pageHeader='Project naam'
                breadcrumbs={[
                    {
                        name: "Projecten",
                        url: "/projects"
                    },{
                        name: "Widgets",
                        url: `/projects/${projectId}/widgets`
                    }, {
                        name: "Likes",
                        url: `/projects/${projectId}/widgets/like/${id}`
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
                                className="space-y-4"
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
                                    <div className="sticky bottom-0 py-4 bg-background border-t border-border flex flex-col">
                                        <Button className="self-end" type="submit">
                                            Opslaan
                                        </Button>
                                    </div>
                                </form>
                            </Form>
                        </div>
                    </div>
                </PageLayout>
            </div>
        )
    }
}