import React from 'react';
import { PageLayout } from '../../../../../../components/ui/page-layout';
import {
  Tabs,
  TabsContent,
  TabsList,
  TabsTrigger,
} from '../../../../../../components/ui/tabs';
import WidgetResourceDetailGeneral from './general';
import WidgetResourceDetailDisplay from './display';
import { useRouter } from 'next/router';
import { useWidgetConfig } from '@/hooks/use-widget-config';
import { useWidgetPreview } from '@/hooks/useWidgetPreview';
import { ResourceDetailWidgetProps } from '@openstad-headless/resource-detail-with-map/src/resourceDetailWithMap';

import WidgetResourcesMapMap from '../../resourcesmap/[id]/map';
import WidgetResourcesMapButtons from '../../resourcesmap/[id]/buttons';
import { ResourceOverviewMapWidgetProps } from '@openstad-headless/leaflet-map/src/types/resource-overview-map-widget-props';
import { EditFieldProps } from '@/lib/form-widget-helpers/EditFieldProps';

import WidgetPreview from '@/components/widget-preview';
import {
  WithApiUrlProps,
  withApiUrl,
} from '@/lib/server-side-props-definition';
import WidgetPublish from '@/components/widget-publish';
export const getServerSideProps = withApiUrl;

export default function WidgetResourceDetail({ apiUrl }: WithApiUrlProps) {
  const router = useRouter();
  const id = router.query.id;
  const projectId = router.query.project as string;

  const { data: widget, updateConfig } =
    useWidgetConfig<ResourceDetailWidgetProps>();
  const { previewConfig, updatePreview } =
    useWidgetPreview<ResourceDetailWidgetProps>({
      projectId,
    });

  const totalPropPackageMap: ResourceOverviewMapWidgetProps & EditFieldProps<ResourceOverviewMapWidgetProps> = {
    ...(widget?.config || {}),
    ...(previewConfig || {}),
    marker: {
      // provide default values for the marker properties
    },
    markerIcon: {
      // provide default values for the markerIcon properties
    },
    updateConfig: (config: ResourceOverviewMapWidgetProps) =>
      updateConfig({ ...(widget?.config || {}), ...config }),
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
            name: 'Inzending interactieve kaart',
            url: `/projects/${projectId}/widgets/resourcedetail/${id}`,
          },
        ]}>
        <div className="container py-6">
          <Tabs defaultValue="resources">
            <TabsList className="w-full bg-white border-b-0 mb-4 rounded-md h-fit flex flex-wrap overflow-auto">
              <TabsTrigger value="resources">Resources</TabsTrigger>
              <TabsTrigger value="map">Kaart</TabsTrigger>
              <TabsTrigger value="publish">Publiceren</TabsTrigger>
            </TabsList>

            <TabsContent value="resources">
              <Tabs defaultValue="general">
                <TabsList className="w-full bg-white border-b-0 mb-4 rounded-md h-fit flex flex-wrap overflow-auto">
                  <TabsTrigger value="general">Algemeen</TabsTrigger>
                  <TabsTrigger value="display">Weergave</TabsTrigger>
                </TabsList>
                <TabsContent value="general" className="p-0">
                  {previewConfig && (
                    <WidgetResourceDetailGeneral
                      {...previewConfig}
                      updateConfig={(config) =>
                        updateConfig({ ...widget.config, ...config })
                      }
                      onFieldChanged={(key, value) => {
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
                <TabsContent value="display" className="p-0">
                  {previewConfig && (
                    <WidgetResourceDetailDisplay
                      {...previewConfig}
                      updateConfig={(config) =>
                        updateConfig({ ...widget.config, ...config })
                      }
                      onFieldChanged={(key, value) => {
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
              </Tabs>
            </TabsContent>
            <TabsContent value="map">
              <Tabs defaultValue="map">
                <TabsList className="w-full bg-white border-b-0 mb-4 rounded-md">
                  <TabsTrigger value="map">Kaart</TabsTrigger>
                  <TabsTrigger value="button">Knoppen</TabsTrigger>
                </TabsList>


                <TabsContent value="map" className="p-0">
                  <WidgetResourcesMapMap {...totalPropPackageMap} />
                </TabsContent>
                <TabsContent value="button" className="p-0">
                  <WidgetResourcesMapButtons {...totalPropPackageMap} />
                </TabsContent>

              </Tabs>
            </TabsContent>
            <TabsContent value="publish" className="p-0">
              <WidgetPublish apiUrl={apiUrl} />
            </TabsContent>
          </Tabs>
          <div className="container py-6 mt-6 bg-white rounded-md">
            {previewConfig && (
              <>
                <WidgetPreview
                  type="resourcedetailwithmap"
                  config={previewConfig}
                  projectId={projectId as string}
                />
              </>
            )}
          </div>
        </div>
      </PageLayout >
    </div >
  );
}
