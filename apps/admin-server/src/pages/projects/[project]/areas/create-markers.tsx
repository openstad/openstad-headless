import MarkersEditor from '@/components/markers-editor';
import { PageLayout } from '@/components/ui/page-layout';
import { useSaveController } from '@/components/ui/save-controller';
import useMarkers from '@/hooks/use-markers';
import { useRouter } from 'next/router';
import React from 'react';
import toast from 'react-hot-toast';

export default function ProjectMarkersCreate() {
  const router = useRouter();
  const { project } = router.query;
  const { createMarkers } = useMarkers(project as string);
  const { allowNextNavigation } = useSaveController();

  // The global save bar reports saving, success and failure itself, so a
  // failure has to propagate instead of becoming a toast.
  async function handleSave(name: string, markers: any[]) {
    const result = await createMarkers(name, markers);
    if (!result?.id) {
      throw new Error('Markers kon niet worden aangemaakt');
    }

    // Freshly created markers are not an unsaved edit, so opening the new
    // record must not prompt about leaving this page.
    allowNextNavigation();
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
