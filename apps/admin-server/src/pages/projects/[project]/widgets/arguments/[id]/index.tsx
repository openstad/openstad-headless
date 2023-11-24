import React from 'react';
import { PageLayout } from '../../../../../../components/ui/page-layout';
import {
  Tabs,
  TabsContent,
  TabsList,
  TabsTrigger,
} from '../../../../../../components/ui/tabs';
import ArgumentsGeneral from './general';
import ArgumentsList from './list';
import ArgumentsForm from './form';
import { useRouter } from 'next/router';
import Preview from '@/components/widget-preview';

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
            url: `/projects/${projectId}/widgets/arguments/${id}`,
          },
        ]}>
        <div className="container py-6">
          <Tabs defaultValue="preview">
            <TabsList className="w-full bg-white border-b-0 mb-4 rounded-md">
              <TabsTrigger value="preview">Algemeen</TabsTrigger>
              <TabsTrigger value="general">Algemeen</TabsTrigger>
              <TabsTrigger value="list">Lijst</TabsTrigger>
              <TabsTrigger value="form">Formulier</TabsTrigger>
            </TabsList>
            <TabsContent value="preview" className="p-0">
              <Preview type="arguments" />
            </TabsContent>
            <TabsContent value="general" className="p-0">
              <ArgumentsGeneral />
            </TabsContent>
            <TabsContent value="list" className="p-0">
              <ArgumentsList />
            </TabsContent>
            <TabsContent value="form" className="p-0">
              <ArgumentsForm />
            </TabsContent>
          </Tabs>
        </div>
      </PageLayout>
    </div>
  );
}
