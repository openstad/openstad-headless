import React, { useEffect } from 'react';
import { PageLayout } from '../../../../../../components/ui/page-layout';
import { useRouter } from 'next/router';
import ChoicesSelectorForm from './form';
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
import WidgetChoiceGuideItems from "@/pages/projects/[project]/widgets/choiceguide/[id]/items";
import WidgetChoiceGuideChoiceOptions from "@/pages/projects/[project]/widgets/choiceguide/[id]/choiceOptions";
import WidgetChoiceGuideGeneralSettings from "@/pages/projects/[project]/widgets/choiceguide/[id]/settings";
import {Alert, AlertDescription, AlertTitle} from "@/components/ui/alert";
import WidgetResourcesMapDatalayers from "@/pages/projects/[project]/widgets/resourcesmap/[id]/datalayers";
import {ChoiceGuideProps} from "../../../../../../../../../packages/choiceguide/src/props";

export const getServerSideProps = withApiUrl;

export default function WidgetChoiceGuide({
  apiUrl,
}: WithApiUrlProps) {
  const router = useRouter();
  const id = router.query.id;
  const projectId = router.query.project as string;

  const { data: widget, updateConfig } = useWidgetConfig<ChoiceGuideProps>();
  const { previewConfig, updatePreview } = useWidgetPreview<ChoiceGuideProps>({
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
            name: 'Keuzewijzer',
            url: `/projects/${projectId}/widgets/keuzewijzer/${id}`,
          },
        ]}>
        <div className="container py-6">
          <Tabs defaultValue="form">
            <TabsList className="w-full bg-white border-b-0 mb-4 rounded-md">
              <TabsTrigger value="form">Formulier instellingen</TabsTrigger>
              <TabsTrigger value="items">Velden</TabsTrigger>
              <TabsTrigger value="choiceOptions">Keuze opties</TabsTrigger>
              <TabsTrigger value="generalSettings">Algemene instellingen</TabsTrigger>
              <TabsTrigger value="datalayers">Kaart opties</TabsTrigger>
              <TabsTrigger value="publish">Publiceren</TabsTrigger>
            </TabsList>
            <TabsContent value="form" className="p-0">
              <ChoicesSelectorForm />
            </TabsContent>
            <TabsContent value="items" className="p-0">
              {previewConfig && (
                // @ts-ignore
                <WidgetChoiceGuideItems
                  {...previewConfig}
                  updateConfig={(config) =>
                    // @ts-ignore
                    updateConfig({ ...widget.config, ...config })
                  }
                  onFieldChanged={(key: string, value: any) => {
                    if (previewConfig) {
                      updatePreview({
                        ...previewConfig,
                        [key]: value,
                      });
                    }
                  }}
                />
              )}
            </TabsContent>
            <TabsContent value="choiceOptions" className="p-0">
              <WidgetChoiceGuideChoiceOptions />
            </TabsContent>
            <TabsContent value="generalSettings" className="p-0">
              <WidgetChoiceGuideGeneralSettings />
            </TabsContent>
            <TabsContent value="datalayers" className="p-0">
              {previewConfig && (
                <>
                  <Alert variant="info" className="mb-4">
                    <AlertTitle>Let op!</AlertTitle>
                    <AlertDescription>
                      De kaartopties zijn alleen van toepassing als je een veld hebt die een kaart bevat.
                    </AlertDescription>
                  </Alert>
                  <WidgetResourcesMapDatalayers
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
                </>
              )}
            </TabsContent>
            <TabsContent value="publish" className="p-0">
              <WidgetPublish apiUrl={apiUrl} />
            </TabsContent>
          </Tabs>

          <div className='py-6 mt-6 bg-white rounded-md'>
              {previewConfig ? (
                <WidgetPreview
                  type="choiceguide"
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
