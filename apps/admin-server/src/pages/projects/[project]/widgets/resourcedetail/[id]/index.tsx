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

  function extractConfig<T>(
    subWidgetKey: keyof Pick<
      ResourceDetailWidgetProps,
      'commentsWidget' | 'likeWidget'
    >
  ) {
    if (!previewConfig) throw new Error();

    return {
      resourceId: previewConfig.resourceId || '',
      ...previewConfig[subWidgetKey],
      updateConfig: (config: T) =>
        updateConfig({
          ...previewConfig,
          [subWidgetKey]: {
            ...previewConfig[subWidgetKey],
            ...config,
          },
        }),
      onFieldChanged: (key: string, value: any) => {
        if (previewConfig) {
          updatePreview({
            ...previewConfig,
            [subWidgetKey]: {
              ...previewConfig[subWidgetKey],
              [key]: value,
            },
          });
        }
      },
    };
  }

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
              <TabsTrigger value="comments">Argumenten widget</TabsTrigger>
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
                      {...extractConfig<ArgumentWidgetTabProps>(
                        'commentsWidget'
                      )}
                    />
                  </TabsContent>

                  <TabsContent value="list" className="p-0">
                    <ArgumentsList
                      {...extractConfig<ArgumentWidgetTabProps>(
                        'commentsWidget'
                      )}
                    />
                  </TabsContent>
                  <TabsContent value="form" className="p-0">
                    <ArgumentsForm
                      {...extractConfig<ArgumentWidgetTabProps>(
                        'commentsWidget'
                      )}
                    />
                  </TabsContent>
                </Tabs>
              )}
            </TabsContent>

            <TabsContent value="likes" className="p-0">
              {previewConfig && (
                <LikesDisplay
                  omitSchemaKeys={['resourceId']}
                  {...{
                    ...previewConfig,
                    ...previewConfig.likeWidget,
                    resourceId: previewConfig.resourceId,
                  }}
                  updateConfig={(config) => {
                    updateConfig<ResourceDetailWidgetProps>({
                      ...widget.config,
                      likeWidget: config,
                    });
                  }}
                  onFieldChanged={(key, value) => {
                    if (previewConfig) {
                      updatePreview({
                        ...previewConfig,
                        likeWidget: { [key]: value },
                      });
                    }
                  }}
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
