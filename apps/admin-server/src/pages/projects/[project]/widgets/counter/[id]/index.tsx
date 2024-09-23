import React from 'react';
import { PageLayout } from '../../../../../../components/ui/page-layout';
import { useRouter } from 'next/router'
import { Tabs, TabsContent, TabsList, TabsTrigger} from '../../../../../../components/ui/tabs'
import WidgetPreview from '@/components/widget-preview';
import { useWidgetConfig } from '@/hooks/use-widget-config';
import { useWidgetPreview } from '@/hooks/useWidgetPreview';
import { CounterWidgetProps } from '@openstad-headless/counter/src/counter';
import WidgetPublish from '@/components/widget-publish';
import { WithApiUrlProps, withApiUrl } from '@/lib/server-side-props-definition';
import CounterDisplay from './general';

export const getServerSideProps = withApiUrl

export default function WidgetCounter({
  apiUrl
}: WithApiUrlProps) {
  const router = useRouter();
  const id = router.query.id;
  const projectId = router.query.project as string;

  const { data: widget, updateConfig } = useWidgetConfig<CounterWidgetProps>();
  const { previewConfig, updatePreview } = useWidgetPreview<CounterWidgetProps>({
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
            name: 'Counter',
            url: `/projects/${projectId}/widgets/counter/${id}`
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
                  <CounterDisplay
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
                  type="counter"
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
