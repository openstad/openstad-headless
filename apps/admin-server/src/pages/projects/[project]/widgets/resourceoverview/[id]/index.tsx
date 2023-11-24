import React from 'react';
import { PageLayout } from '../../../../../../components/ui/page-layout';
import {
  Tabs,
  TabsContent,
  TabsList,
  TabsTrigger,
} from '../../../../../../components/ui/tabs';
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
import { useRouter } from 'next/router';
import Preview from '@/components/widget-preview';

export default function WidgetResourceOverview() {
  const router = useRouter();
  const id = router.query.id;
  const projectId = router.query.project;

  return (
    <div>
      <PageLayout
        pageHeader="Project naam"
        breadcrumbs={[
          {
            name: 'Projecten',
            url: '/projects',
          },
          {
            name: 'Widgets',
            url: `/projects/${projectId}/widgets`,
          },
          {
            name: 'Resource Overview',
            url: `/projects/${projectId}/widgets/resourceoverview/${id}`,
          },
        ]}>
        <div className="container py-6">
          <Tabs defaultValue="preview">
            <TabsList className="w-full bg-white border-b-0 mb-4 rounded-md h-fit flex flex-wrap overflow-auto">
              <TabsTrigger value="preview">Preview</TabsTrigger>
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
            <TabsContent value="preview" className="p-0">
              <Preview type="resourceoverview" />
            </TabsContent>
            <TabsContent value="general" className="p-0">
              <WidgetResourceOverviewGeneral />
            </TabsContent>
            <TabsContent value="image" className="p-0">
              <WidgetResourceOverviewImage />
            </TabsContent>
            <TabsContent value="display" className="p-0">
              <WidgetResourceOverviewDisplay />
            </TabsContent>
            <TabsContent value="button" className="p-0">
              <WidgetResourceOverviewButton />
            </TabsContent>
            <TabsContent value="sorting" className="p-0">
              <WidgetResourceOverviewSorting />
            </TabsContent>
            <TabsContent value="pagination" className="p-0">
              <WidgetResourceOverviewPagination />
            </TabsContent>
            <TabsContent value="filter" className="p-0">
              <WidgetResourceOverviewFilter />
            </TabsContent>
            <TabsContent value="search" className="p-0">
              <WidgetResourceOverviewSearch />
            </TabsContent>
            <TabsContent value="tags" className="p-0">
              <WidgetResourceOverviewTags />
            </TabsContent>
            <TabsContent value="include" className="p-0">
              <WidgetResourceOverviewInclude />
            </TabsContent>
            <TabsContent value="labels" className="p-0">
              <WidgetResourceOverviewLabel />
            </TabsContent>
            <TabsContent value="info" className="p-0">
              <WidgetResourceOverviewInfo />
            </TabsContent>
          </Tabs>
        </div>
      </PageLayout>
    </div>
  );
}
