import React from 'react'
import { PageLayout } from "../../../../../components/ui/page-layout"
import { Button } from '../../../../../components/ui/button'
import { Tabs, TabsContent, TabsList, TabsTrigger } from "../../../../../components/ui/tabs";
import WidgetIdeasMapMaps from './maps';
import WidgetIdeasMapButton from './button';
import WidgetIdeasMapCounter from './counter';
import WidgetIdeasMapContent from './content';

export default function WidgetIdeasMap() {
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
                    name: "Ideeën Map",
                    url: "/projects/1/widgets/ideasmap"
                }
            ]}
            >
                <div>
                    <Tabs defaultValue="map">
                        <TabsList className="w-full">
                            <TabsTrigger value="map">Map</TabsTrigger>
                            <TabsTrigger value="button">Call-To-Action knop</TabsTrigger>
                            <TabsTrigger value="counter">Teller</TabsTrigger>
                            <TabsTrigger value="content">Content</TabsTrigger>
                        </TabsList>
                        <TabsContent value="map" className="w-1/2">
                            <WidgetIdeasMapMaps />
                        </TabsContent>
                        <TabsContent value="button" className="w-1/2">
                            <WidgetIdeasMapButton />
                        </TabsContent>
                        <TabsContent value="counter" className="w-1/2">
                            <WidgetIdeasMapCounter />
                        </TabsContent>
                        <TabsContent value="content" className="w-1/2">
                            <WidgetIdeasMapContent />
                        </TabsContent>
                    </Tabs>
                </div>
            </PageLayout>
        </div>
    )
}