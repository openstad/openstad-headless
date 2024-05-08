import React from 'react';
import { PageLayout } from '@/components/ui/page-layout';
import useImageResources from '@/hooks/use-image-resources';
import { useRouter } from 'next/router';
import ResourceForm from '@/components/resource-form';

export default function ProjectResourceCreate() {
  const router = useRouter();
  const { project } = router.query;
  const { create } = useImageResources(project as string);

  return (
    <div>
      <PageLayout
        pageHeader="Resources"
        breadcrumbs={[
          {
            name: 'Projecten',
            url: '/projects',
          },
          {
            name: 'Resources',
            url: `/projects/${project}/image-resources`,
          },
          {
            name: 'Resource toevoegen',
            url: `/projects/${project}/image-resources/create`,
          },
        ]}>
        <ResourceForm onFormSubmit={(body) => create(body)} />
      </PageLayout>
    </div>
  );
}
