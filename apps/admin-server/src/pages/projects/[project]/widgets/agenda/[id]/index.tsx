import AuditLogTable from '@/components/audit-log-table';
import WidgetEditorPreview from '@/components/widget-editor-preview';
import WidgetPublish from '@/components/widget-publish';
import WidgetVersionHistory from '@/components/widget-version-history';
import { flushAllFields } from '@/hooks/useFieldDebounce';
import { useWidgetDraft } from '@/hooks/useWidgetDraft';
import {
  WithApiUrlProps,
  withApiUrl,
} from '@/lib/server-side-props-definition';
import type { AgendaWidgetProps } from '@openstad-headless/agenda/src/agenda';
import { useRouter } from 'next/router';
import { useState } from 'react';

import { PageLayout } from '../../../../../../components/ui/page-layout';
import {
  Tabs,
  TabsContent,
  TabsList,
  TabsTrigger,
} from '../../../../../../components/ui/tabs';
import WidgetAgendaDisplay from './display';
import WidgetAgendaGeneral from './general';
import WidgetAgendaItems from './items';

export const getServerSideProps = withApiUrl;
export default function WidgetAgenda({ apiUrl }: WithApiUrlProps) {
  const router = useRouter();
  const id = router.query.id;
  const projectId = router.query.project as string;

  const { widget, previewConfig, updateConfig, onFieldChanged } =
    useWidgetDraft<AgendaWidgetProps>({ projectId });

  const [activeTab, setActiveTab] = useState('general');

  const onTabChange = (value: string) => {
    flushAllFields();
    setActiveTab(value);
  };

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
            name: 'Agenda',
            url: `/projects/${projectId}/widgets/agenda/${id}`,
          },
        ]}>
        <div className="container py-6">
          <Tabs value={activeTab} onValueChange={onTabChange}>
            <TabsList className="w-full bg-white border-b-0 mb-4 rounded-md h-fit flex flex-wrap overflow-auto">
              <TabsTrigger value="general">Algemeen</TabsTrigger>
              <TabsTrigger value="items">Items</TabsTrigger>
              <TabsTrigger value="display">Weergave</TabsTrigger>
              <TabsTrigger value="publish">Publiceren</TabsTrigger>
              <TabsTrigger value="auditlog">Logboek</TabsTrigger>
              <TabsTrigger value="versions">Versiegeschiedenis</TabsTrigger>
            </TabsList>
            <TabsContent value="general" className="p-0">
              {previewConfig && (
                <WidgetAgendaGeneral
                  {...previewConfig}
                  updateConfig={tabUpdateConfig}
                  onFieldChanged={onFieldChanged}
                />
              )}
            </TabsContent>
            <TabsContent value="items" className="p-0">
              {previewConfig && (
                <WidgetAgendaItems
                  {...previewConfig}
                  updateConfig={tabUpdateConfig}
                  onFieldChanged={onFieldChanged}
                />
              )}
            </TabsContent>
            <TabsContent value="display" className="p-0">
              {previewConfig && (
                <WidgetAgendaDisplay
                  {...previewConfig}
                  updateConfig={tabUpdateConfig}
                  onFieldChanged={onFieldChanged}
                />
              )}
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
            <TabsContent value="versions" className="p-0">
              <WidgetVersionHistory
                widgetId={id as string}
                projectId={projectId as string}
              />
            </TabsContent>
          </Tabs>

          <WidgetEditorPreview
            type="agenda"
            config={previewConfig}
            projectId={projectId as string}
            className="container py-6 mt-6 bg-white rounded-md"
          />
        </div>
      </PageLayout>
    </div>
  );
}
