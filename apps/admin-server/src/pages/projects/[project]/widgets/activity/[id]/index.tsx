import React from 'react';
import { PageLayout } from '../../../../../../components/ui/page-layout';
import { useRouter } from 'next/router'
import { Tabs, TabsContent, TabsList, TabsTrigger} from '../../../../../../components/ui/tabs'
import WidgetPreview from '@/components/widget-preview';
import { useWidgetConfig } from '@/hooks/use-widget-config';
import { useWidgetPreview } from '@/hooks/useWidgetPreview';
import { ActivityWidgetProps } from '@openstad-headless/activity/src/activity';
import WidgetPublish from '@/components/widget-publish';
import { WithApiUrlProps, withApiUrl } from '@/lib/server-side-props-definition';
import ActivityDisplay from './general';

export const getServerSideProps = withApiUrl

export default function WidgetActivity({
  apiUrl
}: WithApiUrlProps) {
  const router = useRouter();
  const id = router.query.id;
  const projectId = router.query.project as string;

  const { data: widget, updateConfig } = useWidgetConfig<ActivityWidgetProps>();
  const { previewConfig, updatePreview } = useWidgetPreview<ActivityWidgetProps>({
    projectId,
  });

  return (
    <div>
      <PageLayout
        pageHeader='Projectnaam'
        breadcrumbs={[
          {
            name: 'Projecten',
            url: '/projects'
          },
          {
            name: 'Widgets',
            url: `/projects/${projectId}/widgets`
          },
          {
            name: 'Gebruikersactiviteit',
            url: `/projects/${projectId}/widgets/activity/${id}`
          }
        ]}>
          <div className='container py-6'>
            <Tabs defaultValue='display'>
              <TabsList className='w-full bg-white border-b-0 mb-4 rounded-md'>
                <TabsTrigger value="display">Instellingen</TabsTrigger>
                <TabsTrigger value="publish">Publiceren</TabsTrigger>
              </TabsList>
              <TabsContent value='display' className='p-0'>
                {previewConfig ? (
                  <ActivityDisplay
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
              <TabsContent value='publish' className='p-0'>
                <WidgetPublish apiUrl={apiUrl} />
              </TabsContent>
            </Tabs>
            <div className='py-6 mt-6 bg-white rounded-md'>
              {previewConfig ? (
                <WidgetPreview
                  type="activity"
                  config={previewConfig}
                  projectId={projectId as string}
                />
              ) : null}
            </div>
          </div>
        </PageLayout>
    </div>
  )
}
