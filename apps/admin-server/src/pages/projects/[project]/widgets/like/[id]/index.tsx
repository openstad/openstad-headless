import React from 'react';
import { PageLayout } from '@/components/ui/page-layout';
import {
  Tabs,
  TabsContent,
  TabsList,
  TabsTrigger,
} from '@/components/ui/tabs';
import LikesDisplay from './weergave';
import { useRouter } from 'next/router';
import WidgetPreview from '@/components/widget-preview';
import WidgetPublish from "@/components/widget-publish";

export default function WidgetArguments() {
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
            name: 'Likes',
            url: `/projects/${projectId}/widgets/like/${id}`,
          },
        ]}>
        <div className="container py-6">
          <Tabs defaultValue="preview">
            <TabsList className="w-full bg-white border-b-0 mb-4 rounded-md">
              <TabsTrigger value="display">Instellingen</TabsTrigger>
              <TabsTrigger value="publish">Publiceren</TabsTrigger>
            </TabsList>
            <TabsContent value="display" className="p-0">
              <LikesDisplay />
            </TabsContent>
            <TabsContent value="publish" className="p-0">
              <WidgetPublish />
            </TabsContent>
          </Tabs>

            <div className="py-6 mt-6 bg-white rounded-md">
              <WidgetPreview type="like" projectId={projectId} />
            </div>
        </div>
      </PageLayout>
    </div>
  );
}
