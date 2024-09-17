import React from 'react';
import { PageLayout } from '../../../../../../components/ui/page-layout';
import { Button } from '../../../../../../components/ui/button';
import {
  Tabs,
  TabsContent,
  TabsList,
  TabsTrigger,
} from '../../../../../../components/ui/tabs';
import { useRouter } from 'next/router';
import {
  WithApiUrlProps,
  withApiUrl,
} from '@/lib/server-side-props-definition';
import WidgetPublish from '@/components/widget-publish';
import { useWidgetConfig } from '@/hooks/use-widget-config';
import { useWidgetPreview } from '@/hooks/useWidgetPreview';
import WidgetPreview from '@/components/widget-preview';
import type { EditorMapWidgetProps } from '@openstad-headless/leaflet-map/src/types/editormap-widget-props';

export const getServerSideProps = withApiUrl;

export default function WidgetEditorMap({ apiUrl }: WithApiUrlProps) {
  const router = useRouter();
  const id = router.query.id;
  const projectId = router.query.project as string;

  const { data: widget, updateConfig } = useWidgetConfig<EditorMapWidgetProps>();
  const { previewConfig, updatePreview } =
    useWidgetPreview<EditorMapWidgetProps>({
      projectId,
    });

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
            name: 'Editor Map',
            url: `/projects/${projectId}/widgets/editormap/${id}`,
          },
        ]}>
        <div className="container py-6">
          <Tabs defaultValue="publish">
            <TabsList className="w-full bg-white border-b-0 mb-4 rounded-md">
              <TabsTrigger value="publish">Publiceren</TabsTrigger>
            </TabsList>
            <TabsContent value="publish" className="p-0">
              <WidgetPublish apiUrl={apiUrl} />
            </TabsContent>
          </Tabs>

          {/* <div className="container py-6 mt-6 bg-white rounded-md">
            {previewConfig && (
              <>
                <WidgetPreview
                  type="editormap"
                  config={previewConfig}
                  projectId={projectId as string}
                />
              </>
            )}
          </div> */}
        </div>
      </PageLayout>
    </div>
  );
}
