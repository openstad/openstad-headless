import MarkersEditor from '@/components/markers-editor';
import { PageLayout } from '@/components/ui/page-layout';
import useMarkers from '@/hooks/use-markers';
import { useRouter } from 'next/router';
import React from 'react';
import toast from 'react-hot-toast';

export default function ProjectMarkersCreate() {
  const router = useRouter();
  const { project } = router.query;
  const { createMarkers } = useMarkers(project as string);

  async function handleSave(name: string, markers: any[]) {
    const result = await createMarkers(name, markers);
    if (!result?.id) {
      throw new Error('Markers kon niet worden aangemaakt');
    }

    toast.success('Markers succesvol aangemaakt');
    router.push(`/projects/${project}/areas/markers/${result.id}`);
  }

  return (
    <div>
      <PageLayout
        breadcrumbs={[
          { name: 'Projecten', url: '/projects' },
          { name: 'Polygonen', url: `/projects/${project}/areas` },
          {
            name: 'Markers toevoegen',
            url: `/projects/${project}/areas/create-markers`,
          },
        ]}>
        <MarkersEditor
          initialName=""
          initialMarkers={[]}
          project={project as string}
          onSave={handleSave}
        />
      </PageLayout>
    </div>
  );
}
