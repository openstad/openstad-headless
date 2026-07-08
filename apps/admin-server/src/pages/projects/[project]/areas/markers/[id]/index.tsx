import MarkersEditor from '@/components/markers-editor';
import { PageLayout } from '@/components/ui/page-layout';
import useMarker from '@/hooks/use-marker';
import { useRouter } from 'next/router';
import React, { useState } from 'react';
import toast from 'react-hot-toast';

export default function ProjectMarkersEdit() {
  const router = useRouter();
  const { project, id } = router.query;
  const { data: markersData, updateMarkers } = useMarker(
    project as string,
    id as string
  );
  const [isSaving, setIsSaving] = useState(false);

  async function handleSave(name: string, markers: any[]) {
    setIsSaving(true);
    try {
      await updateMarkers({ name, markers });
      toast.success('Markers opgeslagen');
    } catch (e) {
      toast.error('Markers konden niet worden opgeslagen');
    } finally {
      setIsSaving(false);
    }
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
          isSaving={isSaving}
        />
      </PageLayout>
    </div>
  );
}
