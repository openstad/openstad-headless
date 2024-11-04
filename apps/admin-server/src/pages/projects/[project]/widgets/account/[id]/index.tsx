import React from 'react';
import { PageLayout } from '../../../../../../components/ui/page-layout';
import { useRouter } from 'next/router'
import { Tabs, TabsContent, TabsList, TabsTrigger} from '../../../../../../components/ui/tabs'
import WidgetPreview from '@/components/widget-preview';
import { useWidgetConfig } from '@/hooks/use-widget-config';
import { useWidgetPreview } from '@/hooks/useWidgetPreview';
import { AccountWidgetProps } from '@openstad-headless/account/src/account';
import WidgetPublish from '@/components/widget-publish';
import { WithApiUrlProps, withApiUrl } from '@/lib/server-side-props-definition';
import AccountDisplay from './general';
import AccountContent from './content';

export const getServerSideProps = withApiUrl

export default function WidgetCounter({
  apiUrl
}: WithApiUrlProps) {
  const router = useRouter();
  const id = router.query.id;
  const projectId = router.query.project as string;

  const { data: widget, updateConfig } = useWidgetConfig<AccountWidgetProps>();
  const { previewConfig, updatePreview } = useWidgetPreview<AccountWidgetProps>({
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
            name: 'Account',
            url: `/projects/${projectId}/widgets/account/${id}`
          }
        ]}>
          <div className='container py-6'>
            <Tabs defaultValue='display'>
              <TabsList className='w-full bg-white border-b-0 mb-4 rounded-md'>
                <TabsTrigger value="display">Instellingen</TabsTrigger>
                <TabsTrigger value="content">Content</TabsTrigger>
                <TabsTrigger value="publish">Publiceren</TabsTrigger>
              </TabsList>
              <TabsContent value='display' className='p-0'>
                {previewConfig ? (
                  <AccountDisplay
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
              <TabsContent value='content' className='p-0'>
                {previewConfig ? (
                  <AccountContent
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
                  type="account"
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
