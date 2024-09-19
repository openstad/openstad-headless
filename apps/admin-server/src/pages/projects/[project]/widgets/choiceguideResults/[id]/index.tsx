import React, { useEffect } from 'react';
import { PageLayout } from '../../../../../../components/ui/page-layout';
import { useRouter } from 'next/router';
import {
  Tabs,
  TabsContent,
  TabsList,
  TabsTrigger,
} from '../../../../../../components/ui/tabs';
import { WithApiUrlProps, withApiUrl } from '@/lib/server-side-props-definition';
import WidgetPublish from '@/components/widget-publish';
import { useWidgetConfig } from '@/hooks/use-widget-config';
import { useWidgetPreview } from '@/hooks/useWidgetPreview';
import WidgetPreview from '@/components/widget-preview';
import ChoiceGuideResultSettings from "./settings";
import { ChoiceGuideResultsProps } from '@openstad-headless/choiceguide-results/src/props';

export const getServerSideProps = withApiUrl;

export default function WidgetChoiceGuide({
  apiUrl,
}: WithApiUrlProps) {
  const router = useRouter();
  const id = router.query.id;
  const projectId = router.query.project as string;

  const { data: widget, updateConfig } = useWidgetConfig<ChoiceGuideResultsProps>();
  const { previewConfig, updatePreview } = useWidgetPreview<ChoiceGuideResultsProps>({
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
            name: 'Keuzewijzer',
            url: `/projects/${projectId}/widgets/keuzewijzer/${id}`,
          },
        ]}>
        <div className="container py-6">
          <Tabs defaultValue="settings">
            <TabsList className="w-full bg-white border-b-0 mb-4 rounded-md">
              <TabsTrigger value="settings">Instellingen</TabsTrigger>
              <TabsTrigger value="publish">Publiceren</TabsTrigger>
            </TabsList>
            <TabsContent value="settings" className="p-0">
              {previewConfig ? (
                  <ChoiceGuideResultSettings
                      {...previewConfig}
                      updateConfig={(config) =>
                          updateConfig({ ...widget.config, ...config })
                      }
                      onFieldChanged={(key, value) => {
                        if (previewConfig) {
                          updatePreview({
                            ...previewConfig,
                            [key]: value,
                          });
                        }
                      }}
                  />
              ) : null}
            </TabsContent>
            <TabsContent value="publish" className="p-0">
              <WidgetPublish apiUrl={apiUrl} />
            </TabsContent>
          </Tabs>

          {/*<div className='py-6 mt-6 bg-white rounded-md'>*/}
          {/*    {previewConfig ? (*/}
          {/*      <WidgetPreview*/}
          {/*        type="choiceguideResults"*/}
          {/*        config={previewConfig}*/}
          {/*        projectId={projectId as string}*/}
          {/*      />*/}
          {/*    ) : null}*/}
          {/*  </div>*/}
        </div>
      </PageLayout>
    </div>
  );
}
