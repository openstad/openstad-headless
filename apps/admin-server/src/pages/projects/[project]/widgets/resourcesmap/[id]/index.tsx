import React from 'react';
import { PageLayout } from '../../../../../../components/ui/page-layout';
import {
  Tabs,
  TabsContent,
  TabsList,
  TabsTrigger,
} from '../../../../../../components/ui/tabs';
import WidgetResourcesMapMap from './map';
import WidgetResourcesMapButtons from './buttons';
import WidgetResourcesMapPolygons from './polygons';
import { useRouter } from 'next/router';
import { useWidgetConfig } from '@/hooks/use-widget-config';
import { useWidgetPreview } from '@/hooks/useWidgetPreview';
import type { ResourceOverviewMapWidgetProps } from '@openstad-headless/leaflet-map/src/types/resource-overview-map-widget-props';
import WidgetPreview from '@/components/widget-preview';
import WidgetPublish from '@/components/widget-publish';
import {
  WithApiUrlProps,
  withApiUrl,
} from '@/lib/server-side-props-definition';
import { BaseProps, ProjectSettingProps } from '@openstad-headless/types';

export const getServerSideProps = withApiUrl;

export type ResourceOverviewMapWidgetTabProps = Omit<
  ResourceOverviewMapWidgetProps,
  keyof Omit<BaseProps, 'projectId'>
>;

export default function WidgetResourcesMap({ apiUrl }: WithApiUrlProps) {
  const router = useRouter();
  const id = router.query.id;
  const projectId = router.query.project as string;

  const { data: widget, updateConfig } =
    useWidgetConfig<ResourceOverviewMapWidgetProps>();
  const { previewConfig, updatePreview } =
    useWidgetPreview<ResourceOverviewMapWidgetProps>({
      projectId,
    });

  const totalPropPackage = {
    ...widget?.config,
    ...previewConfig,
    updateConfig: (config: ResourceOverviewMapWidgetProps) =>
      updateConfig({ ...widget.config, ...config }),

    onFieldChanged: (key: string, value: any) => {
      if (previewConfig) {
        let updatedConfig = {
          ...previewConfig,
          [key]: value,
        }
        if (key == 'categorize.categorizeByField') updatedConfig.categorize = { categorizeByField: value };
        if (key == 'clustering.isActive') updatedConfig.clustering = { isActive: value };
        updatePreview(updatedConfig);
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
            name: 'Resource Map',
            url: `/projects/${projectId}/widgets/resourcesmap/${id}`,
          },
        ]}>
        <div className="container py-6">
          <Tabs defaultValue="map">
            <TabsList className="w-full bg-white border-b-0 mb-4 rounded-md">
              <TabsTrigger value="map">Kaart</TabsTrigger>
              <TabsTrigger value="button">Knoppen</TabsTrigger>
              <TabsTrigger value="polygons">Polygonen</TabsTrigger>
              <TabsTrigger value="publish">Publiceren</TabsTrigger>
            </TabsList>
            {previewConfig ? (
              <>
                <TabsContent value="map" className="p-0">
                  <WidgetResourcesMapMap
                    {...totalPropPackage}
                  />
                </TabsContent>
                <TabsContent value="button" className="p-0">
                  <WidgetResourcesMapButtons
                    {...totalPropPackage}
                  />
                </TabsContent>
                <TabsContent value="polygons" className="p-0">
                  <WidgetResourcesMapPolygons
                    {...totalPropPackage}
                  />
                </TabsContent>
                <TabsContent value="publish" className="p-0">
                  <WidgetPublish apiUrl={apiUrl} />
                </TabsContent>
              </>
            ) : null}
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
