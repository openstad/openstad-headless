import React from 'react';
import { PageLayout } from '../../../../../../components/ui/page-layout';
import { Button } from '../../../../../../components/ui/button';
import {
  Tabs,
  TabsContent,
  TabsList,
  TabsTrigger,
} from '../../../../../../components/ui/tabs';
import WidgetIdeasMapMaps from './maps';
import WidgetIdeasMapButton from './button';
import WidgetIdeasMapCounter from './counter';
import WidgetIdeasMapContent from './content';
import { useRouter } from 'next/router';

export default function WidgetIdeasMap() {
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
            name: 'Ideeën Map',
            url: `/projects/${projectId}/widgets/ideasmap/${id}`,
          },
        ]}>
        <div className="container py-6">
          <Tabs defaultValue="map">
            <TabsList className="w-full bg-white border-b-0 mb-4 rounded-md">
              <TabsTrigger value="map">Map</TabsTrigger>
              <TabsTrigger value="button">Call-To-Action knop</TabsTrigger>
              <TabsTrigger value="counter">Teller</TabsTrigger>
              <TabsTrigger value="content">Content</TabsTrigger>
            </TabsList>
            <TabsContent value="map" className="p-0">
              <WidgetIdeasMapMaps />
            </TabsContent>
            <TabsContent value="button" className="p-0">
              <WidgetIdeasMapButton />
            </TabsContent>
            <TabsContent value="counter" className="p-0">
              <WidgetIdeasMapCounter />
            </TabsContent>
            <TabsContent value="content" className="p-0">
              <WidgetIdeasMapContent />
            </TabsContent>
          </Tabs>
        </div>
      </PageLayout>
    </div>
  );
}
