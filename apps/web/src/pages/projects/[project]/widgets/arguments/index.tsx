import React from 'react'
import { PageLayout } from "../../../../../components/ui/page-layout"
import { Button } from '../../../../../components/ui/button'
import { Tabs, TabsContent, TabsList, TabsTrigger } from "../../../../../components/ui/tabs";
import ArgumentsGeneral from './general'
import ArgumentsList from './list'
import ArgumentsForm from './form'

export default function WidgetArguments() {
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
                    name: "Arguments",
                    url: "/projects/1/widgets/arguments"
                }
            ]}
            >
                <div>
                    <Tabs defaultValue="general">
                        <TabsList className="w-full">
                            <TabsTrigger value="general">Algemeen</TabsTrigger>
                            <TabsTrigger value="list">Lijst</TabsTrigger>
                            <TabsTrigger value="form">Formulier</TabsTrigger>
                        </TabsList>
                        <TabsContent value="general" className="w-1/2">
                            <ArgumentsGeneral />
                        </TabsContent> 
                        <TabsContent value="list" className="w-1/2">
                            <ArgumentsList />
                        </TabsContent> 
                        <TabsContent value="form" className="w-1/2">
                            <ArgumentsForm />
                        </TabsContent> 
                    </Tabs>
                    <div className="w-1/2">
                        <Button variant={"default"} className="float-right">
                            Opslaan
                        </Button>
                    </div>
                </div>
            </PageLayout>
        </div>
    )
}