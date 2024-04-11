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
import { WithApiUrlProps, withApiUrl } from '@/lib/server-side-props-definition';
import WidgetPublish from '@/components/widget-publish';
import { useWidgetConfig } from '@/hooks/use-widget-config';
import { useWidgetPreview } from '@/hooks/useWidgetPreview';
import WidgetPreview from '@/components/widget-preview';

export const getServerSideProps = withApiUrl;

export default function WidgetKeuzewijzer({
  apiUrl,
}: WithApiUrlProps) {
  const router = useRouter();
  const id = router.query.id;
  const projectId = router.query.project;

  const { data: widget, updateConfig } = useWidgetConfig();
  const { previewConfig, updatePreview } = useWidgetPreview({
    projectId,
  });
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
          <Tabs defaultValue="form">
            <TabsList className="w-full bg-white border-b-0 mb-4 rounded-md">
              <TabsTrigger value="form">Form</TabsTrigger>
              <TabsTrigger value="publish">Publiceren</TabsTrigger>
            </TabsList>
            <TabsContent value="form" className="p-0">
              <ChoicesSelectorForm />
            </TabsContent>
            <TabsContent value="publish" className="p-0">
              <WidgetPublish apiUrl={apiUrl} />
            </TabsContent>
          </Tabs>

          <div className='py-6 mt-6 bg-white rounded-md'>
              {previewConfig ? (
                <WidgetPreview
                  type="keuzewijzer"
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
