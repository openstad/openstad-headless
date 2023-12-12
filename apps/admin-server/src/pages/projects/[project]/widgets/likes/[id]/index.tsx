import React, { useEffect, useRef, useState } from 'react';
import { PageLayout } from '@/components/ui/page-layout';
import { Tabs, TabsContent, TabsList, TabsTrigger } from '@/components/ui/tabs';
import LikesDisplay from './weergave';
import { useRouter } from 'next/router';
import WidgetPreview from '@/components/widget-preview';
import WidgetPublish from '@/components/widget-publish';
import { useWidgetConfig } from '@/hooks/use-widget-config';
import toast from 'react-hot-toast';
import { LikeWidgetProps } from '@openstad/likes/src/likes';

export default function WidgetLikes() {
  const router = useRouter();
  const id = router.query.id;
  const projectId = router.query.project;
  const [previewConfig, setPreviewConfig] = useState<LikeWidgetProps>();

  const {
    data: widget,
    isLoading: isLoadingWidget,
    updateConfig,
  } = useWidgetConfig();

  async function update(values: any) {
    try {
      await updateConfig(values);
      toast.success('Configuratie aangepast');
    } catch (error) {
      toast.error('De configuratie kon niet worden aangepast');
    }
  }

  // Set the preview the first time the widget config is loaded
  useEffect(() => {
    const config = widget?.config;
    if (config) {
      setPreviewConfig({
        projectId,
        ideaId: '2',
        api: {
          url: '/api/openstad',
        },
        title: previewConfig?.title || 'Vind je dit een goed idee?',
        hideCounters: previewConfig?.hideCounters,
        variant: previewConfig?.variant || 'medium',
        yesLabel: previewConfig?.yesLabel,
        noLabel: previewConfig?.noLabel,
        ...config,
      });
    }
  }, [widget]);

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
            name: 'Likes',
            url: `/projects/${projectId}/widgets/like/${id}`,
          },
        ]}>
        <div className="container py-6">
          <Tabs defaultValue="display">
            <TabsList className="w-full bg-white border-b-0 mb-4 rounded-md">
              <TabsTrigger value="display">Instellingen</TabsTrigger>
              <TabsTrigger value="publish">Publiceren</TabsTrigger>
            </TabsList>
            <TabsContent value="display" className="p-0">
              {widget?.config ? (
                <LikesDisplay
                  {...widget?.config}
                  updateConfig={(config) => {
                    update(config);
                  }}
                  onFieldChanged={(key, value) => {
                    if (previewConfig) {
                      setPreviewConfig({
                        ...previewConfig,
                        [key]: value,
                      });
                    }
                  }}
                />
              ) : null}
            </TabsContent>
            <TabsContent value="publish" className="p-0">
              <WidgetPublish />
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
