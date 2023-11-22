import React from 'react';
import { PageLayout } from '../../../../../../components/ui/page-layout';
import { useRouter } from 'next/router';
import ChoicesSelectorForm from './form';
import {
  Tabs,
  TabsContent,
  TabsList,
  TabsTrigger,
} from '../../../../../../components/ui/tabs';
import Preview from '@/components/widget-preview';

export default function WidgetKeuzewijzer() {
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
            name: 'Keuzewijzer',
            url: `/projects/${projectId}/widgets/keuzewijzer/${id}`,
          },
        ]}>
        <div className="container py-6">
          <Tabs defaultValue="preview">
            <TabsList className="w-full bg-white border-b-0 mb-4 rounded-md">
              <TabsTrigger value="preview">Preview</TabsTrigger>
              <TabsTrigger value="form">Form</TabsTrigger>
            </TabsList>
            <TabsContent value="form" className="p-0">
              <ChoicesSelectorForm />
            </TabsContent>
            <TabsContent value="preview" className="p-0">
              <Preview type="keuzewijzer" />
            </TabsContent>
          </Tabs>
        </div>
      </PageLayout>
    </div>
  );
}
