import WidgetPreview from '@/components/widget-preview';
import WidgetPublish from '@/components/widget-publish';
import { useWidgetConfig } from '@/hooks/use-widget-config';
import { useWidgetPreview } from '@/hooks/useWidgetPreview';
import {
  WithApiUrlProps,
  withApiUrl,
} from '@/lib/server-side-props-definition';
import { extractConfig } from '@/lib/sub-widget-helper';
import { LikeWidgetTabProps } from '@/pages/projects/[project]/widgets/likes/[id]';
import LikesDisplay from '@/pages/projects/[project]/widgets/likes/[id]/weergave';
import WidgetMultiProjectSettings from '@/pages/projects/[project]/widgets/multiprojectresourceoverview/[id]/settings';
import WidgetResourceOverviewInclude from '@/pages/projects/[project]/widgets/resourceoverview/[id]/include';
import WidgetResourceOverviewTags from '@/pages/projects/[project]/widgets/resourceoverview/[id]/tags';
import { ResourceOverviewWidgetProps } from '@openstad-headless/resource-overview/src/resource-overview';
import { useRouter } from 'next/router';
import React from 'react';

import { PageLayout } from '../../../../../../components/ui/page-layout';
import {
  Tabs,
  TabsContent,
  TabsList,
  TabsTrigger,
} from '../../../../../../components/ui/tabs';
import WidgetResourceOverviewDisplay from '../../resourceoverview/[id]/display';
import WidgetResourceOverviewGeneral from '../../resourceoverview/[id]/general';
import WidgetResourceOverviewPagination from '../../resourceoverview/[id]/pagination';
import WidgetResourceOverviewSearch from '../../resourceoverview/[id]/search';
import WidgetResourceOverviewSorting from '../../resourceoverview/[id]/sorting';
import { ResourceOverviewMapWidgetTabProps } from '../../resourcesmap/[id]';
import WidgetResourcesMapButton from '../../resourcesmap/[id]/buttons';
import WidgetResourcesMapMap from '../../resourcesmap/[id]/map';
import WidgetResourcesMapPolygons from '../../resourcesmap/[id]/polygons';

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
      if (previewConfig) {
        updatePreview({
          ...previewConfig,
          [key]: value,
        });
      }
    },
    projectId,
    selectedProjects: widget?.config?.selectedProjects || [],
    widgetName: 'multiprojectresourceoverview',
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
            name: 'Multi project inzending overzicht',
            url: `/projects/${projectId}/widgets/multiprojectresourceoverview/${id}`,
          },
        ]}>
        <div className="container py-6">
          <Tabs defaultValue="settings">
            <TabsList className="w-full bg-white border-b-0 mb-4 rounded-md h-fit flex flex-wrap overflow-auto">
              <TabsTrigger value="general">Algemeen</TabsTrigger>
              <TabsTrigger value="display">Weergave</TabsTrigger>
              <TabsTrigger value="map">Kaart widget</TabsTrigger>
              <TabsTrigger value="tags">Tags</TabsTrigger>
              <TabsTrigger value="search">Zoeken</TabsTrigger>
              <TabsTrigger value="sorting">Sorteren</TabsTrigger>
              <TabsTrigger value="pagination">Paginering</TabsTrigger>
              <TabsTrigger value="include">Inclusief/exclusief</TabsTrigger>
              <TabsTrigger value="likes">Likes widget</TabsTrigger>
              <TabsTrigger value="settings">
                Instellingen multi project
              </TabsTrigger>
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
                          widgetName: 'multiprojectresourceoverview',
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
                  <WidgetResourceOverviewInclude
                    {...totalPropPackage}
                    isMultiProjectResourceOverview={true}
                  />
                </TabsContent>
                <TabsContent value="likes" className="p-0">
                  {previewConfig && (
                    <>
                      <p
                        style={{
                          backgroundColor: 'orange',
                          color: 'white',
                          fontSize: '14px',
                          fontWeight: 'bold',
                          marginBottom: '5px',
                          padding: '5px 10px',
                          width: 'auto',
                          display: 'inline-block',
                          borderRadius: '6px',
                        }}>
                        Let op! Deze instellingen zijn voor het type weergave
                        &apos;Inzendingen op de huidige pagina tonen, in een
                        dialog.&apos;
                        <br />
                        Bij het tabje &apos;Weergave&apos; moet je ook
                        aangevinkt hebben dat je likes wilt tonen. Als beide
                        niet zo zijn ingesteld, dan zullen de likes niet getoond
                        worden.
                      </p>
                      <LikesDisplay
                        omitSchemaKeys={['resourceId']}
                        {...extractConfig<
                          ResourceOverviewWidgetProps,
                          LikeWidgetTabProps
                        >({
                          subWidgetKey: 'resourceOverviewMapWidget',
                          previewConfig: previewConfig,
                          updateConfig,
                          updatePreview,
                        })}
                      />
                    </>
                  )}
                </TabsContent>
                <TabsContent value="settings" className="p-0">
                  <WidgetMultiProjectSettings {...totalPropPackage} />
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
                type="multiprojectresourceoverview"
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
