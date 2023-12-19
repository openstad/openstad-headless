import React from 'react';
import { PageLayout } from '../../../../../../components/ui/page-layout';
import { Button } from '../../../../../../components/ui/button';
import {
  Tabs,
  TabsContent,
  TabsList,
  TabsTrigger,
} from '../../../../../../components/ui/tabs';
import WidgetResourcesMapMaps from './maps';
import WidgetResourcesMapButton from './button';
import WidgetResourcesMapCounter from './counter';
import WidgetResourcesMapContent from './content';
import { useRouter } from 'next/router';
import Preview from '@/components/widget-preview';

export default function WidgetResourcesMap() {
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
            name: 'Resources Map',
            url: `/projects/${projectId}/widgets/resourcesmap/${id}`,
          },
        ]}>
        <div className="container py-6">
          <Tabs defaultValue="preview">
            <TabsList className="w-full bg-white border-b-0 mb-4 rounded-md">
              <TabsTrigger value="preview">Preview</TabsTrigger>
              <TabsTrigger value="map">Map</TabsTrigger>
              <TabsTrigger value="button">Call-To-Action knop</TabsTrigger>
              <TabsTrigger value="counter">Teller</TabsTrigger>
              <TabsTrigger value="content">Content</TabsTrigger>
            </TabsList>
            <TabsContent value="preview" className="p-0">
              {/* <Preview type="resourcesmap" /> */}
            </TabsContent>
            <TabsContent value="map" className="p-0">
              <WidgetResourcesMapMaps />
            </TabsContent>
            <TabsContent value="button" className="p-0">
              <WidgetResourcesMapButton />
            </TabsContent>
            <TabsContent value="counter" className="p-0">
              <WidgetResourcesMapCounter />
            </TabsContent>
            <TabsContent value="content" className="p-0">
              <WidgetResourcesMapContent />
            </TabsContent>
          </Tabs>
        </div>
      </PageLayout>
    </div>
  );
}
