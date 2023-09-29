import React from 'react'
import { PageLayout } from "../../../../../components/ui/page-layout"
import { Button } from '../../../../../components/ui/button'
import { Tabs, TabsContent, TabsList, TabsTrigger } from "../../../../../components/ui/tabs";
import WidgetMapGeneral from './general';
import WidgetMapMap from './map';
import WidgetMapContent from './content';
import WidgetMapSort from './sort';
import WidgetMapImage from './images';
import WidgetMapDetails from './details';
import WidgetMapFilter from './filter';
import WidgetMapReaction from './reaction';

export default function WidgetMap() {
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
                    url: "/projects/1/widgets/map"
                }
            ]}
            >
                <div>
                    <Tabs defaultValue="general">
                        <TabsList className="w-full">
                            <TabsTrigger value="general">Algemeen</TabsTrigger>
                            <TabsTrigger value="map">Kaart</TabsTrigger>
                            <TabsTrigger value="content">Content</TabsTrigger>
                            <TabsTrigger value="sort">Sorteren</TabsTrigger>
                            <TabsTrigger value="images">Idee afbeeldingen</TabsTrigger>
                            <TabsTrigger value="details">Idee details</TabsTrigger>
                            <TabsTrigger value="filter">Filterbalk</TabsTrigger>
                            <TabsTrigger value="reaction">Reacties</TabsTrigger>
                        </TabsList>
                        <TabsContent value="general" className="w-1/2">
                            <WidgetMapGeneral />
                        </TabsContent>
                        <TabsContent value="map" className="w-1/2">
                            <WidgetMapMap />
                        </TabsContent>
                        <TabsContent value="content" className="w-1/2">
                            <WidgetMapContent />
                        </TabsContent>
                        <TabsContent value="sort" className="w-1/2">
                            <WidgetMapSort />
                        </TabsContent>
                        <TabsContent value="images" className="w-1/2">
                            <WidgetMapImage />
                        </TabsContent>
                        <TabsContent value="details" className="w-1/2">
                            <WidgetMapDetails />
                        </TabsContent>
                        <TabsContent value="filter" className="w-1/2">
                            <WidgetMapFilter />
                        </TabsContent>
                        <TabsContent value="reaction" className="w-1/2">
                            <WidgetMapReaction />
                        </TabsContent>
                    </Tabs>
                </div>
            </PageLayout>
        </div>
    )
}