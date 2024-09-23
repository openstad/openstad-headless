import React from 'react';
import { PageLayout } from '../../../../../../components/ui/page-layout';
import {
  Tabs,
  TabsContent,
  TabsList,
  TabsTrigger,
} from '../../../../../../components/ui/tabs';
import BegrootmoduleDisplay from './display';
import BegrootmoduleText from './text';
import BegrootmoduleExplanation from './explanation';
import { useRouter } from 'next/router';
import { useWidgetConfig } from '@/hooks/use-widget-config';
import { useWidgetPreview } from '@/hooks/useWidgetPreview';
import {
  WithApiUrlProps,
  withApiUrl,
} from '@/lib/server-side-props-definition';
import WidgetPublish from '@/components/widget-publish';
export const getServerSideProps = withApiUrl;
import type { StemBegrootWidgetProps } from '@openstad-headless/stem-begroot/src/stem-begroot';

import WidgetPreview from '@/components/widget-preview';
import WidgetStemBegrootOverviewTags from './tags';
import WidgetStemBegrootSorting from './sorting';
import WidgetStemBegrootPagination from './pagination';
import WidgetStemBegrootInclude from './include';
import WidgetStemBegrootSearch from './search';

export default function WidgetBegrootModule({ apiUrl }: WithApiUrlProps) {
  const router = useRouter();
  const id = router.query.id;
  const projectId = router.query.project as string;

  const { data: widget, updateConfig } =
    useWidgetConfig<StemBegrootWidgetProps>();
  const { previewConfig, updatePreview } =
    useWidgetPreview<StemBegrootWidgetProps>({
      projectId,
    });

  const totalPropPackage = {
    ...widget?.config,
    ...previewConfig,
    updateConfig: (config: StemBegrootWidgetProps) =>
      updateConfig({ ...widget.config, ...config }),

    onFieldChanged: (key: string, value: any) => {
      if (previewConfig) {
        updatePreview({
          ...previewConfig,
          [key]: value,
        });
      }
    },
    projectId,
  };

  return (
    <div>
      <PageLayout
        pageHeader="Projectnaam"
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
          <Tabs defaultValue="display">
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
            </TabsList>

            {previewConfig ? (
              <>
                <TabsContent value="display" className="p-0">
                  <BegrootmoduleDisplay {...totalPropPackage} />
                </TabsContent>
                <TabsContent value="text" className="p-0">
                  <BegrootmoduleText {...totalPropPackage} />
                </TabsContent>
                <TabsContent value="explanation" className="p-0">
                  <BegrootmoduleExplanation {...totalPropPackage} />
                </TabsContent>
                <TabsContent value="search" className="p-0">
                  <WidgetStemBegrootSearch {...totalPropPackage} />
                </TabsContent>
                <TabsContent value="tags" className="p-0">
                  <WidgetStemBegrootOverviewTags {...totalPropPackage} />
                </TabsContent>
                <TabsContent value="sorting" className="p-0">
                  <WidgetStemBegrootSorting {...totalPropPackage} />
                </TabsContent>
                <TabsContent value="pagination" className="p-0">
                  <WidgetStemBegrootPagination {...totalPropPackage} />
                </TabsContent>
                <TabsContent value="include" className="p-0">
                  <WidgetStemBegrootInclude {...totalPropPackage} />
                </TabsContent>
                <TabsContent value="publish" className="p-0">
                  <WidgetPublish apiUrl={apiUrl} />
                </TabsContent>
              </>
            ) : null}
          </Tabs>

          <div className="container py-6 mt-6 bg-white rounded-md">
            {previewConfig && (
              <WidgetPreview
                type="begrootmodule"
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
