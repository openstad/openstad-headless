import React from 'react';
import { PageLayout } from '@/components/ui/page-layout';
import useResources from '@/hooks/use-resources';
import { useRouter } from 'next/router';

import ResourceForm from '@/components/resource-form';

export default function ProjectResourceCreate() {
  const router = useRouter();
  const { project } = router.query;
  const { id } = router.query;
  const { update } = useResources(project as string);

  return id ? (
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
            url: `/projects/${project}/resources`,
          },
          {
            name: 'Resources aanpassen',
            url: `/projects/${project}/resources/${id}`,
          },
        ]}>
        <ResourceForm
          onFormSubmit={(values) =>
            update(Number.parseInt(id as string), values)
          }
        />
      </PageLayout>
    </div>
  ) : null;
}
