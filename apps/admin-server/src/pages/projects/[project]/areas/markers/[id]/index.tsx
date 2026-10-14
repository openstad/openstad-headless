import MarkersEditor from '@/components/markers-editor';
import { PageLayout } from '@/components/ui/page-layout';
import useMarker from '@/hooks/use-marker';
import { useRouter } from 'next/router';
import React from 'react';

export default function ProjectMarkersEdit() {
  const router = useRouter();
  const { project, id } = router.query;
  const { data: markersData, updateMarkers } = useMarker(
    project as string,
    id as string
  );

  // The global save bar reports saving, success and failure itself, so this
  // must let a failure propagate instead of turning it into a toast — a
  // swallowed error would leave the bar claiming the save succeeded.
  async function handleSave(name: string, markers: any[]) {
    await updateMarkers({ name, markers });
  }

  if (!markersData) return null;

  return (
    <div>
      <PageLayout
        breadcrumbs={[
          { name: 'Projecten', url: '/projects' },
          { name: 'Polygonen', url: `/projects/${project}/areas` },
          {
            name: markersData?.name || 'Markers bewerken',
            url: `/projects/${project}/areas/markers/${id}`,
          },
        ]}>
        <MarkersEditor
          initialName={markersData.name}
          initialMarkers={markersData.markers || []}
          project={project as string}
          onSave={handleSave}
        />
      </PageLayout>
    </div>
  );
}
