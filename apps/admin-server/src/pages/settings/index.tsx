import React from 'react';
import { PageLayout } from '../../components/ui/page-layout';
import { useRouter } from 'next/router'
import { Tabs, TabsContent, TabsList, TabsTrigger} from '../../components/ui/tabs'
import { useWidgetConfig } from '@/hooks/use-widget-config';
import { CounterWidgetProps } from '@openstad-headless/counter/src/counter';
import { WithApiUrlProps } from '@/lib/server-side-props-definition';

export default function GlobalSettings({
  apiUrl
}: WithApiUrlProps) {
  const router = useRouter();
  const id = router.query.id;
  const projectId = router.query.project as string;

  return (
    <div>
      <PageLayout
        pageHeader='Algemene instellingen'
        breadcrumbs={[
          {
            name: 'Projecten',
            url: '/projects'
          },
          {
            name: 'Instellingen',
            url: `/projects/settings`
          },
        ]}>
        <div className='container py-6'>
          <Tabs defaultValue='display'>
            <TabsList className='w-full bg-white border-b-0 mb-4 rounded-md'>
              <TabsTrigger value="display">Tags</TabsTrigger>
            </TabsList>
            <TabsContent value='display' className='p-0'>
              Tags
            </TabsContent>
          </Tabs>
        </div>
      </PageLayout>
    </div>
  )
}
