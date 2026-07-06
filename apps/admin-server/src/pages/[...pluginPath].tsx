import PluginComponentLoader from '@/components/plugin-component-loader';
import { PageLayout } from '@/components/ui/page-layout';
import { GetServerSideProps } from 'next';

type PluginPageInfo = {
  path: string;
  componentName: string;
  pluginName: string;
  label: string;
};

type Props = {
  page: PluginPageInfo;
  apiUrl: string;
  breadcrumbs: { name: string; url: string }[];
};

export const getServerSideProps: GetServerSideProps<Props> = async (
  context
) => {
  const segments = context.params?.pluginPath;
  if (!segments || !Array.isArray(segments)) {
    return { notFound: true };
  }

  const requestPath = segments.join('/');
  const apiUrl = process.env.API_URL_INTERNAL || process.env.API_URL || '';

  try {
    const res = await fetch(`${apiUrl}/api/plugin/registry`);
    if (!res.ok) {
      return { notFound: true };
    }

    const registry = await res.json();
    const page = (registry.pages || []).find(
      (p: PluginPageInfo) => p.path === requestPath
    );

    if (!page) {
      return { notFound: true };
    }

    return {
      props: {
        page,
        apiUrl: process.env.API_URL || '',
        breadcrumbs: [
          { name: 'Home', url: '/' },
          { name: page.label, url: `/${requestPath}` },
        ],
      },
    };
  } catch {
    return { notFound: true };
  }
};

export default function PluginPage({ page, apiUrl, breadcrumbs }: Props) {
  return (
    <div>
      <PageLayout pageHeader={page.label} breadcrumbs={breadcrumbs}>
        <div className="container py-6">
          <PluginComponentLoader
            pluginName={page.pluginName}
            bundleType="admin"
            componentName={page.componentName}
            apiUrl={apiUrl}
          />
        </div>
      </PageLayout>
    </div>
  );
}
