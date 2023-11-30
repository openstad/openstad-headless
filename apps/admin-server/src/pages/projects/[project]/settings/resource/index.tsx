import * as React from 'react';

import { PageLayout } from '@/components/ui/page-layout';
import { useRouter } from 'next/router';
import { Tabs, TabsContent, TabsList, TabsTrigger } from '@/components/ui/tabs';
import ProjectSettingsResourceGeneral from './general';

export default function ProjectSettingsResource() {
  const router = useRouter();
  const { project } = router.query;

  return (
    <div>
      <PageLayout
        pageHeader="Projecten"
        breadcrumbs={[
          {
            name: 'Projecten',
            url: '/projects',
          },
          {
            name: 'Instellingen',
            url: `/projects/${project}/settings`,
          },
          {
            name: 'Resource',
            url: `/projects/${project}/settings/resource`,
          },
        ]}>
        <div className="container py-6">
          <Tabs defaultValue="preview">
            <TabsList className="w-full bg-white border-b-0 mb-4 rounded-md">
              <TabsTrigger value="form">Form</TabsTrigger>
            </TabsList>
            <TabsContent value="form" className="p-0">
              <ProjectSettingsResourceGeneral />
            </TabsContent>
          </Tabs>
        </div>
      </PageLayout>
    </div>
  );
}