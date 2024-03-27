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
import WidgetResourceLikesDisplay from './likes';
import ArgumentsGeneral from '../../comments/[id]/general';
import { CommentsWidgetProps } from '@openstad-headless/comments/src/comments';
import LikesDisplay from '../../likes/[id]/weergave';
export const getServerSideProps = withApiUrl;

export default function WidgetResourceDetail({ apiUrl }: WithApiUrlProps) {
  const router = useRouter();
  const id = router.query.id;
  const projectId = router.query.project as string;

  const { data: widget, updateConfig } = useWidgetConfig();
  const { previewConfig, updatePreview } =
    useWidgetPreview<ResourceDetailWidgetProps>({
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
            name: 'Resource Detail',
            url: `/projects/${projectId}/widgets/resourcedetail/${id}`,
          },
        ]}>
        <div className="container py-6">
          <Tabs defaultValue="general">
            <TabsList className="w-full bg-white border-b-0 mb-4 rounded-md h-fit flex flex-wrap overflow-auto">
              <TabsTrigger value="general">Algemeen</TabsTrigger>
              <TabsTrigger value="display">Display</TabsTrigger>
              <TabsTrigger value="comments">
                Argumenten widget display
              </TabsTrigger>
              <TabsTrigger value="likes">Likes widget display</TabsTrigger>
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
                <ArgumentsGeneral
                  omitSchemaKeys={['resourceId', 'sentiment']}
                  {...({
                    ...previewConfig,
                    resourceId: previewConfig.resourceId || '',
                    isVotingEnabled: !!previewConfig.commentsVotingEnabled,
                    isReplyingEnabled: !!previewConfig.commentsReplyingEnabled,
                  } )}
                  updateConfig={(config) =>
                    updateConfig({
                      ...widget.config,
                      commentsVotingEnabled: config.isVotingEnabled,
                      commentsReplyingEnabled: config.isReplyingEnabled,
                    })
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

            <TabsContent value="likes" className="p-0">
              {previewConfig && (
                <LikesDisplay 
                omitSchemaKeys={['resourceId']}
                {...({
                  ...previewConfig,
                  resourceId: previewConfig.resourceId,
                  yesLabel: previewConfig.likeWidgetForText,
                  noLabel: previewConfig.likeWidgetAgainstText,
                  variant: previewConfig.likeWidgetVariant
                } )}
                updateConfig={(config) =>
                  updateConfig({
                    ...widget.config,
                    likeWidgetForText: config.yesLabel,
                    likeWidgetAgainstText: config.noLabel,
                    likeWidgetVariant: config.variant
                  })
                }
                onFieldChanged={(key, value) => {
                  if (previewConfig) {
                    updatePreview({
                      ...previewConfig,
                      [key]: value,
                    });
                  }
                }}/>
                // <WidgetResourceLikesDisplay
                //   {...previewConfig}
                //   updateConfig={(config) =>
                //     updateConfig({ ...widget.config, ...config })
                //   }
                //   onFieldChanged={(key, value) => {
                //     if (previewConfig) {
                //       updatePreview({
                //         ...previewConfig,
                //         [key]: value,
                //       });
                //     }
                //   }}
                // />
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
