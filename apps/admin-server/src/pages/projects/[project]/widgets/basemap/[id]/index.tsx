import { Button } from '@/components/ui/button';
import { Form } from '@/components/ui/form';
import { MapDimensionFields } from '@/components/ui/map-dimension-fields';
import { Separator } from '@/components/ui/separator';
import { Heading } from '@/components/ui/typography';
import WidgetPreview from '@/components/widget-preview';
import WidgetPublish from '@/components/widget-publish';
import { useWidgetConfig } from '@/hooks/use-widget-config';
import { useWidgetPreview } from '@/hooks/useWidgetPreview';
import {
  WithApiUrlProps,
  withApiUrl,
} from '@/lib/server-side-props-definition';
import { zodResolver } from '@hookform/resolvers/zod';
import type { BaseMapWidgetProps } from '@openstad-headless/leaflet-map/src/types/basemap-widget-props';
import { useRouter } from 'next/router';
import React, { useCallback, useEffect } from 'react';
import { useForm } from 'react-hook-form';
import * as z from 'zod';

import { PageLayout } from '../../../../../../components/ui/page-layout';
import {
  Tabs,
  TabsContent,
  TabsList,
  TabsTrigger,
} from '../../../../../../components/ui/tabs';

export const getServerSideProps = withApiUrl;

const formSchema = z.object({
  width: z.string().optional(),
  height: z.string().optional(),
});

type FormData = z.infer<typeof formSchema>;

export default function WidgetBaseMap({ apiUrl }: WithApiUrlProps) {
  const router = useRouter();
  const id = router.query.id;
  const projectId = router.query.project as string;

  const { data: widget, updateConfig } = useWidgetConfig<BaseMapWidgetProps>();
  const { previewConfig, updatePreview } = useWidgetPreview<BaseMapWidgetProps>(
    {
      projectId,
    }
  );

  const defaults = useCallback(
    () => ({
      width: widget?.config?.width || '',
      height: widget?.config?.height || '',
    }),
    [widget?.config?.width, widget?.config?.height]
  );

  const form = useForm<FormData>({
    resolver: zodResolver(formSchema),
    defaultValues: defaults(),
  });

  useEffect(() => {
    form.reset(defaults());
  }, [defaults]);

  async function onSubmit(values: FormData) {
    try {
      await updateConfig({ ...widget.config, ...values });
    } catch (error) {
      console.error('could not update', error);
    }
  }

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
            name: 'Base Map',
            url: `/projects/${projectId}/widgets/basemap/${id}`,
          },
        ]}>
        <div className="container py-6">
          <Tabs defaultValue="map">
            <TabsList className="w-full bg-white border-b-0 mb-4 rounded-md">
              <TabsTrigger value="map">Kaart</TabsTrigger>
              <TabsTrigger value="publish">Publiceren</TabsTrigger>
            </TabsList>
            <TabsContent value="map" className="p-0">
              <div className="p-6 bg-white rounded-md">
                <Form {...form}>
                  <Heading size="xl">Kaart</Heading>
                  <Separator className="my-4" />
                  <form
                    onSubmit={form.handleSubmit(onSubmit)}
                    className="space-y-4 lg:w-1/2">
                    <MapDimensionFields
                      form={form}
                      onFieldChange={(name, value) => {
                        if (previewConfig) {
                          updatePreview({
                            ...previewConfig,
                            [name]: value,
                          });
                        }
                      }}
                    />
                    <Button type="submit">Opslaan</Button>
                  </form>
                </Form>
              </div>
            </TabsContent>
            <TabsContent value="publish" className="p-0">
              <WidgetPublish apiUrl={apiUrl} />
            </TabsContent>
          </Tabs>

          <div className="container py-6 mt-6 bg-white rounded-md">
            {previewConfig && (
              <>
                <WidgetPreview
                  type="basemap"
                  config={previewConfig}
                  projectId={projectId as string}
                />
              </>
            )}
          </div>
        </div>
      </PageLayout>
    </div>
  );
}
