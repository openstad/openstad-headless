import React from 'react'
import { PageLayout } from "../../../../../components/ui/page-layout"
import { Button } from '../../../../../components/ui/button'
import { Tabs, TabsContent, TabsList, TabsTrigger } from "../../../../../components/ui/tabs";
import WidgetResourceOverviewGeneral from './general';
import WidgetResourceOverviewImage from './image';
import WidgetResourceOverviewDisplay from './display';
import WidgetResourceOverviewButton from './button';
import WidgetResourceOverviewSorting from './sorting';
import WidgetResourceOverviewPagination from './pagination';
import WidgetResourceOverviewFilter from './filter';
import WidgetResourceOverviewSearch from './search';
import WidgetResourceOverviewTags from './tags';
import WidgetResourceOverviewInclude from './include';
import WidgetResourceOverviewLabel from './label';
import WidgetResourceOverviewInfo from './info';

export default function WidgetResourceOverview() {
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
                    name: "Resource Overview",
                    url: "/projects/1/widgets/resourceoverview"
                }
            ]}
            >
                <div>
                    <Tabs defaultValue="general">
                        <TabsList className="w-full">
                            <TabsTrigger value="general">Algemeen</TabsTrigger>
                            <TabsTrigger value="image">Afbeeldingen</TabsTrigger>
                            <TabsTrigger value="display">Display</TabsTrigger>
                            <TabsTrigger value="button">Knop teksten</TabsTrigger>
                            <TabsTrigger value="sorting">Sorteren</TabsTrigger>
                            <TabsTrigger value="pagination">Pagination</TabsTrigger>
                            <TabsTrigger value="filter">Filters</TabsTrigger>
                            <TabsTrigger value="search">Zoeken</TabsTrigger>
                            <TabsTrigger value="tags">Tags</TabsTrigger>
                            <TabsTrigger value="include">Inclusief/exclusief</TabsTrigger>
                            <TabsTrigger value="labels">Labels</TabsTrigger>
                            <TabsTrigger value="info">Info</TabsTrigger>
                        </TabsList>
                        <TabsContent value="general" className="w-1/2">
                            <WidgetResourceOverviewGeneral />
                        </TabsContent>
                        <TabsContent value="image" className="w-1/2">
                            <WidgetResourceOverviewImage />
                        </TabsContent>
                        <TabsContent value="display" className="w-1/2">
                            <WidgetResourceOverviewDisplay />
                        </TabsContent>
                        <TabsContent value="button" className="w-1/2">
                            <WidgetResourceOverviewButton />
                        </TabsContent>
                        <TabsContent value="sorting" className="w-1/2">
                            <WidgetResourceOverviewSorting />
                        </TabsContent>
                        <TabsContent value="pagination" className="w-1/2">
                            <WidgetResourceOverviewPagination />
                        </TabsContent>
                        <TabsContent value="filter" className="w-1/2">
                            <WidgetResourceOverviewFilter />
                        </TabsContent>
                        <TabsContent value="search" className="w-1/2">
                            <WidgetResourceOverviewSearch />
                        </TabsContent>
                        <TabsContent value="tags" className="w-1/2">
                            <WidgetResourceOverviewTags />
                        </TabsContent>
                        <TabsContent value="include" className="w-1/2">
                            <WidgetResourceOverviewInclude />
                        </TabsContent>
                        <TabsContent value="labels" className="w-1/2">
                            <WidgetResourceOverviewLabel />
                        </TabsContent>
                        <TabsContent value="info" className="w-1/2">
                            <WidgetResourceOverviewInfo />
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