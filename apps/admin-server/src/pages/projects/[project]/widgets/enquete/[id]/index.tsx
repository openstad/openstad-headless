import AuditLogTable from '@/components/audit-log-table';
import { Alert, AlertDescription, AlertTitle } from '@/components/ui/alert';
import WidgetPreview from '@/components/widget-preview';
import WidgetPublish from '@/components/widget-publish';
import { flushAllFields } from '@/hooks/useFieldDebounce';
import { useWidgetDraft } from '@/hooks/useWidgetDraft';
import {
  WithApiUrlProps,
  withApiUrl,
} from '@/lib/server-side-props-definition';
import WidgetResourcesMapDatalayers from '@/pages/projects/[project]/widgets/resourcesmap/[id]/datalayers';
import { EnqueteWidgetProps } from '@openstad-headless/enquete/src/enquete';
import { useRouter } from 'next/router';
import React, { useState } from 'react';

import { PageLayout } from '../../../../../../components/ui/page-layout';
import {
  Tabs,
  TabsContent,
  TabsList,
  TabsTrigger,
} from '../../../../../../components/ui/tabs';
import WidgetEnqueteConfirmation from './confirmation';
import WidgetEnqueteDisplay from './display';
import WidgetEnqueteGeneral from './general';
import WidgetEnqueteItems from './items';
import WidgetEnquetePolygons from './polygons';

export const getServerSideProps = withApiUrl;
export default function WidgetEnquete({ apiUrl }: WithApiUrlProps) {
  const router = useRouter();
  const id = router.query.id;
  const projectId = router.query.project as string;

  const { widget, previewConfig, updateConfig, onFieldChanged } =
    useWidgetDraft<EnqueteWidgetProps>({ projectId });

  const [activeTab, setActiveTab] = useState('general');

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
            name: 'Enquête',
            url: `/projects/${projectId}/widgets/enquete/${id}`,
          },
        ]}>
        <div className="container py-6">
          <Tabs value={activeTab} onValueChange={onTabChange}>
            <TabsList className="w-full bg-white border-b-0 mb-4 rounded-md h-fit flex flex-wrap overflow-auto">
              <TabsTrigger value="general">Algemeen</TabsTrigger>
              <TabsTrigger value="items">Items</TabsTrigger>
              <TabsTrigger value="display">Weergave</TabsTrigger>
              <TabsTrigger value="confirmation">Bevestiging</TabsTrigger>
              <TabsTrigger value="datalayers">Kaart opties</TabsTrigger>
              <TabsTrigger value="polygons">Polygonen</TabsTrigger>
              <TabsTrigger value="publish">Publiceren</TabsTrigger>
              <TabsTrigger value="auditlog">Logboek</TabsTrigger>
            </TabsList>
            <TabsContent value="general" className="p-0">
              {previewConfig && (
                <WidgetEnqueteGeneral
                  {...previewConfig}
                  updateConfig={tabUpdateConfig}
                  onFieldChanged={onFieldChanged}
                />
              )}
            </TabsContent>
            <TabsContent value="items" className="p-0">
              {previewConfig && (
                <WidgetEnqueteItems
                  {...previewConfig}
                  updateConfig={tabUpdateConfig}
                  onFieldChanged={onFieldChanged}
                />
              )}
            </TabsContent>
            <TabsContent value="display" className="p-0">
              {previewConfig && (
                <WidgetEnqueteDisplay
                  {...previewConfig}
                  updateConfig={tabUpdateConfig}
                  onFieldChanged={onFieldChanged}
                />
              )}
            </TabsContent>
            <TabsContent value="confirmation" className="p-0">
              {previewConfig && (
                <WidgetEnqueteConfirmation
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
                <WidgetEnquetePolygons
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
          </Tabs>

          <div className="container py-6 mt-6 bg-white rounded-md">
            {previewConfig && (
              <WidgetPreview
                type="enquete"
                config={previewConfig}
                projectId={projectId as string}
              />
            )}
          </div>
        </div>
      </PageLayout>
    </div>
  );
}
