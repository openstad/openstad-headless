import WidgetPreview from '@/components/widget-preview';
import WidgetPublish from '@/components/widget-publish';
import { useProject } from '@/hooks/use-project';
import { useWidgetConfig } from '@/hooks/use-widget-config';
import { useWidgetPreview } from '@/hooks/useWidgetPreview';
import {
  WithApiUrlProps,
  withApiUrl,
} from '@/lib/server-side-props-definition';
import ArgumentsConfirmation from '@/pages/projects/[project]/widgets/comments/[id]/confirmation';
import ArgumentsExtraFields from '@/pages/projects/[project]/widgets/comments/[id]/extraFields';
import ArgumentsInclude from '@/pages/projects/[project]/widgets/comments/[id]/include';
import ArgumentsSorting from '@/pages/projects/[project]/widgets/comments/[id]/sorting';
import { CommentsWidgetProps } from '@openstad-headless/comments/src/comments';
import { BaseProps, ProjectSettingProps } from '@openstad-headless/types';
import { useRouter } from 'next/router';
import React from 'react';

import { PageLayout } from '../../../../../../components/ui/page-layout';
import {
  Tabs,
  TabsContent,
  TabsList,
  TabsTrigger,
} from '../../../../../../components/ui/tabs';
import ArgumentsForm from './form';
import ArgumentsGeneral from './general';
import ArgumentsList from './list';

export const getServerSideProps = withApiUrl;

// Use these props in the widget tabs
export type ArgumentWidgetTabProps = Omit<
  CommentsWidgetProps,
  keyof Omit<BaseProps, 'projectId'> | keyof ProjectSettingProps
>;

export default function WidgetArguments({ apiUrl }: WithApiUrlProps) {
  const router = useRouter();
  const id = router.query.id;
  const projectId = router.query.project as string;

  const { data: widget, updateConfig } = useWidgetConfig<CommentsWidgetProps>();
  const { previewConfig, updatePreview } =
    useWidgetPreview<CommentsWidgetProps>({
      projectId,
    });

  const { data: projectConfig } = useProject(['includeConfig']);
  const requiredFieldsIncludesEmailNotificationConsent =
    projectConfig?.config?.auth?.provider?.openstad?.requiredUserFields?.includes(
      'emailNotificationConsent'
    );

  return (
    <div>
      <PageLayout
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
            name: 'Reacties',
            url: `/projects/${projectId}/widgets/comments/${id}`,
          },
        ]}>
        <div className="container py-6">
          <Tabs defaultValue="general">
            <TabsList className="w-full bg-white border-b-0 mb-4 rounded-md">
              <TabsTrigger value="general">Algemeen</TabsTrigger>
              <TabsTrigger value="list">Titel</TabsTrigger>
              <TabsTrigger value="form">Formulier</TabsTrigger>
              <TabsTrigger value="extraFields">Extra velden</TabsTrigger>
              <TabsTrigger value="include">Inclusief / exclusief</TabsTrigger>
              <TabsTrigger value="confirmation">Bevestiging</TabsTrigger>
              <TabsTrigger value="sorting">Sorteren</TabsTrigger>
              <TabsTrigger value="publish">Publiceren</TabsTrigger>
            </TabsList>
            <TabsContent value="general" className="p-0">
              {previewConfig ? (
                <ArgumentsGeneral
                  omitSchemaKeys={['useSentiments']}
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
            <TabsContent value="list" className="p-0">
              {previewConfig ? (
                <ArgumentsList
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
            <TabsContent value="form" className="p-0">
              {previewConfig ? (
                <ArgumentsForm
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
            <TabsContent value="extraFields" className="p-0">
              {previewConfig ? (
                <ArgumentsExtraFields
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
            <TabsContent value="include" className="p-0">
              {previewConfig ? (
                <ArgumentsInclude
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
            <TabsContent value="confirmation" className="p-0">
              {previewConfig ? (
                <ArgumentsConfirmation
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
                  requiredFieldsIncludesEmailNotificationConsent={
                    requiredFieldsIncludesEmailNotificationConsent
                  }
                />
              ) : null}
            </TabsContent>
            <TabsContent value="sorting" className="p-0">
              {previewConfig ? (
                <ArgumentsSorting
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
