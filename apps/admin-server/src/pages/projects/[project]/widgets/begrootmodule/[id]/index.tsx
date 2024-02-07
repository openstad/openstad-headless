import React from 'react';
import { PageLayout } from '../../../../../../components/ui/page-layout';
import {
  Tabs,
  TabsContent,
  TabsList,
  TabsTrigger,
} from '../../../../../../components/ui/tabs';
import BegrootmoduleVoting from './voting';
import BegrootmoduleDisplay from './display';
import BegrootmoduleSorting from './sorting';
import BegrootmoduleExplanation from './explanation';
import BegrootmoduleAuthentication from './authentication';
import BegrootmoduleLabels from './label';
import { useRouter } from 'next/router';
import { useWidgetConfig } from '@/hooks/use-widget-config';
import { useWidgetPreview } from '@/hooks/useWidgetPreview';
import { WithApiUrlProps, withApiUrl } from '@/lib/server-side-props-definition';
import WidgetPublish from '@/components/widget-publish';
export const getServerSideProps = withApiUrl
import { StemBegrootWidgetProps } from '@openstad/stem-begroot/src/stem-begroot';
import WidgetPreview from '@/components/widget-preview';


export default function WidgetBegrootModule({ apiUrl }: WithApiUrlProps) {
  const router = useRouter();
  const id = router.query.id;
  const projectId = router.query.project as string;

  const { data: widget, updateConfig } = useWidgetConfig();
  const { previewConfig, updatePreview } = useWidgetPreview<StemBegrootWidgetProps>({
    projectId,
  });
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
            name: 'Begrootmodule',
            url: `/projects/${projectId}/widgets/begrootmodule/${id}`,
          },
        ]}>
        <div className="container py-6">
          <Tabs defaultValue="preview">
            <TabsList className="w-full bg-white border-b-0 mb-4 rounded-md">
              <TabsTrigger value="preview">Preview</TabsTrigger>
              <TabsTrigger value="voting">Stem opties</TabsTrigger>
              <TabsTrigger value="display">Weergave opties</TabsTrigger>
              <TabsTrigger value="sorting">Sorteer opties</TabsTrigger>
              <TabsTrigger value="explanation">Uitleg</TabsTrigger>
              <TabsTrigger value="authentication">Authenticatie</TabsTrigger>
              <TabsTrigger value="labels">Labels</TabsTrigger>
              <TabsTrigger value="publish">Publiceren</TabsTrigger>
            </TabsList>
            <TabsContent value="preview" className="p-0">
              {/* <Preview type="begrootmodule" /> */}
            </TabsContent>
            <TabsContent value="voting" className="p-0">
              <BegrootmoduleVoting />
            </TabsContent>
            <TabsContent value="display" className="p-0">
              <BegrootmoduleDisplay />
            </TabsContent>
            <TabsContent value="sorting" className="p-0">
              <BegrootmoduleSorting />
            </TabsContent>
            <TabsContent value="explanation" className="p-0">
              <BegrootmoduleExplanation />
            </TabsContent>
            <TabsContent value="authentication" className="p-0">
              <BegrootmoduleAuthentication />
            </TabsContent>
            <TabsContent value="labels" className="p-0">
              <BegrootmoduleLabels />
            </TabsContent>
            <TabsContent value="publish" className="p-0">
              <WidgetPublish apiUrl={apiUrl} />
            </TabsContent>
          </Tabs>

          <div className="container py-6 mt-6 bg-white rounded-md">
            {previewConfig && (
              <WidgetPreview
                type="stembegroot"
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
