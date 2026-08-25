import AuditLogTable from '@/components/audit-log-table';
import WidgetEditorPreview from '@/components/widget-editor-preview';
import WidgetPublish from '@/components/widget-publish';
import WidgetVersionHistory from '@/components/widget-version-history';
import { useWidgetDraft } from '@/hooks/useWidgetDraft';
import {
  WithApiUrlProps,
  withApiUrl,
} from '@/lib/server-side-props-definition';
import type { ResourceDetailMapWidgetProps } from '@openstad-headless/leaflet-map/src/types/resource-detail-map-widget-props';
import { useRouter } from 'next/router';
import React from 'react';

import { PageLayout } from '../../../../../../components/ui/page-layout';
import {
  Tabs,
  TabsContent,
  TabsList,
  TabsTrigger,
} from '../../../../../../components/ui/tabs';
import WidgetResourceDetailMapGeneral from './general';

export const getServerSideProps = withApiUrl;

export default function WidgetResourceDetailMap({ apiUrl }: WithApiUrlProps) {
  const router = useRouter();
  const id = router.query.id;
  const projectId = router.query.project as string;

  const { widget, previewConfig, updateConfig, onFieldChanged } =
    useWidgetDraft<ResourceDetailMapWidgetProps>({ projectId });

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
            name: 'Inzending kaart',
            url: `/projects/${projectId}/widgets/resourcedetailmap/${id}`,
          },
        ]}>
        <div className="container py-6">
          <Tabs defaultValue="general">
            <TabsList className="w-full bg-white border-b-0 mb-4 rounded-md">
              <TabsTrigger value="general">Algemeen</TabsTrigger>
              <TabsTrigger value="publish">Publiceren</TabsTrigger>
              <TabsTrigger value="auditlog">Logboek</TabsTrigger>
              <TabsTrigger value="versions">Versiegeschiedenis</TabsTrigger>
            </TabsList>
            <TabsContent value="general" className="p-0">
              {previewConfig && (
                <WidgetResourceDetailMapGeneral
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
            type="resourcedetailmap"
            config={previewConfig}
            projectId={projectId as string}
            className="container py-6 mt-6 bg-white rounded-md"
          />
        </div>
      </PageLayout>
    </div>
  );
}
