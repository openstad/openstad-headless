import { PageLayout } from '@/components/ui/page-layout';
import {
  getPluginComponent,
  getPluginPageMeta,
} from '@/lib/generated-plugin-registry';
import { GetServerSideProps } from 'next';

type Props = {
  pagePath: string;
  pageHeader: string;
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
  const meta = getPluginPageMeta(requestPath);

  if (!meta) {
    return { notFound: true };
  }

  return {
    props: {
      pagePath: meta.pagePath,
      pageHeader: meta.pageHeader,
      breadcrumbs: [
        { name: 'Home', url: '/' },
        { name: meta.pageHeader, url: `/${requestPath}` },
      ],
    },
  };
};

export default function PluginPage({
  pagePath,
  pageHeader,
  breadcrumbs,
}: Props) {
  const PluginComponent = getPluginComponent(pagePath);

  return (
    <div>
      <PageLayout pageHeader={pageHeader} breadcrumbs={breadcrumbs}>
        <div className="container py-6">
          {PluginComponent ? (
            <PluginComponent />
          ) : (
            <p>Plugin page not found: {pagePath}</p>
          )}
        </div>
      </PageLayout>
    </div>
  );
}
