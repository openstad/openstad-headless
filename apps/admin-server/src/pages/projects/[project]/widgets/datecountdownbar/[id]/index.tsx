import AuditLogTable from '@/components/audit-log-table';
import WidgetPreview from '@/components/widget-preview';
import WidgetPublish from '@/components/widget-publish';
import { useWidgetDraft } from '@/hooks/useWidgetDraft';
import {
  WithApiUrlProps,
  withApiUrl,
} from '@/lib/server-side-props-definition';
import type { DateCountdownBarWidgetProps } from '@openstad-headless/date-countdown-bar/src/date-countdown-bar';
import { useRouter } from 'next/router';
import React from 'react';

import { PageLayout } from '../../../../../../components/ui/page-layout';
import {
  Tabs,
  TabsContent,
  TabsList,
  TabsTrigger,
} from '../../../../../../components/ui/tabs';
import CountdownBarGeneral from './general';

export const getServerSideProps = withApiUrl;

export default function WidgetDateCountdownBar({ apiUrl }: WithApiUrlProps) {
  const router = useRouter();
  const id = router.query.id;
  const projectId = router.query.project;

  const { previewConfig, updateConfig, onFieldChanged } =
    useWidgetDraft<DateCountdownBarWidgetProps>({});

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
            name: 'Aftelbalk',
            url: `/projects/${projectId}/widgets/datecountdownbar/${id}`,
          },
        ]}>
        <div className="container py-6">
          <Tabs defaultValue="general">
            <TabsList className="w-full bg-white border-b-0 mb-4 rounded-md h-fit flex flex-wrap overflow-auto">
              <TabsTrigger value="general">Algemeen</TabsTrigger>
              <TabsTrigger value="publish">Publiceren</TabsTrigger>
              <TabsTrigger value="auditlog">Logboek</TabsTrigger>
            </TabsList>
            <TabsContent value="general" className="p-0">
              {previewConfig ? (
                <CountdownBarGeneral
                  {...previewConfig}
                  updateConfig={updateConfig}
                  onFieldChanged={onFieldChanged}
                />
              ) : null}
            </TabsContent>
            <TabsContent value="publish" className="p-0">
              <WidgetPublish apiUrl={apiUrl} />
            </TabsContent>
            <TabsContent value="auditlog" className="p-0">
              <AuditLogTable
                modelName="widgets"
                modelId={id as string}
                projectId={projectId as string}
              />
            </TabsContent>
          </Tabs>

          <div className="py-6 mt-6 bg-white rounded-md">
            {previewConfig ? (
              <WidgetPreview
                type="datecountdownbar"
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
