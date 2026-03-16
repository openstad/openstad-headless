import PluginComponentLoader from '@/components/plugin-component-loader';
import { PageLayout } from '@/components/ui/page-layout';
import { Tabs, TabsContent, TabsList, TabsTrigger } from '@/components/ui/tabs';
import WidgetPreview from '@/components/widget-preview';
import WidgetPublish from '@/components/widget-publish';
import { useWidgetConfig } from '@/hooks/use-widget-config';
import { useWidgetDefinitions } from '@/hooks/use-widget-definitions';
import { useWidgetPreview } from '@/hooks/useWidgetPreview';
import {
  WithApiUrlProps,
  withApiUrl,
} from '@/lib/server-side-props-definition';
import { useRouter } from 'next/router';
import { useEffect, useMemo, useState } from 'react';

type WidgetAdminComponent = {
  pluginName: string;
  componentName: string;
};

type PluginRegistry = {
  widgetAdminComponents: Record<string, WidgetAdminComponent>;
};

export const getServerSideProps = withApiUrl;

export default function PluginWidgetPage({ apiUrl }: WithApiUrlProps) {
  const router = useRouter();
  const segments = router.query.widgetPath;
  const projectId = router.query.project as string;

  const widgetId =
    Array.isArray(segments) && segments.length >= 2 ? segments[1] : undefined;
  const { data: widget, updateConfig } = useWidgetConfig(widgetId);
  const widgetDefinitions = useWidgetDefinitions();
  const { previewConfig, updatePreview } = useWidgetPreview(
    {
      projectId,
    },
    widgetId
  );

  const [pluginRegistry, setPluginRegistry] = useState<PluginRegistry | null>(
    null
  );

  useEffect(() => {
    fetch('/api/openstad/api/plugin/registry')
      .then((res) => (res.ok ? res.json() : null))
      .then((data) => setPluginRegistry(data))
      .catch(() => {});
  }, []);

  const pluginProps = useMemo(
    () => ({
      config: widget?.config || {},
      updateConfig: (config: any) => {
        updateConfig(config);
        if (previewConfig) {
          updatePreview({
            ...previewConfig,
            ...config,
          });
        }
      },
    }),
    [widget?.config, previewConfig, updateConfig, updatePreview]
  );

  if (!Array.isArray(segments) || segments.length < 2) {
    return <p>Widget niet gevonden</p>;
  }

  const widgetType = segments[0];
  const widgetDisplayName = widgetDefinitions[widgetType]?.name || widgetType;

  const pluginWidgetAdmin = pluginRegistry?.widgetAdminComponents?.[widgetType];

  return (
    <div>
      <PageLayout
        breadcrumbs={[
          { name: 'Projecten', url: '/projects' },
          { name: 'Widgets', url: `/projects/${projectId}/widgets` },
          {
            name: widgetDisplayName,
            url: `/projects/${projectId}/widgets/${segments[0]}/${segments[1]}`,
          },
        ]}>
        <div className="container py-6">
          <Tabs defaultValue="settings">
            <TabsList className="w-full bg-white border-b-0 mb-4 rounded-md">
              <TabsTrigger value="settings">Instellingen</TabsTrigger>
              <TabsTrigger value="publish">Publiceren</TabsTrigger>
            </TabsList>
            <TabsContent value="settings" className="p-0">
              {widget && pluginWidgetAdmin ? (
                <PluginComponentLoader
                  pluginName={pluginWidgetAdmin.pluginName}
                  bundleType="widget-admin"
                  componentName={pluginWidgetAdmin.componentName}
                  props={pluginProps}
                  apiUrl={apiUrl}
                />
              ) : widget && !pluginWidgetAdmin ? (
                <div className="p-6 bg-white rounded-md">
                  <p>
                    Geen configuratiepagina beschikbaar voor widget type &quot;
                    {widgetType}&quot;.
                  </p>
                  <pre className="mt-4 p-4 bg-gray-50 rounded text-sm overflow-auto">
                    {JSON.stringify(widget.config, null, 2)}
                  </pre>
                </div>
              ) : null}
            </TabsContent>
            <TabsContent value="publish" className="p-0">
              <WidgetPublish apiUrl={apiUrl} idOverride={widgetId} />
            </TabsContent>
          </Tabs>

          <div className="py-6 mt-6 bg-white rounded-md">
            {previewConfig && (
              <WidgetPreview
                type={widgetType}
                config={previewConfig}
                projectId={projectId}
              />
            )}
          </div>
        </div>
      </PageLayout>
    </div>
  );
}
