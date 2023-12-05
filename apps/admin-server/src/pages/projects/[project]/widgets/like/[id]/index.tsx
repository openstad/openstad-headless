import React, { useEffect, useState } from 'react';
import { PageLayout } from '@/components/ui/page-layout';
import { Tabs, TabsContent, TabsList, TabsTrigger } from '@/components/ui/tabs';
import LikesDisplay from './weergave';
import { useRouter } from 'next/router';
import WidgetPreview from '@/components/widget-preview';
import WidgetPublish from '@/components/widget-publish';
import { useWidgetConfig } from '@/hooks/use-widget-config';
import toast from 'react-hot-toast';

export default function WidgetArguments() {
  const router = useRouter();
  const id = router.query.id;
  const projectId = router.query.project;
  const [previewConfig, setPreviewConfig] = useState<any>();

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
    if (widget?.config?.like) {
      setPreviewConfig({ ...widget });
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
              <LikesDisplay
                config={{
                  like: {
                    display: previewConfig?.config?.like?.display || 'claps',
                    yesLabel:
                      previewConfig?.config?.like?.yesLabel || 'Ik ben voor',
                    noLabel:
                      previewConfig?.config?.like?.noLabel || 'Ik ben tegen',
                  },
                }}
                updateConfig={(config) => update(config)}
                onFieldChanged={(key, value) => {
                  if (previewConfig) {
                    setPreviewConfig({
                      ...previewConfig,
                      config: {
                        ...previewConfig?.config,
                        like: {
                          ...previewConfig?.config?.like,
                          [key]: value,
                        },
                      },
                    });
                  }
                }}
              />
            </TabsContent>
            <TabsContent value="publish" className="p-0">
              <WidgetPublish />
            </TabsContent>
          </Tabs>

          <div className="py-6 mt-6 bg-white rounded-md">
            <WidgetPreview
              type="like"
              config={...previewConfig?.config}
              projectId={projectId as string}
              widgetId={id as string}
            />
          </div>
        </div>
      </PageLayout>
    </div>
  );
}
