import React from 'react';
import { PageLayout } from '../../../../../../components/ui/page-layout';
import {
  Tabs,
  TabsContent,
  TabsList,
  TabsTrigger,
} from '../../../../../../components/ui/tabs';
import WidgetResourceDetailGeneral from './general';
import WidgetResourceDetailDisplay from './display';
import WidgetResourceDetailButton from './button';
// import WidgetResourceDetailSorting from './sorting';
// import WidgetResourceDetailPagination from './pagination';
import WidgetResourceDetailSearch from './search';
import WidgetResourceDetailTags from './tags';
import WidgetResourceDetailInclude from './include';
import WidgetResourceDetailInfo from './info';
import { useRouter } from 'next/router';
import { useWidgetConfig } from '@/hooks/use-widget-config';
import { useWidgetPreview } from '@/hooks/useWidgetPreview';
import { ResourceDetailWidgetProps } from '@openstad/resource-detail/src/resource-detail';
import WidgetPreview from '@/components/widget-preview';
import useResources from '@/hooks/use-resources';
import {
  Select,
  SelectContent,
  SelectGroup,
  SelectItem,
  SelectLabel,
  SelectSeparator,
  SelectTrigger,
  SelectValue,
} from '@/components/ui/select';
import { Label } from '@/components/ui/label';
import ResourceForm from '@/components/resource-form';

export default function WidgetResourceDetail() {
  const router = useRouter();
  const id = router.query.id;
  const projectId = router.query.project as string;
  const resourceId = router.query.resourceId || '11';
  const { update } = useResources(projectId as string);

  const { data: widget, updateConfig } = useWidgetConfig();
  const { previewConfig, updatePreview } =
    useWidgetPreview<ResourceDetailWidgetProps>({
      projectId,
      resourceId: '11',
      api: {
        url: '/api/openstad',
      },
      title: 'Vind je dit een goed idee?',
      variant: 'medium',
    });

  const totalPropPackage = {
    ...widget?.config,
    updateConfig: (config: ResourceDetailWidgetProps) =>
      updateConfig({ ...widget.config, ...config }),

    onFieldChanged: (key: keyof ResourceDetailWidgetProps, value: any) => {
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
            name: 'Resource Detail',
            url: `/projects/${projectId}/widgets/resourcedetail/${id}`,
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
              {/* <TabsTrigger value="sorting">Sorteren</TabsTrigger>
              <TabsTrigger value="pagination">Pagination</TabsTrigger> */}
              <TabsTrigger value="include">Inclusief/exclusief</TabsTrigger>
              <TabsTrigger value="info">Info</TabsTrigger>
            </TabsList>
            <TabsContent value="general" className="p-0">
              <WidgetResourceDetailGeneral {...totalPropPackage} />
            </TabsContent>
            <TabsContent value="display" className="p-0">
              <WidgetResourceDetailDisplay {...totalPropPackage} />
            </TabsContent>
            <TabsContent value="button" className="p-0">
              <WidgetResourceDetailButton {...totalPropPackage} />
            </TabsContent>
            {/* <TabsContent value="sorting" className="p-0">
              <WidgetResourceDetailSorting {...totalPropPackage} />
            </TabsContent>
            <TabsContent value="pagination" className="p-0">
              <WidgetResourceDetailPagination {...totalPropPackage} />
            </TabsContent> */}
            <TabsContent value="search" className="p-0">
              <WidgetResourceDetailSearch {...totalPropPackage} />
            </TabsContent>
            <TabsContent value="tags" className="p-0">
              <WidgetResourceDetailTags {...totalPropPackage} />
            </TabsContent>
            <TabsContent value="include" className="p-0">
              <WidgetResourceDetailInclude {...totalPropPackage} />
            </TabsContent>
            <TabsContent value="info" className="p-0">
              <WidgetResourceDetailInfo {...totalPropPackage} />
            </TabsContent>
          </Tabs>

          <div className="container py-6 mt-6 bg-white rounded-md">
            {previewConfig ? (
              <>
                Preview config gevonden
                <WidgetPreview
                  type="resourcedetail"
                  config={previewConfig}
                  projectId={projectId as string}
                />
              </>
            ) : null}
          </div>
        </div>
      </PageLayout>
    </div>
  );
}
