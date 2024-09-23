import React from 'react';
import { PageLayout } from '../../../../../../components/ui/page-layout';
import {
  Tabs,
  TabsContent,
  TabsList,
  TabsTrigger,
} from '../../../../../../components/ui/tabs';
import { useRouter } from 'next/router';
import { WithApiUrlProps, withApiUrl } from '@/lib/server-side-props-definition';
import WidgetPublish from '@/components/widget-publish';
import { useWidgetConfig } from '@/hooks/use-widget-config';
import { useWidgetPreview } from '@/hooks/useWidgetPreview';
import WidgetPreview from '@/components/widget-preview';
import type { BaseMapWidgetProps } from '@openstad-headless/leaflet-map/src/types/basemap-widget-props';


export const getServerSideProps = withApiUrl;

export default function WidgetBaseMap({
  apiUrl,
}:WithApiUrlProps) {
  const router = useRouter();
  const id = router.query.id;
  const projectId = router.query.project as string;

    const { data: widget, updateConfig } = useWidgetConfig<BaseMapWidgetProps>();
    const { previewConfig, updatePreview } =
      useWidgetPreview<BaseMapWidgetProps>({
        projectId,
      });
  

  return (
    <div>
      <PageLayout
        pageHeader="Projectnaam"
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
            name: 'Base Map',
            url: `/projects/${projectId}/widgets/basemap/${id}`,
          },
        ]}>
        <div className="container py-6">
          <Tabs defaultValue="publish">
            <TabsList className="w-full bg-white border-b-0 mb-4 rounded-md">
              <TabsTrigger value="publish">Publiceren</TabsTrigger>
            </TabsList>
            <TabsContent value="publish" className="p-0">
              <WidgetPublish apiUrl={apiUrl} />
            </TabsContent>
          </Tabs>

          {/* <div className="container py-6 mt-6 bg-white rounded-md">
            {previewConfig && (
              <>
                <WidgetPreview
                  type="basemap"
                  config={previewConfig}
                  projectId={projectId as string}
                />
              </>
            )}
          </div> */}
        </div>
      </PageLayout>
    </div>
  );
}
