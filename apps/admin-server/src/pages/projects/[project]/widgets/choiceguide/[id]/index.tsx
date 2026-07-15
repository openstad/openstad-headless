import AuditLogTable from '@/components/audit-log-table';
import { Alert, AlertDescription, AlertTitle } from '@/components/ui/alert';
import WidgetPreview from '@/components/widget-preview';
import WidgetPublish from '@/components/widget-publish';
import { useWidgetDraft } from '@/hooks/useWidgetDraft';
import {
  WithApiUrlProps,
  withApiUrl,
} from '@/lib/server-side-props-definition';
import WidgetChoiceGuideChoiceOptions from '@/pages/projects/[project]/widgets/choiceguide/[id]/choiceOptions';
import WidgetChoiceGuideItems from '@/pages/projects/[project]/widgets/choiceguide/[id]/items';
import WidgetChoiceGuidePolygons from '@/pages/projects/[project]/widgets/choiceguide/[id]/polygons';
import WidgetChoiceGuideGeneralSettings from '@/pages/projects/[project]/widgets/choiceguide/[id]/settings';
import WidgetResourcesMapDatalayers from '@/pages/projects/[project]/widgets/resourcesmap/[id]/datalayers';
import { useRouter } from 'next/router';
import React from 'react';

import { ChoiceGuideProps } from '../../../../../../../../../packages/choiceguide/src/props';
import { PageLayout } from '../../../../../../components/ui/page-layout';
import {
  Tabs,
  TabsContent,
  TabsList,
  TabsTrigger,
} from '../../../../../../components/ui/tabs';
import ChoicesSelectorForm from './form';

export const getServerSideProps = withApiUrl;

export default function WidgetChoiceGuide({ apiUrl }: WithApiUrlProps) {
  const router = useRouter();
  const id = router.query.id;
  const projectId = router.query.project as string;

  const { widget, previewConfig, updateConfig, onFieldChanged } =
    useWidgetDraft<ChoiceGuideProps>({ projectId });

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
            name: 'Keuzewijzer',
            url: `/projects/${projectId}/widgets/keuzewijzer/${id}`,
          },
        ]}>
        <div className="container py-6">
          <Tabs defaultValue="form">
            <TabsList className="w-full bg-white border-b-0 mb-4 rounded-md">
              <TabsTrigger value="form">Formulier instellingen</TabsTrigger>
              <TabsTrigger value="items">Velden</TabsTrigger>
              <TabsTrigger value="choiceOptions">Keuze opties</TabsTrigger>
              <TabsTrigger value="generalSettings">
                Algemene instellingen
              </TabsTrigger>
              <TabsTrigger value="datalayers">Kaart opties</TabsTrigger>
              <TabsTrigger value="polygons">Polygonen</TabsTrigger>
              <TabsTrigger value="publish">Publiceren</TabsTrigger>
              <TabsTrigger value="auditlog">Logboek</TabsTrigger>
            </TabsList>
            <TabsContent value="form" className="p-0">
              {previewConfig && (
                // @ts-ignore
                <ChoicesSelectorForm
                  {...previewConfig}
                  updateConfig={tabUpdateConfig}
                  onFieldChanged={onFieldChanged}
                />
              )}
            </TabsContent>
            <TabsContent value="items" className="p-0">
              {previewConfig && (
                // @ts-ignore
                <WidgetChoiceGuideItems
                  {...previewConfig}
                  updateConfig={tabUpdateConfig}
                  onFieldChanged={onFieldChanged}
                />
              )}
            </TabsContent>
            <TabsContent value="choiceOptions" className="p-0">
              {previewConfig && (
                // @ts-ignore
                <WidgetChoiceGuideChoiceOptions
                  {...previewConfig}
                  updateConfig={tabUpdateConfig}
                  onFieldChanged={onFieldChanged}
                />
              )}
            </TabsContent>
            <TabsContent value="generalSettings" className="p-0">
              {previewConfig && (
                <WidgetChoiceGuideGeneralSettings
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
                <WidgetChoiceGuidePolygons
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

          <div className="py-6 mt-6 bg-white rounded-md">
            {previewConfig ? (
              <WidgetPreview
                type="choiceguide"
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
