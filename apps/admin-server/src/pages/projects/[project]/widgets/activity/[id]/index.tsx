import AuditLogTable from '@/components/audit-log-table';
import WidgetPreview from '@/components/widget-preview';
import WidgetPublish from '@/components/widget-publish';
import { flushAllFields } from '@/hooks/useFieldDebounce';
import { useWidgetDraft } from '@/hooks/useWidgetDraft';
import {
  WithApiUrlProps,
  withApiUrl,
} from '@/lib/server-side-props-definition';
import { ActivityWidgetProps } from '@openstad-headless/activity/src/activity';
import { useRouter } from 'next/router';
import React, { useState } from 'react';

import { PageLayout } from '../../../../../../components/ui/page-layout';
import {
  Tabs,
  TabsContent,
  TabsList,
  TabsTrigger,
} from '../../../../../../components/ui/tabs';
import ActivityDisplay from './general';

export const getServerSideProps = withApiUrl;

export default function WidgetActivity({ apiUrl }: WithApiUrlProps) {
  const router = useRouter();
  const id = router.query.id;
  const projectId = router.query.project as string;

  const { widget, previewConfig, updateConfig, onFieldChanged } =
    useWidgetDraft<ActivityWidgetProps>({ projectId });

  const [activeTab, setActiveTab] = useState('display');

  // Flush any pending field debounce into the draft before the current tab
  // unmounts, so a value typed just before switching tabs is never lost.
  const onTabChange = (value: string) => {
    flushAllFields();
    setActiveTab(value);
  };

  // Kept for legacy tab props; saving now flows through the header save bar.
  const tabUpdateConfig = (config: any) =>
    updateConfig({ ...widget.config, ...config });

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
            name: 'Gebruikersactiviteit',
            url: `/projects/${projectId}/widgets/activity/${id}`,
          },
        ]}>
        <div className="container py-6">
          <Tabs value={activeTab} onValueChange={onTabChange}>
            <TabsList className="w-full bg-white border-b-0 mb-4 rounded-md">
              <TabsTrigger value="display">Instellingen</TabsTrigger>
              <TabsTrigger value="publish">Publiceren</TabsTrigger>
              <TabsTrigger value="auditlog">Logboek</TabsTrigger>
            </TabsList>
            <TabsContent value="display" className="p-0">
              {previewConfig ? (
                <ActivityDisplay
                  {...previewConfig}
                  updateConfig={tabUpdateConfig}
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
                type="activity"
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
