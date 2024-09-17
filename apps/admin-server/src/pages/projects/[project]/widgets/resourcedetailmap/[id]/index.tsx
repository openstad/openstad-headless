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
import type { ResourceDetailMapWidgetProps } from '@openstad-headless/leaflet-map/src/types/resource-detail-map-widget-props';
import WidgetResourceDetailMapGeneral from './general';


export const getServerSideProps = withApiUrl;

export default function WidgetResourceDetailMap({
  apiUrl,
}:WithApiUrlProps) {
  const router = useRouter();
  const id = router.query.id;
  const projectId = router.query.project as string;

    const { data: widget, updateConfig } = useWidgetConfig<ResourceDetailMapWidgetProps>();
    const { previewConfig, updatePreview } =
      useWidgetPreview<ResourceDetailMapWidgetProps>({
        projectId,
      });
  
      const totalPropPackage = {
        ...widget?.config,
        ...previewConfig,
        updateConfig: (config: ResourceDetailMapWidgetProps) =>
          updateConfig({ ...widget.config, ...config }),
    
        onFieldChanged: (key: string, value: any) => {
          if (previewConfig) {
            updatePreview({
              ...previewConfig,
              [key]: value,
            });
          }
        },
        projectId,
      };

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
            name: 'Inzending overzicht kaart',
            url: `/projects/${projectId}/widgets/resourcedetailmap/${id}`,
          },
        ]}>
        <div className="container py-6">
          <Tabs defaultValue="general">
            <TabsList className="w-full bg-white border-b-0 mb-4 rounded-md">
              <TabsTrigger value="general">Algemeen</TabsTrigger>
              <TabsTrigger value="publish">Publiceren</TabsTrigger>
            </TabsList>
            <TabsContent value="general" className="p-0">
              {previewConfig &&  <WidgetResourceDetailMapGeneral {...totalPropPackage}/>}
             
            </TabsContent>
            <TabsContent value="publish" className="p-0">
              <WidgetPublish apiUrl={apiUrl} />
            </TabsContent>
          </Tabs>

          <div className="container py-6 mt-6 bg-white rounded-md">
            {previewConfig && (
              <>
                <WidgetPreview
                  type="resourcedetailmap"
                  config={previewConfig}
                  projectId={projectId as string}
                />
              </>
            )}
          </div>
        </div>
      </PageLayout>
    </div>
  );
}
