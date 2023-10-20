import React from 'react';
import { PageLayout } from '@/components/ui/page-layout';
import useIdeas from '@/hooks/use-ideas';
import { useRouter } from 'next/router';

import IdeaForm from '@/components/idea-form';

export default function ProjectIdeaCreate() {
  const router = useRouter();
  const { project } = router.query;
  const { id } = router.query;
  const { update } = useIdeas(project as string);

  return id ? (
    <div>
      <PageLayout
        pageHeader="Ideeën"
        breadcrumbs={[
          {
            name: 'Projecten',
            url: '/projects',
          },
          {
            name: 'Ideeën',
            url: `/projects/${project}/ideas`,
          },
          {
            name: 'Ideeën aanpassen',
            url: `/projects/${project}/ideas/${id}`,
          },
        ]}>
        <IdeaForm
          onFormSubmit={(values) =>
            update(Number.parseInt(id as string), values)
          }
        />
      </PageLayout>
    </div>
  ) : null;
}
