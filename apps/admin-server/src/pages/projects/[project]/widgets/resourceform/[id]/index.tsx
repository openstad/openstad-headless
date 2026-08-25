import AuditLogTable from '@/components/audit-log-table';
import { Alert, AlertDescription, AlertTitle } from '@/components/ui/alert';
import WidgetEditorPreview from '@/components/widget-editor-preview';
import WidgetPublish from '@/components/widget-publish';
import WidgetVersionHistory from '@/components/widget-version-history';
import { flushAllFields } from '@/hooks/useFieldDebounce';
import { useWidgetDraft } from '@/hooks/useWidgetDraft';
import {
  WithApiUrlProps,
  withApiUrl,
} from '@/lib/server-side-props-definition';
import WidgetResourceFormItems from '@/pages/projects/[project]/widgets/resourceform/[id]/items';
import WidgetResourceFormPolygons from '@/pages/projects/[project]/widgets/resourceform/[id]/polygons';
import WidgetResourcesMapDatalayers from '@/pages/projects/[project]/widgets/resourcesmap/[id]/datalayers';
import { ResourceFormWidgetProps } from '@openstad-headless/resource-form/src/props';
import { useRouter } from 'next/router';
import React, { useState } from 'react';

import { PageLayout } from '../../../../../../components/ui/page-layout';
import {
  Tabs,
  TabsContent,
  TabsList,
  TabsTrigger,
} from '../../../../../../components/ui/tabs';
import WidgetResourceFormConfirmation from './confirmation';
import WidgetResourceFormGeneral from './general';
import WidgetResourceFormInfo from './info';
import WidgetResourceFormSubmit from './submit';

export const getServerSideProps = withApiUrl;
export default function WidgetResourceForm({ apiUrl }: WithApiUrlProps) {
  const router = useRouter();
  const id = router.query.id;
  const projectId = router.query.project as string;

  const { widget, previewConfig, updateConfig, onFieldChanged } =
    useWidgetDraft<ResourceFormWidgetProps>({ projectId });

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
            name: 'Inzending formulier',
            url: `/projects/${projectId}/widgets/resourceform/${id}`,
          },
        ]}>
        <div className="container py-6 overflow-hidden">
          <Tabs value={activeTab} onValueChange={onTabChange}>
            <TabsList className="w-full bg-white border-b-0 mb-4 rounded-md h-fit flex flex-wrap overflow-auto">
              <TabsTrigger value="general">Algemeen</TabsTrigger>
              <TabsTrigger value="items">Formulier velden</TabsTrigger>
              <TabsTrigger value="submit">Opleveren</TabsTrigger>
              <TabsTrigger value="confirmation">Bevestiging</TabsTrigger>
              <TabsTrigger value="info">Weergave</TabsTrigger>
              <TabsTrigger value="datalayers">Kaart opties</TabsTrigger>
              <TabsTrigger value="polygons">Polygonen</TabsTrigger>
              <TabsTrigger value="publish">Publiceren</TabsTrigger>
              <TabsTrigger value="auditlog">Logboek</TabsTrigger>
              <TabsTrigger value="versions">Versiegeschiedenis</TabsTrigger>
            </TabsList>
            <TabsContent value="preview" className="p-0"></TabsContent>
            <TabsContent value="general" className="p-0">
              {previewConfig && (
                <WidgetResourceFormGeneral
                  {...previewConfig}
                  updateConfig={tabUpdateConfig}
                  onFieldChanged={onFieldChanged}
                />
              )}
            </TabsContent>
            <TabsContent value="items" className="p-0">
              {previewConfig && (
                <WidgetResourceFormItems
                  {...previewConfig}
                  updateConfig={tabUpdateConfig}
                  onFieldChanged={onFieldChanged}
                />
              )}
            </TabsContent>
            <TabsContent value="submit" className="p-0">
              {previewConfig && (
                <WidgetResourceFormSubmit
                  {...previewConfig}
                  updateConfig={tabUpdateConfig}
                  onFieldChanged={onFieldChanged}
                />
              )}
            </TabsContent>
            <TabsContent value="confirmation" className="p-0">
              {previewConfig && (
                <WidgetResourceFormConfirmation
                  {...previewConfig}
                  updateConfig={tabUpdateConfig}
                  onFieldChanged={onFieldChanged}
                />
              )}
            </TabsContent>
            <TabsContent value="info" className="p-0">
              {previewConfig && (
                <WidgetResourceFormInfo
                  {...previewConfig}
                  updateConfig={tabUpdateConfig}
                  onFieldChanged={onFieldChanged}
                />
              )}
            </TabsContent>
            <TabsContent value="datalayers" className="p-0">
              {previewConfig && (
                <>
                  <Alert variant="info" className="mb-4">
                    <AlertTitle>Let op!</AlertTitle>
                    <AlertDescription>
                      De kaartopties zijn alleen van toepassing als je een veld
                      hebt die een kaart bevat.
                    </AlertDescription>
                  </Alert>
                  <WidgetResourcesMapDatalayers
                    {...previewConfig}
                    updateConfig={tabUpdateConfig}
                    onFieldChanged={onFieldChanged}
                  />
                </>
              )}
            </TabsContent>
            <TabsContent value="polygons" className="p-0">
              {previewConfig && (
                <WidgetResourceFormPolygons
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
            type="resourceform"
            config={previewConfig}
            projectId={projectId as string}
          />
        </div>
      </PageLayout>
    </div>
  );
}
