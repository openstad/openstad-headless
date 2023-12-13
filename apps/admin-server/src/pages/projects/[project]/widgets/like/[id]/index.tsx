import React from 'react';
import { PageLayout } from '../../../../../../components/ui/page-layout';
import {
  Tabs,
  TabsContent,
  TabsList,
  TabsTrigger,
} from '../../../../../../components/ui/tabs';
import LikesDisplay from './weergave';
import { useRouter } from 'next/router';
import Preview from '../../../../../../components/widget-preview';

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
            name: 'Argumenten',
            url: `/projects/${projectId}/widgets/like/${id}`,
          },
        ]}>
        <div className="container py-6">
          <Tabs defaultValue="preview">
            <TabsList className="w-full bg-white border-b-0 mb-4 rounded-md">
              <TabsTrigger value="preview">Preview</TabsTrigger>
              <TabsTrigger value="display">Instellingen</TabsTrigger>
            </TabsList>
            <TabsContent value="display" className="p-0">
              <LikesDisplay />
            </TabsContent>
            <TabsContent value="preview" className="p-0">
              <Preview type="like" />
            </TabsContent>
          </Tabs>
        </div>
      </PageLayout>
    </div>
  );
}
