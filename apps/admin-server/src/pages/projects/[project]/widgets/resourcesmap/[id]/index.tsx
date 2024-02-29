import React from 'react';
import { PageLayout } from '../../../../../../components/ui/page-layout';
import { Button } from '../../../../../../components/ui/button';
import {
  Tabs,
  TabsContent,
  TabsList,
  TabsTrigger,
} from '../../../../../../components/ui/tabs';
import WidgetResourcesMapMaps from './maps';
import WidgetResourcesMapButton from './button';
import WidgetResourcesMapCounter from './counter';
import WidgetResourcesMapContent from './content';
import { useRouter } from 'next/router';
import {
  WithApiUrlProps,
  withApiUrl,
} from '@/lib/server-side-props-definition';
import WidgetPublish from '@/components/widget-publish';
import { useWidgetConfig } from '@/hooks/use-widget-config';
import type { ResourceOverviewMapWidgetProps } from '@openstad-headless/leaflet-map/src/types/resource-overview-map-widget-props';
import { useWidgetPreview } from '@/hooks/useWidgetPreview';
import WidgetPreview from '@/components/widget-preview';

export const getServerSideProps = withApiUrl;

export default function WidgetResourcesMap({ apiUrl }: WithApiUrlProps) {
  const router = useRouter();
  const id = router.query.id;
  const projectId = router.query.project as string;

  const { data: widget, updateConfig } = useWidgetConfig();
  const { previewConfig, updatePreview } =
    useWidgetPreview<ResourceOverviewMapWidgetProps>({
      projectId,
    });

    const totalPropPackage = {
      ...widget?.config,
      updateConfig: (config: ResourceOverviewMapWidgetProps) =>
        updateConfig({ ...widget.config, ...config }),
  
      onFieldChanged: (key: keyof ResourceOverviewMapWidgetProps, value: any) => {
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
            name: 'Resources Map',
            url: `/projects/${projectId}/widgets/resourcesmap/${id}`,
          },
        ]}>
        <div className="container py-6">
          <Tabs defaultValue="map">
            <TabsList className="w-full bg-white border-b-0 mb-4 rounded-md">
              <TabsTrigger value="map">Map</TabsTrigger>
              <TabsTrigger value="button">Call-To-Action knop</TabsTrigger>
              <TabsTrigger value="counter">Teller</TabsTrigger>
              <TabsTrigger value="content">Content</TabsTrigger>
              <TabsTrigger value="publish">Publiceren</TabsTrigger>
            </TabsList>

            <TabsContent value="map" className="p-0">
              <WidgetResourcesMapMaps {...totalPropPackage} />
            </TabsContent>
            <TabsContent value="button" className="p-0">
              <WidgetResourcesMapButton {...totalPropPackage}  />
            </TabsContent>
            <TabsContent value="counter" className="p-0">
              <WidgetResourcesMapCounter {...totalPropPackage}  />
            </TabsContent>
            <TabsContent value="content" className="p-0">
              <WidgetResourcesMapContent {...totalPropPackage}  />
            </TabsContent>
            <TabsContent value="publish" className="p-0">
              <WidgetPublish apiUrl={apiUrl} />
            </TabsContent>
          </Tabs>

          <div className="container py-6 mt-6 bg-white rounded-md">
            {previewConfig && (
              <>
                <WidgetPreview
                  type="resourcesmap"
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
