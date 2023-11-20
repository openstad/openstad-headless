import React from 'react';
import { PageLayout } from '../../../../../../components/ui/page-layout';
import { useRouter } from 'next/router';
import ChoicesSelectorForm from './form';

export default function WidgetKeuzewijzer() {
  const router = useRouter();
  const id = router.query.id;
  const projectId = router.query.project;
  return (
    <div>
      <PageLayout
        pageHeader="Project naam"
        breadcrumbs={[
          {
            name: 'Projecten',
            url: '/projects',
          },
          {
            name: 'Widgets',
            url: `/projects/${projectId}/widgets`,
          },
          {
            name: 'Keuzewijzer',
            url: `/projects/${projectId}/widgets/keuzewijzer/${id}`,
          },
        ]}>
        <div className="container py-6">
          <div className="p-6 bg-white rounded-md">
            <ChoicesSelectorForm />
          </div>
        </div>
      </PageLayout>
    </div>
  );
}
