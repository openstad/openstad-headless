import React from 'react';
import { PageLayout } from '@/components/ui/page-layout';
import useIdeas from '@/hooks/use-ideas';
import { useRouter } from 'next/router';
import IdeaForm from '@/components/idea-form';

export default function ProjectIdeaCreate() {
  const router = useRouter();
  const { project } = router.query;
  const { create } = useIdeas(project as string);

  return (
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
            name: 'Idee toevoegen',
            url: `/projects/${project}/ideas/create`,
          },
        ]}>
        <IdeaForm onFormSubmit={(body) => create(body)} />
      </PageLayout>
    </div>
  );
}
