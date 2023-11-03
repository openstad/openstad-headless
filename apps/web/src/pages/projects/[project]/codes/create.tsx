import { PageLayout} from "@/components/ui/page-layout"
import React from "react";
import Link from "next/link";
import * as z from 'zod'

import { Button } from "@/components/ui/button";
import { Input } from "@/components/ui/input"
import { useRouter } from "next/router";
import { Form, FormControl, FormField, FormItem, FormLabel, FormMessage } from "@/components/ui/form";
import { Heading } from "@/components/ui/typography";
import { useForm } from "react-hook-form";
import { zodResolver } from "@hookform/resolvers/zod";
import { Separator } from "@/components/ui/separator";
import useCodes from "@/hooks/use-codes";

const formSchema = z.object({
    numberOfCodes: z.coerce.number(),
})

export default function ProjectCodeCreate() {
    const router = useRouter();
    const { project } = router.query;
    const { create } = useCodes()

    const form = useForm<z.infer<typeof formSchema>>({
        resolver: zodResolver<any>(formSchema),
        defaultValues: {
        }
    })

    function onSubmit(values: z.infer<typeof formSchema>) {
        create(values)
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
                        name: "Stem codes",
                        url: `/projects/${project}/codes`
                    },
                    {
                        name: "Creëer nieuwe codes",
                        url: `projects/${project}/codes/create`
                    }
                ]}
                action={
                    <div className="flex">
                        <Link href="/projects/1/codes/export" className="pl-6">
                            <Button variant="default">
                                Exporteer unieke codes
                            </Button>
                        </Link>
                    </div>
                }
            >
                <div className="container mx-auto py-10 w-1/2 float-left">
                    <Form {...form}>
                        <Heading size="xl" className="mb-4">
                            Unieke codes • Aanmaken
                        </Heading>
                        <Separator className="mb-4" />
                        <form onSubmit={form.handleSubmit(onSubmit)} className="space-y-4">
                            <FormField
                            control={form.control}
                            name="numberOfCodes"
                            render={({ field }) => (
                                <FormItem>
                                    <FormLabel>Hoeveelheid nieuwe codes om aan te maken:</FormLabel>
                                    <FormControl>
                                        <Input placeholder='' {...field} />
                                    </FormControl>
                                    <FormMessage />
                                </FormItem>
                            )}
                            />
                            <Button type="submit" variant={"default"}>Aanmaken</Button>
                        </form>
                        <br/>
                    </Form>
                </div>
            </PageLayout>
        </div>
    )
}