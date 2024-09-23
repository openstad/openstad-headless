import WidgetPreview from '@/components/widget-preview';
import WidgetPublish from '@/components/widget-publish';
import { useWidgetConfig } from '@/hooks/use-widget-config';
import { useWidgetPreview } from '@/hooks/useWidgetPreview';
import {
  WithApiUrlProps,
  withApiUrl,
} from '@/lib/server-side-props-definition';
import { EnqueteWidgetProps } from '@openstad-headless/enquete/src/enquete';
import { useRouter } from 'next/router';
import { PageLayout } from '../../../../../../components/ui/page-layout';
import {
  Tabs,
  TabsContent,
  TabsList,
  TabsTrigger,
} from '../../../../../../components/ui/tabs';
import WidgetEnqueteDisplay from './display';
import WidgetEnqueteGeneral from './general';
import WidgetEnqueteItems from './items';
import React from "react";
import WidgetEnqueteConfirmation from "./confirmation";

export const getServerSideProps = withApiUrl;
export default function WidgetEnquete({ apiUrl }: WithApiUrlProps) {
  const router = useRouter();
  const id = router.query.id;
  const projectId = router.query.project as string;

  const { data: widget, updateConfig } = useWidgetConfig<EnqueteWidgetProps>();
  const { previewConfig, updatePreview } = useWidgetPreview<EnqueteWidgetProps>(
    {
      projectId,
    }
  );

  return (
    <div>
      <PageLayout
        pageHeader="Enquête"
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
            name: 'Enquête',
            url: `/projects/${projectId}/widgets/enquete/${id}`,
          },
        ]}>
        <div className="container py-6">
          <Tabs defaultValue="general">
            <TabsList className="w-full bg-white border-b-0 mb-4 rounded-md h-fit flex flex-wrap overflow-auto">
              <TabsTrigger value="general">Algemeen</TabsTrigger>
              <TabsTrigger value="items">Items</TabsTrigger>
              <TabsTrigger value="display">Weergave</TabsTrigger>
              <TabsTrigger value="confirmation">Bevestiging</TabsTrigger>
              <TabsTrigger value="publish">Publiceren</TabsTrigger>
            </TabsList>
            <TabsContent value="general" className="p-0">
              {previewConfig && (
                <WidgetEnqueteGeneral
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
              )}
            </TabsContent>
            <TabsContent value="items" className="p-0">
              {previewConfig && (
                <WidgetEnqueteItems
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
              )}
            </TabsContent>
            <TabsContent value="display" className="p-0">
              {previewConfig && (
                <WidgetEnqueteDisplay
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
              )}
            </TabsContent>
            <TabsContent value="confirmation" className="p-0">
              <WidgetEnqueteConfirmation />
            </TabsContent>
            <TabsContent value="publish" className="p-0">
              <WidgetPublish apiUrl={apiUrl} />
            </TabsContent>
          </Tabs>

          <div className="container py-6 mt-6 bg-white rounded-md">
            {previewConfig && (
              <WidgetPreview
                type="enquete"
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
