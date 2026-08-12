import AuditLogTable from '@/components/audit-log-table';
import WidgetPreview from '@/components/widget-preview';
import WidgetPublish from '@/components/widget-publish';
import { flushAllFields } from '@/hooks/useFieldDebounce';
import { useWidgetDraft } from '@/hooks/useWidgetDraft';
import {
  WithApiUrlProps,
  withApiUrl,
} from '@/lib/server-side-props-definition';
import WidgetDistributionModuleDistribute from '@/pages/projects/[project]/widgets/distributionmodule/[id]/distribute';
import { DistributionModuleProps } from '@openstad-headless/distribution-module/src/distribution-module';
import { useRouter } from 'next/router';
import React, { useState } from 'react';

import { PageLayout } from '../../../../../../components/ui/page-layout';
import {
  Tabs,
  TabsContent,
  TabsList,
  TabsTrigger,
} from '../../../../../../components/ui/tabs';
import WidgetDistributionModuleGeneral from './general';
import WidgetDistributionModuleItems from './items';

export const getServerSideProps = withApiUrl;
export default function WidgetDistributionModule({ apiUrl }: WithApiUrlProps) {
  const router = useRouter();
  const id = router.query.id;
  const projectId = router.query.project as string;

  const { widget, previewConfig, updateConfig, onFieldChanged } =
    useWidgetDraft<DistributionModuleProps>({ projectId });

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
            name: 'Verdeelmodule',
            url: `/projects/${projectId}/widgets/distributionmodule/${id}`,
          },
        ]}>
        <div className="container py-6">
          <Tabs value={activeTab} onValueChange={onTabChange}>
            <TabsList className="w-full bg-white border-b-0 mb-4 rounded-md h-fit flex flex-wrap overflow-auto">
              <TabsTrigger value="general">Algemeen</TabsTrigger>
              <TabsTrigger value="items">Items</TabsTrigger>
              <TabsTrigger value="distribute">Verdelen</TabsTrigger>
              <TabsTrigger value="publish">Publiceren</TabsTrigger>
              <TabsTrigger value="auditlog">Logboek</TabsTrigger>
            </TabsList>
            <TabsContent value="general" className="p-0">
              {previewConfig && (
                <WidgetDistributionModuleGeneral
                  {...previewConfig}
                  updateConfig={tabUpdateConfig}
                  onFieldChanged={onFieldChanged}
                />
              )}
            </TabsContent>
            <TabsContent value="items" className="p-0">
              {previewConfig && (
                <WidgetDistributionModuleItems
                  {...previewConfig}
                  updateConfig={tabUpdateConfig}
                  onFieldChanged={onFieldChanged}
                />
              )}
            </TabsContent>
            <TabsContent value="distribute" className="p-0">
              {previewConfig && (
                <WidgetDistributionModuleDistribute
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
                type="distributionmodule"
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
