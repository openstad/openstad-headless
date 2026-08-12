import AuditLogTable from '@/components/audit-log-table';
import WidgetPublish from '@/components/widget-publish';
import { flushAllFields } from '@/hooks/useFieldDebounce';
import { useWidgetDraft } from '@/hooks/useWidgetDraft';
import {
  WithApiUrlProps,
  withApiUrl,
} from '@/lib/server-side-props-definition';
import { useRouter } from 'next/router';
import React, { useState } from 'react';

import { PageLayout } from '../../../../../../components/ui/page-layout';
import {
  Tabs,
  TabsContent,
  TabsList,
  TabsTrigger,
} from '../../../../../../components/ui/tabs';
import WidgetMapContent from './content';
import WidgetMapDetails from './details';
import WidgetMapFilter from './filter';
import WidgetMapGeneral from './general';
import WidgetMapImage from './images';
import WidgetMapLegend from './legend';
import WidgetMapMap from './map';
import WidgetMapMarkers from './markers';
import WidgetMapReaction from './reaction';
import WidgetMapSort from './sort';

export const getServerSideProps = withApiUrl;

export default function WidgetMap({ apiUrl }: WithApiUrlProps) {
  const router = useRouter();
  const id = router.query.id;
  const projectId = router.query.project as string;

  const { widget, previewConfig, updateConfig, onFieldChanged } =
    useWidgetDraft<any>({ projectId });

  const [activeTab, setActiveTab] = useState('preview');

  const onTabChange = (value: string) => {
    flushAllFields();
    setActiveTab(value);
  };

  const tabUpdateConfig = (config: any) =>
    updateConfig({ ...widget?.config, ...config });

  const totalPropPackage = {
    ...widget?.config,
    ...previewConfig,
    updateConfig: tabUpdateConfig,
    onFieldChanged,
  };

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
            name: 'Map',
            url: `/projects/${projectId}/widgets/map/${id}`,
          },
        ]}>
        <div className="container py-6">
          <Tabs value={activeTab} onValueChange={onTabChange}>
            <TabsList className="w-full bg-white border-b-0 mb-4 rounded-md h-fit flex flex-wrap overflow-auto">
              <TabsTrigger value="preview">Preview</TabsTrigger>
              <TabsTrigger value="general">Algemeen</TabsTrigger>
              <TabsTrigger value="map">Kaart</TabsTrigger>
              <TabsTrigger value="content">Content</TabsTrigger>
              <TabsTrigger value="sort">Sorteren</TabsTrigger>
              <TabsTrigger value="images">Resource afbeeldingen</TabsTrigger>
              <TabsTrigger value="details">Resource details</TabsTrigger>
              <TabsTrigger value="filter">Filterbalk</TabsTrigger>
              <TabsTrigger value="reaction">Reacties</TabsTrigger>
              <TabsTrigger value="markerSets">Markers</TabsTrigger>
              <TabsTrigger value="legend">Legenda</TabsTrigger>
              <TabsTrigger value="publish">Publiceren</TabsTrigger>
              <TabsTrigger value="auditlog">Logboek</TabsTrigger>
            </TabsList>
            <TabsContent value="preview" className="p-0">
              {/* <Preview type="map" /> */}
            </TabsContent>
            <TabsContent value="general" className="p-0">
              {previewConfig ? (
                <WidgetMapGeneral {...totalPropPackage} />
              ) : null}
            </TabsContent>
            <TabsContent value="map" className="p-0">
              {previewConfig ? <WidgetMapMap {...totalPropPackage} /> : null}
            </TabsContent>
            <TabsContent value="content" className="p-0">
              {previewConfig ? (
                <WidgetMapContent {...totalPropPackage} />
              ) : null}
            </TabsContent>
            <TabsContent value="sort" className="p-0">
              {previewConfig ? <WidgetMapSort {...totalPropPackage} /> : null}
            </TabsContent>
            <TabsContent value="images" className="p-0">
              {previewConfig ? <WidgetMapImage {...totalPropPackage} /> : null}
            </TabsContent>
            <TabsContent value="details" className="p-0">
              {previewConfig ? (
                <WidgetMapDetails {...totalPropPackage} />
              ) : null}
            </TabsContent>
            <TabsContent value="filter" className="p-0">
              {previewConfig ? <WidgetMapFilter {...totalPropPackage} /> : null}
            </TabsContent>
            <TabsContent value="reaction" className="p-0">
              {previewConfig ? (
                <WidgetMapReaction {...totalPropPackage} />
              ) : null}
            </TabsContent>
            <TabsContent value="markerSets" className="p-0">
              {previewConfig ? (
                <WidgetMapMarkers {...totalPropPackage} />
              ) : null}
            </TabsContent>
            <TabsContent value="legend" className="p-0">
              {previewConfig ? <WidgetMapLegend {...totalPropPackage} /> : null}
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
        </div>
      </PageLayout>
    </div>
  );
}
