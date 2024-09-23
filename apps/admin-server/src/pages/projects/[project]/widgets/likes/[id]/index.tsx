import React, { useEffect, useRef, useState } from 'react';
import { PageLayout } from '@/components/ui/page-layout';
import { Tabs, TabsContent, TabsList, TabsTrigger } from '@/components/ui/tabs';
import LikesDisplay from './weergave';
import { useRouter } from 'next/router';
import WidgetPreview from '@/components/widget-preview';
import WidgetPublish from '@/components/widget-publish';
import { useWidgetConfig } from '@/hooks/use-widget-config';
import { LikeWidgetProps } from '@openstad-headless/likes/src/likes';
import { useWidgetPreview } from '@/hooks/useWidgetPreview';
import { WithApiUrlProps, withApiUrl } from '@/lib/server-side-props-definition';
import { BaseProps, ProjectSettingProps } from '@openstad-headless/types';

export const getServerSideProps = withApiUrl;


// Use these props in the widget tabs
export type LikeWidgetTabProps = Omit<
  LikeWidgetProps,
  keyof Omit<BaseProps, 'projectId'> | keyof ProjectSettingProps
>;

export default function WidgetLikes({
  apiUrl,
}:WithApiUrlProps) {
  const router = useRouter();
  const id = router.query.id;
  const projectId = router.query.project as string;

  const { data: widget, updateConfig } = useWidgetConfig<LikeWidgetTabProps>();
  const { previewConfig, updatePreview } = useWidgetPreview<LikeWidgetTabProps>({
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
            name: 'Likes',
            url: `/projects/${projectId}/widgets/likes/${id}`,
          },
        ]}>
        <div className="container py-6">
          <Tabs defaultValue="display">
            <TabsList className="w-full bg-white border-b-0 mb-4 rounded-md">
              <TabsTrigger value="display">Instellingen</TabsTrigger>
              <TabsTrigger value="publish">Publiceren</TabsTrigger>
            </TabsList>
            <TabsContent value="display" className="p-0">
              {previewConfig ? (
                <LikesDisplay
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
              ) : null}
            </TabsContent>
            <TabsContent value="publish" className="p-0">
              <WidgetPublish apiUrl={apiUrl} />
            </TabsContent>
          </Tabs>

          <div className="py-6 mt-6 bg-white rounded-md">
            {previewConfig ? (
              <WidgetPreview
                type="likes"
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
