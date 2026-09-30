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
import type { StemBegrootWidgetProps } from '@openstad-headless/stem-begroot/src/stem-begroot';
import { useRouter } from 'next/router';
import React, { useState } from 'react';

import { PageLayout } from '../../../../../../components/ui/page-layout';
import {
  Tabs,
  TabsContent,
  TabsList,
  TabsTrigger,
} from '../../../../../../components/ui/tabs';
import BegrootmoduleDisplay from './display';
import BegrootmoduleExplanation from './explanation';
import WidgetStemBegrootInclude from './include';
import WidgetStemBegrootPagination from './pagination';
import WidgetStemBegrootSearch from './search';
import WidgetStemBegrootSorting from './sorting';
import WidgetStemBegrootOverviewTags from './tags';
import BegrootmoduleText from './text';

export const getServerSideProps = withApiUrl;

export default function WidgetBegrootModule({ apiUrl }: WithApiUrlProps) {
  const router = useRouter();
  const id = router.query.id;
  const projectId = router.query.project as string;

  const { widget, previewConfig, updateConfig, onFieldChanged } =
    useWidgetDraft<StemBegrootWidgetProps>({ projectId });

  const [activeTab, setActiveTab] = useState('display');

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
            name: 'Begrootmodule',
            url: `/projects/${projectId}/widgets/begrootmodule/${id}`,
          },
        ]}>
        <div className="container py-6">
          <Tabs value={activeTab} onValueChange={onTabChange}>
            <TabsList className="w-full bg-white border-b-0 mb-4 rounded-md">
              <TabsTrigger value="display">Weergave opties</TabsTrigger>
              <TabsTrigger value="text">Teksten</TabsTrigger>
              <TabsTrigger value="explanation">Uitleg</TabsTrigger>
              <TabsTrigger value="search">Zoeken</TabsTrigger>
              <TabsTrigger value="tags">Tags</TabsTrigger>
              <TabsTrigger value="sorting">Sorteer opties</TabsTrigger>
              <TabsTrigger value="pagination">Paginering</TabsTrigger>
              <TabsTrigger value="include">Inclusief/exclusief</TabsTrigger>
              <TabsTrigger value="publish">Publiceren</TabsTrigger>
              <TabsTrigger value="auditlog">Logboek</TabsTrigger>
              <TabsTrigger value="versions">Versiegeschiedenis</TabsTrigger>
            </TabsList>

            {previewConfig ? (
              <>
                <TabsContent value="display" className="p-0">
                  <BegrootmoduleDisplay
                    {...previewConfig}
                    updateConfig={tabUpdateConfig}
                    onFieldChanged={onFieldChanged}
                  />
                </TabsContent>
                <TabsContent value="text" className="p-0">
                  <BegrootmoduleText
                    {...previewConfig}
                    updateConfig={tabUpdateConfig}
                    onFieldChanged={onFieldChanged}
                  />
                </TabsContent>
                <TabsContent value="explanation" className="p-0">
                  <BegrootmoduleExplanation
                    {...previewConfig}
                    updateConfig={tabUpdateConfig}
                    onFieldChanged={onFieldChanged}
                  />
                </TabsContent>
                <TabsContent value="search" className="p-0">
                  <WidgetStemBegrootSearch
                    {...previewConfig}
                    updateConfig={tabUpdateConfig}
                    onFieldChanged={onFieldChanged}
                  />
                </TabsContent>
                <TabsContent value="tags" className="p-0">
                  <WidgetStemBegrootOverviewTags
                    {...previewConfig}
                    updateConfig={tabUpdateConfig}
                    onFieldChanged={onFieldChanged}
                  />
                </TabsContent>
                <TabsContent value="sorting" className="p-0">
                  <WidgetStemBegrootSorting
                    {...previewConfig}
                    updateConfig={tabUpdateConfig}
                    onFieldChanged={onFieldChanged}
                  />
                </TabsContent>
                <TabsContent value="pagination" className="p-0">
                  <WidgetStemBegrootPagination
                    {...previewConfig}
                    updateConfig={tabUpdateConfig}
                    onFieldChanged={onFieldChanged}
                  />
                </TabsContent>
                <TabsContent value="include" className="p-0">
                  <WidgetStemBegrootInclude
                    {...previewConfig}
                    updateConfig={tabUpdateConfig}
                    onFieldChanged={onFieldChanged}
                  />
                </TabsContent>
                <TabsContent value="publish" className="p-0">
                  <WidgetPublish apiUrl={apiUrl} />
                </TabsContent>
              </>
            ) : null}
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
            type="begrootmodule"
            config={previewConfig}
            projectId={projectId as string}
            className="container py-6 mt-6 bg-white rounded-md"
          />
        </div>
      </PageLayout>
    </div>
  );
}
