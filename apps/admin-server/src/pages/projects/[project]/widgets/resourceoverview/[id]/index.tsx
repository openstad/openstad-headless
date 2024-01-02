import React from 'react';
import { PageLayout } from '../../../../../../components/ui/page-layout';
import {
  Tabs,
  TabsContent,
  TabsList,
  TabsTrigger,
} from '../../../../../../components/ui/tabs';
import WidgetResourceOverviewGeneral from './general';
import WidgetResourceOverviewDisplay from './display';
import WidgetResourceOverviewButton from './button';
import WidgetResourceOverviewSorting from './sorting';
import WidgetResourceOverviewPagination from './pagination';
import WidgetResourceOverviewSearch from './search';
import WidgetResourceOverviewTags from './tags';
import WidgetResourceOverviewInclude from './include';
import WidgetResourceOverviewInfo from './info';
import { useRouter } from 'next/router';
import { useWidgetConfig } from '@/hooks/use-widget-config';
import { useWidgetPreview } from '@/hooks/useWidgetPreview';
import { ResourceOverviewWidgetProps } from '@openstad/resource-overview/src/resource-overview';
import WidgetPreview from '@/components/widget-preview';

export default function WidgetResourceOverview() {
  const router = useRouter();
  const id = router.query.id;
  const projectId = router.query.project;

  const { data: widget, updateConfig } = useWidgetConfig();
  const { previewConfig, updatePreview } =
    useWidgetPreview<ResourceOverviewWidgetProps>({
      projectId,
      resourceId: '2',
      api: {
        url: '/api/openstad',
      },
      title: 'Vind je dit een goed idee?',
      variant: 'medium',
    });

  const totalPropPackage = {
    ...widget?.config,
    updateConfig: (config: ResourceOverviewWidgetProps) =>
      updateConfig({ ...widget.config, ...config }),

    onFieldChanged: (key: keyof ResourceOverviewWidgetProps, value: any) => {
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
        pageHeader="Project naam"
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
            name: 'Resource Overview',
            url: `/projects/${projectId}/widgets/resourceoverview/${id}`,
          },
        ]}>
        <div className="container py-6">
          <Tabs defaultValue="general">
            <TabsList className="w-full bg-white border-b-0 mb-4 rounded-md h-fit flex flex-wrap overflow-auto">
              <TabsTrigger value="general">Algemeen</TabsTrigger>
              {/* <TabsTrigger value="image">Afbeeldingen</TabsTrigger> */}
              <TabsTrigger value="display">Display</TabsTrigger>
              {/* <TabsTrigger value="button">Knop teksten</TabsTrigger> */}
              <TabsTrigger value="tags">Tags</TabsTrigger>
              <TabsTrigger value="search">Zoeken</TabsTrigger>
              <TabsTrigger value="sorting">Sorteren</TabsTrigger>
              <TabsTrigger value="pagination">Pagination</TabsTrigger>
              <TabsTrigger value="include">Inclusief/exclusief</TabsTrigger>
              <TabsTrigger value="info">Info</TabsTrigger>
            </TabsList>
            <TabsContent value="general" className="p-0">
              <WidgetResourceOverviewGeneral {...totalPropPackage} />
            </TabsContent>
            <TabsContent value="display" className="p-0">
              <WidgetResourceOverviewDisplay {...totalPropPackage} />
            </TabsContent>
            <TabsContent value="button" className="p-0">
              <WidgetResourceOverviewButton {...totalPropPackage} />
            </TabsContent>
            <TabsContent value="sorting" className="p-0">
              <WidgetResourceOverviewSorting {...totalPropPackage} />
            </TabsContent>
            <TabsContent value="pagination" className="p-0">
              <WidgetResourceOverviewPagination {...totalPropPackage} />
            </TabsContent>
            <TabsContent value="search" className="p-0">
              <WidgetResourceOverviewSearch {...totalPropPackage} />
            </TabsContent>
            <TabsContent value="tags" className="p-0">
              <WidgetResourceOverviewTags {...totalPropPackage} />
            </TabsContent>
            <TabsContent value="include" className="p-0">
              <WidgetResourceOverviewInclude {...totalPropPackage} />
            </TabsContent>
            <TabsContent value="info" className="p-0">
              <WidgetResourceOverviewInfo {...totalPropPackage} />
            </TabsContent>
          </Tabs>

          <div className="py-6 mt-6 bg-white rounded-md">
            {previewConfig ? (
              <WidgetPreview
                type="resourceoverview"
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
