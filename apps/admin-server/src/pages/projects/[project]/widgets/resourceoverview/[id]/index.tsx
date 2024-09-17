import React from 'react';
import { PageLayout } from '../../../../../../components/ui/page-layout';
import {
  Tabs,
  TabsContent,
  TabsList,
  TabsTrigger,
} from '../../../../../../components/ui/tabs';
import WidgetResourceOverviewGeneral from './general';
import WidgetResourceOverviewDisplay from './display';
import WidgetResourceOverviewSorting from './sorting';
import WidgetResourceOverviewPagination from './pagination';
import WidgetResourceOverviewSearch from './search';
import WidgetResourceOverviewTags from './tags';
import WidgetResourceOverviewInclude from './include';
import { useRouter } from 'next/router';
import { useWidgetConfig } from '@/hooks/use-widget-config';
import { useWidgetPreview } from '@/hooks/useWidgetPreview';
import { ResourceOverviewWidgetProps } from '@openstad-headless/resource-overview/src/resource-overview';
import WidgetPreview from '@/components/widget-preview';
import WidgetPublish from '@/components/widget-publish';
import {
  WithApiUrlProps,
  withApiUrl,
} from '@/lib/server-side-props-definition';
import WidgetResourcesMapContent from '../../resourcesmap/[id]/content';
import WidgetResourcesMapMap from '../../resourcesmap/[id]/map';
import { ResourceOverviewMapWidgetTabProps } from '../../resourcesmap/[id]';
import WidgetResourcesMapButton from '../../resourcesmap/[id]/buttons';
import WidgetResourcesMapPolygons from '../../resourcesmap/[id]/polygons';
import { extractConfig } from '@/lib/sub-widget-helper';

export const getServerSideProps = withApiUrl;

export default function WidgetResourceOverview({ apiUrl }: WithApiUrlProps) {
  const router = useRouter();
  const id = router.query.id;
  const projectId = router.query.project as string;

  const { data: widget, updateConfig } =
    useWidgetConfig<ResourceOverviewWidgetProps>();
  const { previewConfig, updatePreview } =
    useWidgetPreview<ResourceOverviewWidgetProps>({
      projectId,
    });

  const totalPropPackage = {
    ...widget?.config,
    ...previewConfig,
    updateConfig: (config: ResourceOverviewWidgetProps) =>
      updateConfig({ ...widget.config, ...config }),

    onFieldChanged: (key: string, value: any) => {
      console.log('onFieldChanged', key, value);
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
            name: 'Inzending overzicht tegels',
            url: `/projects/${projectId}/widgets/resourceoverview/${id}`,
          },
        ]}>
        <div className="container py-6">
          <Tabs defaultValue="general">
            <TabsList className="w-full bg-white border-b-0 mb-4 rounded-md h-fit flex flex-wrap overflow-auto">
              <TabsTrigger value="general">Algemeen</TabsTrigger>
              <TabsTrigger value="display">Weergave</TabsTrigger>
              <TabsTrigger value="map">Kaart widget</TabsTrigger>
              <TabsTrigger value="tags">Tags</TabsTrigger>
              <TabsTrigger value="search">Zoeken</TabsTrigger>
              <TabsTrigger value="sorting">Sorteren</TabsTrigger>
              <TabsTrigger value="pagination">Paginering</TabsTrigger>
              <TabsTrigger value="include">Inclusief/exclusief</TabsTrigger>
              <TabsTrigger value="publish">Publiceren</TabsTrigger>
            </TabsList>
            {previewConfig ? (
              <>
                <TabsContent value="general" className="p-0">
                  <WidgetResourceOverviewGeneral {...totalPropPackage} />
                </TabsContent>
                <TabsContent value="display" className="p-0">
                  <WidgetResourceOverviewDisplay {...totalPropPackage} />
                </TabsContent>

                <TabsContent value="map" className="p-0">
                  <Tabs defaultValue="general">
                    <TabsList className="w-full bg-white border-b-0 mb-4 rounded-md h-fit flex flex-wrap overflow-auto">
                      <TabsTrigger value="general">Kaart</TabsTrigger>
                      <TabsTrigger value="polygons">Polygonen</TabsTrigger>
                      <TabsTrigger value="buttons">Knoppen</TabsTrigger>
                    </TabsList>
                    <TabsContent value="general" className="p-0">
                      <WidgetResourcesMapMap
                        {...extractConfig<
                          ResourceOverviewWidgetProps,
                          ResourceOverviewMapWidgetTabProps
                        >({
                          previewConfig: previewConfig,
                          subWidgetKey: 'resourceOverviewMapWidget',
                          updateConfig,
                          updatePreview,
                        })}
                      />
                    </TabsContent>
                    <TabsContent value="buttons" className="p-0">
                      <WidgetResourcesMapButton
                        {...extractConfig<
                          ResourceOverviewWidgetProps,
                          ResourceOverviewMapWidgetTabProps
                        >({
                          previewConfig: previewConfig,
                          subWidgetKey: 'resourceOverviewMapWidget',
                          updateConfig,
                          updatePreview,
                        })}
                      />
                    </TabsContent>
                    <TabsContent value="polygons" className="p-0">
                      <WidgetResourcesMapPolygons
                        {...extractConfig<
                          ResourceOverviewWidgetProps,
                          ResourceOverviewMapWidgetTabProps
                        >({
                          previewConfig,
                          subWidgetKey: 'resourceOverviewMapWidget',
                          updateConfig,
                          updatePreview,
                        })}
                      />
                    </TabsContent>
                  </Tabs>
                </TabsContent>

                <TabsContent value="sorting" className="p-0">
                  <WidgetResourceOverviewSorting {...totalPropPackage} />
                </TabsContent>
                <TabsContent value="pagination" className="p-0">
                  <WidgetResourceOverviewPagination {...totalPropPackage} />
                </TabsContent>
                <TabsContent value="search" className="p-0">
                  <WidgetResourceOverviewSearch {...totalPropPackage} />
                </TabsContent>
                <TabsContent value="tags" className="p-0">
                  <WidgetResourceOverviewTags {...totalPropPackage} />
                </TabsContent>
                <TabsContent value="include" className="p-0">
                  <WidgetResourceOverviewInclude {...totalPropPackage} />
                </TabsContent>
                <TabsContent value="publish" className="p-0">
                  <WidgetPublish apiUrl={apiUrl} />
                </TabsContent>
              </>
            ) : null}
          </Tabs>

          <div className="py-6 mt-6 bg-white rounded-md">
            {previewConfig ? (
              <WidgetPreview
                type="resourceoverview"
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
