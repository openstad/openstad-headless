import React from 'react';
import { PageLayout } from '@/components/ui/page-layout';
import useImageResources from '@/hooks/use-image-resources';
import { useRouter } from 'next/router';

import ResourceForm from '@/components/resource-form';

export default function ProjectResourceCreate() {
  const router = useRouter();
  const { project } = router.query;
  const { id } = router.query;
  const { update } = useImageResources(project as string);

  return id ? (
    <div>
        <ResourceForm
          onFormSubmit={(values) =>
            update(Number.parseInt(id as string), values)
          }
        />
    </div>
  ) : null;
}
