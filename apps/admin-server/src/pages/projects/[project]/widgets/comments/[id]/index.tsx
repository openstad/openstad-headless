import React, { useEffect, useState } from 'react';
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
import WidgetPreview from '@/components/widget-preview';
import { CommentsWidgetProps } from '@openstad/comments/src/comments';
import { useWidgetConfig } from '@/hooks/use-widget-config';

export default function WidgetArguments() {
  const router = useRouter();
  const id = router.query.id;
  const projectId = router.query.project;
  const [previewConfig, setPreviewConfig] = useState<CommentsWidgetProps>();

  const {
    data: widget,
    isLoading: isLoadingWidget,
    updateConfig,
  } = useWidgetConfig();

  // Set the preview the first time the widget config is loaded
  useEffect(() => {
    const config = widget?.config;
    if (config) {
      setPreviewConfig({
        projectId,
        resourceId: '2',
        api: {
          url: '/api/openstad',
        },
        title: previewConfig?.title || 'Vind je dit een goed idee?',
        ...config,
      });
    }
  }, [widget]);

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
              <TabsTrigger value="general">Algemeen</TabsTrigger>
              <TabsTrigger value="list">Lijst</TabsTrigger>
              <TabsTrigger value="form">Formulier</TabsTrigger>
            </TabsList>
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

          <div className="py-6 mt-6 bg-white rounded-md">
            {previewConfig ? (
              <WidgetPreview
                type="comments"
                config={previewConfig}
                projectId={projectId as string}
              />
            ) : null}
          </div>
        </div>
      </PageLayout>
    </div>
  );
}
