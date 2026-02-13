import ResourceForm from '@/components/resource-form';
import { PageLayout } from '@/components/ui/page-layout';
import useResources from '@/hooks/use-resources';
import { useRouter } from 'next/router';
import React from 'react';

export default function ProjectResourceCreate() {
  const router = useRouter();
  const { project } = router.query;
  const { id } = router.query;
  const { update } = useResources(project as string, true);

  return id ? (
    <div>
      <ResourceForm
        onFormSubmit={(values) => update(Number.parseInt(id as string), values)}
      />
    </div>
  ) : null;
}
