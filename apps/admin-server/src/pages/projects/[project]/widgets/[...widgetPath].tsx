import { PageLayout } from '@/components/ui/page-layout';
import { Tabs, TabsContent, TabsList, TabsTrigger } from '@/components/ui/tabs';
import WidgetPublish from '@/components/widget-publish';
import { useWidgetConfig } from '@/hooks/use-widget-config';
import { useWidgetDefinitions } from '@/hooks/use-widget-definitions';
import { getPluginComponent } from '@/lib/generated-plugin-registry';
import {
  WithApiUrlProps,
  withApiUrl,
} from '@/lib/server-side-props-definition';
import { useRouter } from 'next/router';

export const getServerSideProps = withApiUrl;

export default function PluginWidgetPage({ apiUrl }: WithApiUrlProps) {
  const router = useRouter();
  const segments = router.query.widgetPath;
  const projectId = router.query.project as string;

  const { data: widget, updateConfig } = useWidgetConfig();
  const widgetDefinitions = useWidgetDefinitions();

  if (!Array.isArray(segments) || segments.length < 2) {
    return <p>Widget niet gevonden</p>;
  }

  const widgetType = segments[0];
  const widgetDisplayName = widgetDefinitions[widgetType]?.name || widgetType;
  const AdminComponent = getPluginComponent(`widget:${widgetType}`);

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
              {widget && AdminComponent ? (
                <AdminComponent
                  config={widget.config}
                  updateConfig={(config: any) => updateConfig(config)}
                />
              ) : widget && !AdminComponent ? (
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
              <WidgetPublish apiUrl={apiUrl} />
            </TabsContent>
          </Tabs>
        </div>
      </PageLayout>
    </div>
  );
}
