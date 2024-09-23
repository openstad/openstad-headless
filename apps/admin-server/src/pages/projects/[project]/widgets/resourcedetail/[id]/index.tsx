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
import { ResourceDetailWidgetProps } from '@openstad-headless/resource-detail/src/resource-detail';
import WidgetPreview from '@/components/widget-preview';
import {
  WithApiUrlProps,
  withApiUrl,
} from '@/lib/server-side-props-definition';
import WidgetPublish from '@/components/widget-publish';
import ArgumentsGeneral from '../../comments/[id]/general';
import LikesDisplay from '../../likes/[id]/weergave';
import ArgumentsList from '../../comments/[id]/list';
import { ArgumentWidgetTabProps } from '../../comments/[id]';
import ArgumentsForm from '../../comments/[id]/form';
import { LikeWidgetTabProps } from '../../likes/[id]';
import { extractConfig } from '@/lib/sub-widget-helper';
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
            name: 'Inzending detailpagina',
            url: `/projects/${projectId}/widgets/resourcedetail/${id}`,
          },
        ]}>
        <div className="container py-6">
          <Tabs defaultValue="general">
            <TabsList className="w-full bg-white border-b-0 mb-4 rounded-md h-fit flex flex-wrap overflow-auto">
              <TabsTrigger value="general">Algemeen</TabsTrigger>
              <TabsTrigger value="display">Weergave</TabsTrigger>
              <TabsTrigger value="comments">Reacties widget</TabsTrigger>
              <TabsTrigger value="likes">Likes widget</TabsTrigger>
              <TabsTrigger value="publish">Publiceren</TabsTrigger>
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

            <TabsContent value="comments" className="p-0">
              {previewConfig && (
                <Tabs defaultValue="general">
                  <TabsList className="w-full bg-white border-b-0 mb-4 rounded-md h-fit flex flex-wrap overflow-auto">
                    <TabsTrigger value="general">Algemeen</TabsTrigger>
                    <TabsTrigger value="list">Lijst</TabsTrigger>
                    <TabsTrigger value="form">Formulier</TabsTrigger>
                  </TabsList>
                  <TabsContent value="general" className="p-0">
                    <ArgumentsGeneral
                      omitSchemaKeys={['resourceId', 'sentiment']}
                      {...extractConfig<
                        ResourceDetailWidgetProps,
                        ArgumentWidgetTabProps
                      >({
                        subWidgetKey: 'commentsWidget',
                        previewConfig: previewConfig,
                        updateConfig,
                        updatePreview,
                      })}
                    />
                  </TabsContent>

                  <TabsContent value="list" className="p-0">
                    <div className="grid grid-cols-2">
                      <ArgumentsList
                        customTitle={'Titel Links'}
                        {...extractConfig<
                          ResourceDetailWidgetProps,
                          ArgumentWidgetTabProps
                        >({
                          subWidgetKey: 'commentsWidget',
                          previewConfig: previewConfig,
                          updateConfig,
                          updatePreview,
                        })}
                      />

                      <ArgumentsList
                        customTitle={'Titel Rechts'}
                        {...extractConfig<
                          ResourceDetailWidgetProps,
                          ArgumentWidgetTabProps
                        >({
                          subWidgetKey: 'commentsWidget_multiple',
                          previewConfig: previewConfig,
                          updateConfig,
                          updatePreview,
                        })}
                      />
                    </div>
                  </TabsContent>
                  <TabsContent value="form" className="p-0">
                    <div className="grid grid-cols-2">

                      <ArgumentsForm
                        customTitle={'Formulier Links'}
                        {...extractConfig<
                          ResourceDetailWidgetProps,
                          ArgumentWidgetTabProps
                        >({
                          subWidgetKey: 'commentsWidget',
                          previewConfig: previewConfig,
                          updateConfig,
                          updatePreview: (config) => console.log(config),
                          extraChildConfig: {
                            resourceId: previewConfig.resourceId,
                          },
                        })}
                      />

                      <ArgumentsForm
                        customTitle={'Formulier Rechts'}
                        {...extractConfig<
                          ResourceDetailWidgetProps,
                          ArgumentWidgetTabProps
                        >({
                          subWidgetKey: 'commentsWidget_multiple',
                          previewConfig: previewConfig,
                          updateConfig,
                          updatePreview: (config) => console.log(config),
                          extraChildConfig: {
                            resourceId: previewConfig.resourceId,
                          },
                        })}
                      />
                    </div>

                  </TabsContent>
                </Tabs>
              )}
            </TabsContent>

            <TabsContent value="likes" className="p-0">
              {previewConfig && (
                <LikesDisplay
                  omitSchemaKeys={['resourceId']}
                  {...extractConfig<
                    ResourceDetailWidgetProps,
                    LikeWidgetTabProps
                  >({
                    subWidgetKey: 'likeWidget',
                    previewConfig: previewConfig,
                    updateConfig,
                    updatePreview,
                  })}
                />
              )}
            </TabsContent>

            <TabsContent value="publish" className="p-0">
              <WidgetPublish apiUrl={apiUrl} />
            </TabsContent>
          </Tabs>

          <div className="container py-6 mt-6 bg-white rounded-md">
            {previewConfig && (
              <>
                <WidgetPreview
                  type="resourcedetail"
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
