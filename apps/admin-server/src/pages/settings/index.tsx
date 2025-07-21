import React from 'react';
import { PageLayout } from '../../components/ui/page-layout';
import { Tabs, TabsContent, TabsList, TabsTrigger} from '../../components/ui/tabs'
import { WithApiUrlProps } from '@/lib/server-side-props-definition';
import ProjectTags from '../projects/[project]/tags';

export default function GlobalSettings({
  apiUrl
}: WithApiUrlProps) {
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
              <ProjectTags
                preset="global"
              />
            </TabsContent>
          </Tabs>
        </div>
      </PageLayout>
    </div>
  )
}
