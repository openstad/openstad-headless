import React from 'react';
import { PageLayout } from '../../../../../../components/ui/page-layout';
import {
  Tabs,
  TabsContent,
  TabsList,
  TabsTrigger,
} from '../../../../../../components/ui/tabs';
import WidgetMapGeneral from './general';
import WidgetMapMap from './map';
import WidgetMapContent from './content';
import WidgetMapSort from './sort';
import WidgetMapImage from './images';
import WidgetMapDetails from './details';
import WidgetMapFilter from './filter';
import WidgetMapReaction from './reaction';
import { useRouter } from 'next/router';

export default function WidgetMap() {
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
            name: 'Map',
            url: `/projects/${projectId}/widgets/map/${id}`,
          },
        ]}>
        <div className="container py-6">
          <Tabs defaultValue="general">
            <TabsList className="w-full bg-white border-b-0 mb-4 rounded-md h-fit flex flex-wrap overflow-auto">
              <TabsTrigger value="general">Algemeen</TabsTrigger>
              <TabsTrigger value="map">Kaart</TabsTrigger>
              <TabsTrigger value="content">Content</TabsTrigger>
              <TabsTrigger value="sort">Sorteren</TabsTrigger>
              <TabsTrigger value="images">Idee afbeeldingen</TabsTrigger>
              <TabsTrigger value="details">Idee details</TabsTrigger>
              <TabsTrigger value="filter">Filterbalk</TabsTrigger>
              <TabsTrigger value="reaction">Reacties</TabsTrigger>
            </TabsList>
            <TabsContent value="general" className="p-0">
              <WidgetMapGeneral />
            </TabsContent>
            <TabsContent value="map" className="p-0">
              <WidgetMapMap />
            </TabsContent>
            <TabsContent value="content" className="p-0">
              <WidgetMapContent />
            </TabsContent>
            <TabsContent value="sort" className="p-0">
              <WidgetMapSort />
            </TabsContent>
            <TabsContent value="images" className="p-0">
              <WidgetMapImage />
            </TabsContent>
            <TabsContent value="details" className="p-0">
              <WidgetMapDetails />
            </TabsContent>
            <TabsContent value="filter" className="p-0">
              <WidgetMapFilter />
            </TabsContent>
            <TabsContent value="reaction" className="p-0">
              <WidgetMapReaction />
            </TabsContent>
          </Tabs>
        </div>
      </PageLayout>
    </div>
  );
}
