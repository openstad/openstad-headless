import React from 'react';
import { PageLayout } from '../../../../../../components/ui/page-layout';
import {
  Tabs,
  TabsContent,
  TabsList,
  TabsTrigger,
} from '../../../../../../components/ui/tabs';
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
import WidgetResourceOverviewSearch from '../../resourceoverview/[id]/search';
import WidgetResourceOverviewDisplay from '../../resourceoverview/[id]/display';
import WidgetResourceOverviewGeneral from '../../resourceoverview/[id]/general';
import WidgetResourceOverviewInclude from '../../resourceoverview/[id]/include';
import WidgetResourceOverviewPagination from '../../resourceoverview/[id]/pagination';
import WidgetResourceOverviewSorting from '../../resourceoverview/[id]/sorting';
import WidgetResourceOverviewTags from '../../resourceoverview/[id]/tags';
import WidgetResourcesMapMap from '../../resourcesmap/[id]/map';
import WidgetResourcesMapButtons from '../../resourcesmap/[id]/buttons';
import WidgetResourcesMapPolygons from '../../resourcesmap/[id]/polygons';
import { extractConfig } from '@/lib/sub-widget-helper';
import { ResourceOverviewMapWidgetTabProps } from '../../resourcesmap/[id]';

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

  const totalPropPackageOverview = {
    ...widget?.config,
    ...previewConfig,
    updateConfig: (config: ResourceOverviewWidgetProps) =>
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
            name: 'Interactieve kaart',
            url: `/projects/${projectId}/widgets/resourcewithmap/${id}`,
          },
        ]}>
        <div className="container py-6">
          <Tabs defaultValue="resources">
            <TabsList className="w-full bg-white border-b-0 mb-4 rounded-md h-fit flex flex-wrap overflow-auto">
              <TabsTrigger value="resources">Resources</TabsTrigger>
              <TabsTrigger value="map">Kaart</TabsTrigger>
              <TabsTrigger value="publish">Publiceren</TabsTrigger>
            </TabsList>
            {previewConfig ? (
              <>
                <TabsContent value="resources">
                  <Tabs defaultValue="general">
                    <TabsList className="w-full bg-white border-b-0 mb-4 rounded-md h-fit flex flex-wrap overflow-auto">
                      <TabsTrigger value="general">Algemeen</TabsTrigger>
                      <TabsTrigger value="display">Weergave</TabsTrigger>
                      <TabsTrigger value="tags">Tags</TabsTrigger>
                      <TabsTrigger value="search">Zoeken</TabsTrigger>
                      <TabsTrigger value="sorting">Sorteren</TabsTrigger>
                      <TabsTrigger value="pagination">Paginering</TabsTrigger>
                      <TabsTrigger value="include">
                        Inclusief/exclusief
                      </TabsTrigger>
                    </TabsList>
                    <TabsContent value="general" className="p-0">
                      <WidgetResourceOverviewGeneral
                        {...totalPropPackageOverview}
                      />
                    </TabsContent>
                    <TabsContent value="display" className="p-0">
                      <WidgetResourceOverviewDisplay
                        {...totalPropPackageOverview}
                      />
                    </TabsContent>
                    <TabsContent value="sorting" className="p-0">
                      <WidgetResourceOverviewSorting
                        {...totalPropPackageOverview}
                      />
                    </TabsContent>
                    <TabsContent value="pagination" className="p-0">
                      <WidgetResourceOverviewPagination
                        {...totalPropPackageOverview}
                      />
                    </TabsContent>
                    <TabsContent value="search" className="p-0">
                      <WidgetResourceOverviewSearch
                        {...totalPropPackageOverview}
                      />
                    </TabsContent>
                    <TabsContent value="tags" className="p-0">
                      <WidgetResourceOverviewTags
                        {...totalPropPackageOverview}
                      />
                    </TabsContent>
                    <TabsContent value="include" className="p-0">
                      <WidgetResourceOverviewInclude
                        {...totalPropPackageOverview}
                      />
                    </TabsContent>
                    <TabsContent value="publish" className="p-0">
                      <WidgetPublish apiUrl={apiUrl} />
                    </TabsContent>
                  </Tabs>
                </TabsContent>
                <TabsContent value="map">
                  <Tabs defaultValue="map">
                    <TabsList className="w-full bg-white border-b-0 mb-4 rounded-md">
                      <TabsTrigger value="map">Kaart</TabsTrigger>
                      <TabsTrigger value="polygons">Polygonen</TabsTrigger>
                      <TabsTrigger value="button">Knoppen</TabsTrigger>
                    </TabsList>

                    <TabsContent value="map" className="p-0">
                      <WidgetResourcesMapMap
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
                    <TabsContent value="button" className="p-0">
                      <WidgetResourcesMapButtons
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
                <TabsContent value="publish" className="p-0">
                  <WidgetPublish apiUrl={apiUrl} />
                </TabsContent>
              </>
            ) : null}
          </Tabs>

          <div className="py-6 mt-6 bg-white rounded-md">
            {previewConfig ? (
              <WidgetPreview
                type="resourcewithmap"
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
