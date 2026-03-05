import { PageLayout } from '@/components/ui/page-layout';
import { Tabs, TabsContent, TabsList, TabsTrigger } from '@/components/ui/tabs';
import WidgetPreview from '@/components/widget-preview';
import WidgetPublish from '@/components/widget-publish';
import { useWidgetConfig } from '@/hooks/use-widget-config';
import { useWidgetPreview } from '@/hooks/useWidgetPreview';
import {
  WithApiUrlProps,
  withApiUrl,
} from '@/lib/server-side-props-definition';
import { useRouter } from 'next/router';
import React from 'react';

import TestResourcesGeneral from './general';

export const getServerSideProps = withApiUrl;

export default function WidgetTestResources({ apiUrl }: WithApiUrlProps) {
  const router = useRouter();
  const id = router.query.id;
  const projectId = router.query.project as string;

  const { data: widget, updateConfig } = useWidgetConfig();
  const { previewConfig, updatePreview } = useWidgetPreview({
    projectId,
  });

  return (
    <div>
      <PageLayout
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
            name: 'Test Resources',
            url: `/projects/${projectId}/widgets/test-resources/${id}`,
          },
        ]}>
        <div className="container py-6">
          <Tabs defaultValue="general">
            <TabsList className="w-full bg-white border-b-0 mb-4 rounded-md">
              <TabsTrigger value="general">Instellingen</TabsTrigger>
              <TabsTrigger value="publish">Publiceren</TabsTrigger>
            </TabsList>
            <TabsContent value="general" className="p-0">
              {previewConfig && (
                <TestResourcesGeneral
                  {...(previewConfig as Record<string, any>)}
                  updateConfig={(config: any) =>
                    updateConfig({
                      ...(widget?.config as Record<string, any>),
                      ...config,
                    })
                  }
                  onFieldChanged={(key: string, value: any) => {
                    if (previewConfig) {
                      updatePreview({
                        ...previewConfig,
                        [key]: value,
                      });
                    }
                  }}
                />
              )}
            </TabsContent>
            <TabsContent value="publish" className="p-0">
              <WidgetPublish apiUrl={apiUrl} />
            </TabsContent>
          </Tabs>

          <div className="py-6 mt-6 bg-white rounded-md">
            {previewConfig && (
              <WidgetPreview
                type="test-resources"
                config={previewConfig}
                projectId={projectId}
              />
            )}
          </div>
        </div>
      </PageLayout>
    </div>
  );
}
