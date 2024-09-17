import React from 'react';
import { PageLayout } from '../../../../../../components/ui/page-layout';
import {
  Tabs,
  TabsContent,
  TabsList,
  TabsTrigger,
} from '../../../../../../components/ui/tabs';

import { useRouter } from 'next/router';
import { useWidgetConfig } from '@/hooks/use-widget-config';
import { useWidgetPreview } from '@/hooks/useWidgetPreview';
import type { DocumentMapProps } from '@openstad-headless/document-map/src/document-map';
import WidgetPreview from '@/components/widget-preview';
import WidgetPublish from '@/components/widget-publish';
import { WithApiUrlProps, withApiUrl } from '@/lib/server-side-props-definition';
import DocumentGeneral from './general';
import DocumentLinks from './links';
import LikesDisplay from '../../likes/[id]/weergave';
import { LikeWidgetTabProps } from '../../likes/[id]';
import { extractConfig } from '@/lib/sub-widget-helper';
import DocumentInclude from './include';
import DocumentExtraFields from './extraFields';
import DocumentFilters from './filters';
import DocumentContent from './content';

export const getServerSideProps = withApiUrl;

export default function WidgetDateCountdownBar({
  apiUrl,
}: WithApiUrlProps) {
  const router = useRouter();
  const id = router.query.id;
  const projectId = router.query.project;

  const { data: widget, updateConfig } = useWidgetConfig<DocumentMapProps>();
  const { previewConfig, updatePreview } =
    useWidgetPreview<DocumentMapProps>({});

  const totalPropPackage = {
    ...widget?.config,
    updateConfig: (config: DocumentMapProps) =>
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
            name: 'Interactieve afbeelding',
            url: `/projects/${projectId}/widgets/documentmap/${id}`,
          },
        ]}>
        <div className="container py-6">
          <Tabs defaultValue="general">
            <TabsList className="w-full bg-white border-b-0 mb-4 rounded-md h-fit flex flex-wrap overflow-auto">
              <TabsTrigger value="general">Algemeen</TabsTrigger>
              <TabsTrigger value="links">Links</TabsTrigger>
              <TabsTrigger value="likes">Likes widget</TabsTrigger>
              <TabsTrigger value="include">Inclusief / exclusief</TabsTrigger>
              <TabsTrigger value="filters">Filters</TabsTrigger>
              <TabsTrigger value="extraFields">Extra velden</TabsTrigger>
              <TabsTrigger value="text">Content</TabsTrigger>
              <TabsTrigger value="publish">Publiceren</TabsTrigger>
            </TabsList>
            <TabsContent value="general" className="p-0">
              {previewConfig ?
                <DocumentGeneral {...totalPropPackage} projectId={projectId as string} {...previewConfig} />
                : null}
            </TabsContent>
            <TabsContent value="links" className="p-0">
              {previewConfig ?
                <DocumentLinks {...totalPropPackage} projectId={projectId as string} {...previewConfig} />
                : null}
            </TabsContent>
            <TabsContent value="include" className="p-0">
              {previewConfig ?
                  <DocumentInclude {...totalPropPackage} projectId={projectId as string} {...previewConfig} />
                  : null}
            </TabsContent>
            <TabsContent value="filters" className="p-0">
              {previewConfig ?
                  <DocumentFilters {...totalPropPackage} projectId={projectId as string} {...previewConfig} />
                  : null}
            </TabsContent>
            <TabsContent value="extraFields" className="p-0">
              {previewConfig ?
                  <DocumentExtraFields {...totalPropPackage} projectId={projectId as string} {...previewConfig} />
                  : null}
            </TabsContent>
            <TabsContent value="text" className="p-0">
              {previewConfig ?
                  <DocumentContent {...totalPropPackage} projectId={projectId as string} {...previewConfig} />
                  : null}
            </TabsContent>
            <TabsContent value="likes" className="p-0">
              {previewConfig && (
                <LikesDisplay
                  omitSchemaKeys={['resourceId']}
                  {...extractConfig<
                    DocumentMapProps,
                    LikeWidgetTabProps
                  >({
                    subWidgetKey: 'likeWidget',
                    previewConfig: previewConfig,
                    updateConfig,
                    updatePreview,
                  })}
                />
              )}
            </TabsContent>
            <TabsContent value="publish" className="p-0">
              <WidgetPublish apiUrl={apiUrl} />
            </TabsContent>
          </Tabs>

          <div className="py-6 mt-6 bg-white rounded-md">
            {previewConfig ? (
              <WidgetPreview
                type="documentmap"
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
