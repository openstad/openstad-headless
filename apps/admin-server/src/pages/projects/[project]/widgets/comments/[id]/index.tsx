import React from 'react';
import { PageLayout } from '../../../../../../components/ui/page-layout';
import {
  Tabs,
  TabsContent,
  TabsList,
  TabsTrigger,
} from '../../../../../../components/ui/tabs';
import ArgumentsGeneral from './general';
import ArgumentsList from './list';
import ArgumentsForm from './form';
import { useRouter } from 'next/router';
import WidgetPreview from '@/components/widget-preview';
import { CommentsWidgetProps } from '@openstad/comments/src/comments';
import { useWidgetConfig } from '@/hooks/use-widget-config';
import { useWidgetPreview } from '@/hooks/useWidgetPreview';

export default function WidgetArguments() {
  const router = useRouter();
  const id = router.query.id;
  const projectId = router.query.project;

  const { data: widget, updateConfig } = useWidgetConfig();
  const { previewConfig, updatePreview } =
    useWidgetPreview<CommentsWidgetProps>({
      projectId,
      resourceId: '2',
      api: {
        url: '/api/openstad',
      },
      title: 'Vind je dit een goed idee?',
      variant: 'medium',
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
            name: 'Argumenten',
            url: `/projects/${projectId}/widgets/arguments/${id}`,
          },
        ]}>
        <div className="container py-6">
          <Tabs defaultValue="general">
            <TabsList className="w-full bg-white border-b-0 mb-4 rounded-md">
              <TabsTrigger value="general">Algemeen</TabsTrigger>
              <TabsTrigger value="list">Lijst</TabsTrigger>
              <TabsTrigger value="form">Formulier</TabsTrigger>
            </TabsList>
            <TabsContent value="general" className="p-0">
              {widget?.config ? (
                <ArgumentsGeneral
                  {...widget?.config}
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
            <TabsContent value="list" className="p-0">
              {widget?.config ? (
                <ArgumentsList
                  {...widget?.config}
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
            <TabsContent value="form" className="p-0">
              {widget?.config ? (
                <ArgumentsForm
                  {...widget?.config}
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
          </Tabs>

          <div className="py-6 mt-6 bg-white rounded-md">
            {previewConfig ? (
              <WidgetPreview
                type="comments"
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
